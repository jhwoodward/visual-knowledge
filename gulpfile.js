var gulp = require('gulp'),
    concat = require('gulp-concat'),
    cleanCSS = require('gulp-clean-css'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    sourcemaps = require('gulp-sourcemaps'),
    templateCache = require('gulp-angular-templatecache'),
    ngAnnotate = require('gulp-ng-annotate'),
    babel = require('gulp-babel');

var browserSync = require('browser-sync').create();

function browserSyncTask(done) {
  browserSync.init({
    browser: 'google chrome',
    server: {
      baseDir: 'dist'
    },
  });
  done();
}

function watchTask() {
  gulp.watch('src/app/**/*.js', appJs);
  gulp.watch(['./src/css/style.css', './src/css/vis-custom.css'], css);
  gulp.watch('src/**/*.html', htmlTemplates);
}

function clean(callback) {
  var del = require('del');
  del(['./dist/css'], { force: true }).then(function () {
    del(['./dist/js'], { force: true }).then(function () {
      callback();
    });
  });
}

function appJs() {
  return gulp.src('src/app/**/*.js')
    .pipe(ngAnnotate())
    .pipe(concat('bundle.js'))
    .pipe(gulp.dest('./dist/js'))
    .pipe(browserSync.reload({
      stream: true
    }));
}

function libJs() {
  return gulp.src([
    './lib/jquery/dist/jquery.js',
    './lib/bootstrap-typeahead.js',
    './lib/vis/dist/vis.js',
    './lib/lodash/dist/lodash.js',
    './lib/angular/angular.js',
    './lib/angular-resource/angular-resource.js',
    './lib/angular-sanitize/angular-sanitize.js',
    './lib/angular-animate/angular-animate.js',
    './lib/angular-ui-router/release/angular-ui-router.js',
    './lib/angular-bootstrap/ui-bootstrap-tpls.js',
    './lib/jquery.debouncedresize/js/jquery.debouncedresize.js',
    './lib/jquery.masonry/jquery.masonry.js',
    './lib/jquery-ui/jquery-ui.js'
  ])
    .pipe(concat('bundle-lib.js'))
    .pipe(gulp.dest('./dist/js'));
}

function css() {
  return gulp.src(['./src/css/style.css', './src/css/vis-custom.css'])
    .pipe(cleanCSS())
    .pipe(concat('bundle.css'))
    .pipe(gulp.dest('./dist/css'))
    .pipe(browserSync.reload({
      stream: true
    }));
}

function libCss() {
  return gulp.src([
    './lib/bootstrap/dist/css/bootstrap.css',
    './lib/Ionicons/css/ionicons.css'
  ])
    .pipe(cleanCSS())
    .pipe(concat('bundle-lib.css'))
    .pipe(gulp.dest('./dist/css'));
}

function fonts() {
  return gulp.src([
    './lib/Ionicons/fonts/ionicons.*'
  ])
    .pipe(gulp.dest('./dist/fonts/'));
}

function htmlTemplates() {
  return gulp.src('src/**/*.html')
    .pipe(templateCache({ module: 'templates', standalone: true, base: function(file) {
      return file.relative;
    }}))
    .pipe(gulp.dest('./dist/js'))
    .pipe(browserSync.reload({
      stream: true
    }));
}

gulp.task('build', gulp.parallel(appJs, libJs, libCss, fonts, css, htmlTemplates));
gulp.task('watch', gulp.series(browserSyncTask, watchTask));
gulp.task('clean', clean);
