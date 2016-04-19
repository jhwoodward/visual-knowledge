var gulp = require('gulp'),
gp_concat = require('gulp-concat'),
    gp_rename = require('gulp-rename'),
    gp_uglify = require('gulp-uglify');
        del=require('del'),
    runSequence = require('run-sequence'),
    gp_sourcemaps = require('gulp-sourcemaps');

gulp.task('default',function(callback){
    runSequence('build',callback);
});

gulp.task('build',function(callback){
    runSequence('bundle',callback);
});

gulp.task('copy-build',['copy-assets','copy-app-js','copy-lib-js']);

gulp.task('clean',function(callback){
    del(['./build'],{force:true}).then(function(){callback();});
  
});




gulp.task('bundle', function(){
    return gulp.src(['./src/**/*.js'])
   //     .pipe(gp_sourcemaps.init())
        .pipe(gp_concat('concat.js'))
        .pipe(gulp.dest('./build'))
        .pipe(gp_rename('bundle.js'))
        .pipe(gp_uglify())
        .pipe(gp_sourcemaps.write('./'))
        .pipe(gulp.dest('./build'));
});

