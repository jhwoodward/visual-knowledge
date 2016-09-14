var gulp = require('gulp'),
    concat = require('gulp-concat'),
    minify = require('gulp-minify-css'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    sourcemaps = require('gulp-sourcemaps'),
    templateCache = require('gulp-angular-templatecache'),
    ngAnnotate = require('gulp-ng-annotate'),
    babel = require('gulp-babel'),
    runSequence = require('run-sequence');
    
 var browserSync = require('browser-sync').create();

gulp.task('build',['app-js','lib-js','lib-css','fonts','css','html-templates']);
  
gulp.task('browser-sync', function() {
  browserSync.init({
    server: {
      baseDir: 'dist'
    },
  })
});

gulp.task('watch',['browser-sync'],function(){
  gulp.watch('src/app/**/*.js',['app-js']);
  gulp.watch(['./src/css/style.css','./src/css/vis-custom.css'],['css']);
  gulp.watch('src/**/*.html',['html-templates']);
});

gulp.task('clean',function(callback){
    del(['./dist/css'],{force:true}).then(function(){
      del(['./dist/js'],{force:true}).then(function(){
          callback();
       });
    });
});

gulp.task('app-js', function(cb){
  return gulp.src('src/app/**/*.js')
  // .pipe(sourcemaps.init())
  //  .pipe(babel({presets: ['es2015']}))
    .pipe(ngAnnotate())
    .pipe(concat('bundle.js'))
  //  .pipe(uglify())
  //  .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./dist/js'))
    .pipe(browserSync.reload({
    stream: true
  }))
});


gulp.task('lib-js', function(){
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
    './lib/angular-bootstrap/ui-bootstrap.js',
    './lib/angular-bootstrap/ui-bootstrap-tpls.js',
    './lib/jquery.debouncedresize/js/jquery.debouncedresize.js',
    './lib/jquery.masonry/jquery.masonry.js',
    './lib/jquery-ui/jquery-ui.js'
    ])
   // .pipe(sourcemaps.init())
    .pipe(concat('bundle-lib.js'))
   // .pipe(uglify())
  //  .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./dist/js'));
});

gulp.task('css', function(cb){
  return gulp.src(['./src/css/style.css','./src/css/vis-custom.css'])
    .pipe(minify())
    .pipe(concat('bundle.css'))
    .pipe(gulp.dest('./dist/css'))
    .pipe(browserSync.reload({
      stream: true
    }))
});

gulp.task('lib-css', function(cb){
  return gulp.src([
    './lib/bootstrap/dist/css/bootstrap.css',
    './lib/Ionicons/css/ionicons.css'
  ])
    .pipe(minify())
    .pipe(concat('bundle-lib.css'))
    .pipe(gulp.dest('./dist/css'));
});

gulp.task('fonts', function() {
  return gulp.src([
    './lib/Ionicons/fonts/ionicons.*'
    ])
    .pipe(gulp.dest('./dist/fonts/'));
});

gulp.task('html-templates', function () {
  return gulp.src('src/**/*.html')
    .pipe(templateCache())
    .pipe(gulp.dest('./dist/js'))
    .pipe(browserSync.reload({
      stream: true
    }));
});

