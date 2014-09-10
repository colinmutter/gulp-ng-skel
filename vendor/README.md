vendor
======
Contains assets from third-parties (css, js) that are either installed by other package managers (e.g. bower) or are manually added by the user

Packages installed here must be added to the `source.vendorjs` property in _gulpfile.js_.  When doing so you can select non-minified files from the vendor, as they will simply be re-minified.


### /bower
Populated by running `bower install`.  Note: in this project, bower dependencies _are not_ committed, but you can do this to make the project more easily portable and reliable.  If you want to, feel free to remove vendor/bower to your .gitignore.

### /standalone
Manually added third-party javascript libraries.