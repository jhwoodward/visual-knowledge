var gulp = require('gulp'),
    concat = require('gulp-concat'),
    minify = require('gulp-minify-css'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    sourcemaps = require('gulp-sourcemaps'),
    templateCache = require('gulp-angular-templatecache'),
    ngAnnotate = require('gulp-ng-annotate'),
    babel = require('gulp-babel'),
    watch = require('gulp-watch');


gulp.task('default',['app-js','lib-js','css','html-templates']);

gulp.task('clean',function(callback){
    del(['./build'],{force:true}).then(function(){callback();});
});

gulp.task('app-js', function(cb){
    return gulp.src('src/app/**/*.js')
     //   .pipe(watch('./src/app/**/*.js'))
     .pipe(sourcemaps.init())
     .pipe(babel({presets: ['es2015']}))
     .pipe(ngAnnotate())
     .pipe(concat('bundle.js'))
     .pipe(uglify())
     .pipe(sourcemaps.write('./'))
     .pipe(gulp.dest('./build'));
 
});


gulp.task('lib-js', function(){
    return gulp.src([
        './lib/bootstrap2.js',
        './lib/vis/dist/vis.js',
        './lib/angular/angular.js',
        './lib/angular-resource/angular-resource.js',
        './lib/angular-sanitize/angular-sanitize.js',
        './lib/angular-ui-router/release/angular-ui-router.js',
        './lib/jquery.debouncedresize/js/jquery.debouncedresize.js',
        './lib/jquery.masonry/jquery.masonry.js',
         './lib/jquery-ui/jquery-ui.js'

        ])
        .pipe(concat('bundle-lib.js'))
        .pipe(uglify())
        .pipe(gulp.dest('./build'));
});

gulp.task('css', function(cb){
    return gulp.src(['./src/css/style.css','./src/css/vis-custom.css'])
      //  .pipe(watch('./src/css/style.css'))
        .pipe(minify())
        .pipe(concat('bundle.css'))
        .pipe(gulp.dest('./build'));
       // .on('end',cb);
});

gulp.task('html-templates', function () {
  return gulp.src('src/**/*.html')
    .pipe(templateCache())
    .pipe(gulp.dest('./build'));
});

