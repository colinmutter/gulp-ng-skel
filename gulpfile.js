/**
 * Build Dependencies
 */
var fs = require('fs'),
  merge = require('merge-stream'),
  gulp = require('gulp'),
  angularFilesort = require('gulp-angular-filesort'),
  gutil = require('gulp-util'),
  jshint = require('gulp-jshint'),
  ngAnnotate = require('gulp-ng-annotate'),
  uglify = require('gulp-uglifyjs'),
  htmlmin = require('gulp-minify-html'),
  templateCache = require('gulp-angular-templatecache'),
  cssmin = require('gulp-minify-css'),
  concat = require('gulp-concat'),
  rimraf = require('gulp-rimraf'),
  rename = require('gulp-rename'),
  size = require('gulp-size'),
  newer = require('gulp-newer'),
  imagemin = require('gulp-imagemin'),
  pngcrush = require('imagemin-pngcrush'),
  flatten = require('gulp-flatten'),
  taskListing = require('gulp-task-listing');

/**
 * ======================================
 * ===  PATHS  ==========================
 * ======================================
 */

/**
 * Define root project paths
 * @type {Object}
 */
var paths = {
  build: 'dist/',
  app: 'src/',
  assets: 'src/assets/',
  tmp: 'tmp/',
  vendor: 'vendor/standalone/',
  bower: 'vendor/bower/'
};


/**
 * Define source globs
 * @type {Object}
 */
var sources = {
  js: [
    paths.app + 'common/**/*.js',
    paths.app + 'app/**/*.js'
  ],
  // Assets can be stored within component directories as well
  images: [
    paths.app + '**/*.png',
    paths.app + '**/*.jpg',
    paths.app + '**/*.jpeg',
    paths.app + '**/*.gif',
    paths.app + '**/*.webp'
  ],
  css: paths.app + '**/*.css',
  tpl: paths.app + '**/*.tpl.html',
  html: [paths.app + '**/*.html', '!**/*.tpl.html'],
  // Will get concatenated to libs.js
  vendorjs: [
    // Common deps
    paths.bower + 'jquery/jquery.min.js',
    paths.bower + 'underscore/underscore.js',
    paths.bower + 'bootstrap/dist/js/bootstrap.min.js',
    paths.bower + 'angular/angular.min.js',

    // Other bower deps
    paths.bower + 'angular-flare/dist/angular-flare.min.js',
    paths.bower + 'angular-resource/angular-resource.min.js',
    paths.bower + 'angular-route/angular-route.min.js',
    paths.bower + 'angular-ui/build/angular-ui.min.js',
    paths.bower + 'autofill-event/src/autofill-event.js',

    // Manual vendor deps
    paths.vendor + '**/*.js',
  ]
};

/**
 * Define destination paths
 * @type {Object}
 */
var dests = {
  build: {
    root: paths.build,
    js: paths.build + 'js',
    images: paths.build + 'images',
    css: paths.build + 'css',
    jsorig: paths.build + 'js/sources'
  },
  filenames: {
    app: 'app.js',
    appmin: 'app.min.js',
    vendor: 'libs.js',
    vendormin: 'libs.min.js'
  }
};

/**
 * ======================================
 * ===  TASKS  ==========================
 * ======================================
 */


gulp.task('default', taskListing);
gulp.task('build', ['css', 'html', 'images', 'js', 'vendor']);

/**
 * lint
 */
