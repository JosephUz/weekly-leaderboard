const gulp = require('gulp');
const browserify = require('browserify');
const source = require('vinyl-source-stream');
const uglify = require('gulp-uglify-es').default;
const streamify = require("gulp-streamify");
const rename = require('gulp-rename');

gulp.task('basic', function () {
    return browserify('./server/public/src/js/index')
        .bundle()
        .pipe(source('index.js'))
        .pipe(streamify(uglify()))
        .pipe(rename({ extname: '.build.min.js' }))
        .pipe(gulp.dest('./server/public/src/js'));
});