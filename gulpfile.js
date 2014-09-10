/**
 * Build Dependencies
 */
var fs = require('fs'),
  merge = require('merge-stream'),
  gulp = require('gulp'),
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
  imagemin = require('gulp-imagemin'),
  pngcrush = require('imagemin-pngcrush'),
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
    paths.bower + 'jquery/dist/jquery.min.js',
    paths.bower + 'underscore/underscore.js',
    paths.bower + 'bootstrap/dist/js/bootstrap.min.js',
    paths.bower + 'angular/angular.min.js',

    // Other bower deps
    paths.bower + 'angular-flash/dist/angular-flash.min.js',
    paths.bower + 'angular-resource/angular-resource.min.js',
    paths.bower + 'angular-route/angular-route.min.js',
    paths.bower + 'angular-ui/build/angular-ui.min.js',

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
    js: paths.build + 'js'
  }
};

/**
 * ======================================
 * ===  TASKS  ==========================
 * ======================================
 */
gulp.task('default', taskListing);

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
gulp.task('js', function () {

  // Angular application source code
  var src = gulp.src(sources.js)
    .pipe(ngAnnotate());

  // Angular html templates
  var tpl = gulp.src(sources.tpl)
    .pipe(htmlmin())
    .pipe(templateCache());

  // Merge the two streams to create an unminified, concatenated build file
  var build = merge(src, tpl)
    .pipe(uglify('app.js', {
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
    .pipe(uglify('app.min.js', {
      outSourceMap: true,
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

gulp.task('vendor', function () {
  return gulp.src(sources.vendorjs)
    .pipe(uglify('libs.min.js', {
      outSourceMap: true
    }))
    .pipe(size({
      showFiles: true
    }))
    .pipe(gulp.dest(dests.build.js));
});

gulp.task('css', function () {
  return gulp.src(sources.css)
    .pipe(cssmin())
    .pipe(size({
      showFiles: true
    }))
    .pipe(gulp.dest(dests.build.root));
});

gulp.task('html', function () {
  return gulp.src(sources.html)
    .pipe(htmlmin())
    .pipe(size({
      showFiles: true
    }))
    .pipe(gulp.dest(dests.build.root));
});

gulp.task('images', function () {
  return gulp.src(sources.images)
    .pipe(imagemin({
      progressive: true,
      use: [
        pngcrush({
          reduce: true
        })
      ],
      optimizationLevel: 5
    }))
    .pipe(gulp.dest(dests.build.root));
});


gulp.task('build', ['lint', 'css', 'html', 'images', 'js', 'vendor']);