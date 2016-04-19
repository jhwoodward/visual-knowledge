var gulp = require('gulp'),
    gp_concat = require('gulp-concat'),
    gp_uglify = require('gulp-uglify');
    gp_sourcemaps = require('gulp-sourcemaps'),
    templateCache = require('gulp-angular-templatecache')
    ngAnnotate = require('gulp-ng-annotate');


gulp.task('default',['app-js','html-templates']);

gulp.task('clean',function(callback){
    del(['./build'],{force:true}).then(function(){callback();});
});

gulp.task('app-js', function(){
    return gulp.src(['./src/**/*.js'])
        .pipe(gp_sourcemaps.init())
        .pipe(ngAnnotate())
        .pipe(gp_concat('bundle.js'))
        .pipe(gp_uglify())
        .pipe(gp_sourcemaps.write('./'))
        .pipe(gulp.dest('./build'));
});

gulp.task('html-templates', function () {
  return gulp.src('src/**/*.html')
    .pipe(templateCache())
    .pipe(gulp.dest('./build'));
});