gulp.task('lint', function () {
  return gulp.src(sources.js)
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

/**
 * clean
 */
gulp.task('clean', function () {
  return gulp.src([paths.build, paths.tmp], {
      read: false
    })
    .pipe(rimraf());
});

/**
 * build
 */
gulp.task('js', ['lint'], function () {

  // Angular application source code
  var src = gulp.src(sources.js)
    .pipe(ngAnnotate());

  // Angular html templates
  var tpl = gulp.src(sources.tpl)
    .pipe(htmlmin())
    .pipe(templateCache());

  // Merge the two streams to create an unminified, concatenated build file
  var build = merge(src, tpl)
    // Ensure that the order in which we load files allows for angular modules
    // to be defined before accessing (downside to not using broserify)
    .pipe(angularFilesort())
    .pipe(uglify(dests.filenames.app, {
      mangle: false,
      output: {
        beautify: true
      },
      enclose: {
        "window": "window",
        "window.angular": "angular",
        "undefined": "undefined"
      }
    }));

  // Merge the two streams to create a minified build file
  var buildmini = merge(src, tpl)
    .pipe(angularFilesort())
    // Remove paths so that we can have the sourcemap point to a single dir
    .pipe(flatten())
    // Write out all raw source files into the dist dir (for sourcemaps)
    .pipe(gulp.dest(dests.build.js + '/sources'))
    // Minify and produce source maps
    .pipe(uglify(dests.filenames.appmin, {
      outSourceMap: true,
      basePath: 'dist/js',
      enclose: {
        "window": "window",
        "window.angular": "angular",
        "undefined": "undefined"
      }
    }));

  // Merged streams since we split them
  // and write both minified and unminified outputs
  return merge(build, buildmini)
    .pipe(size({
      showFiles: true
    }))
    .pipe(gulp.dest(dests.build.js));
});

/**
 * vendor js packaging
 */
gulp.task('vendor', function () {
  var vendors = gulp.src(sources.vendorjs)
    // Remove paths so that we can have the sourcemap point to a single dir
    .pipe(flatten())
    // Write out all raw source files into the dist dir (for sourcemaps)
    .pipe(gulp.dest(dests.build.jsorig))
    // Ensure that any input file is newer than the output combined first
    // gulp-newer, for combined files, requires up to point to the output file
    .pipe(newer([
      dests.build.js,
      dests.filenames.vendormin
    ].join('/')));

  var vendorraw = vendors
    .pipe(concat(dests.filenames.vendor));

  var vendormin = vendors
    // Minify
    .pipe(uglify(dests.filenames.vendormin, {
      outSourceMap: true,
      basePath: dests.build.js
    }));

  // Merge streams since we split them
  // and write both minified and unminified outputs
  return merge(vendorraw, vendormin)
    .pipe(size({
      showFiles: true
    }))
    .pipe(gulp.dest(dests.build.js));
});

/**
 * css minification
 */
gulp.task('css', function () {
  return gulp.src(sources.css)
    // Ensure that any input file is newer than its output first
    .pipe(flatten())
    .pipe(newer(dests.build.css))
    // Minify the css
    .pipe(cssmin())
    .pipe(size({
      showFiles: true
    }))
    .pipe(gulp.dest(dests.build.css));
});

/**
 * html minification (non-templates)
 */
gulp.task('html', function () {
  return gulp.src(sources.html)
    // Ensure that any input file is newer than its output first
    .pipe(flatten())
    .pipe(newer(dests.build.root))
    // Minify the html
    .pipe(htmlmin())
    .pipe(size({
      showFiles: true
    }))
    .pipe(gulp.dest(dests.build.root));
});

/**
 * image minification
 */
gulp.task('images', function () {
  return gulp.src(sources.images)
    .pipe(flatten())
    // Ensure that any input file is newer than its output first
    .pipe(newer(dests.build.images))
    .pipe(imagemin({
      progressive: true,
      use: [
        pngcrush({
          reduce: true
        })
      ],
      optimizationLevel: 5
    }))
    .pipe(gulp.dest(dests.build.images));
});


/**
 * ======================================
 * ===  WATCHES  ========================
 * ======================================
 */
gulp.task('watch', ['build'], function () {
  gulp.watch([sources.js, sources.tpl], ['lint', 'js']);
  gulp.watch(sources.css, ['css']);
  gulp.watch(sources.images, ['images']);
  gulp.watch(sources.html, ['html']);
});