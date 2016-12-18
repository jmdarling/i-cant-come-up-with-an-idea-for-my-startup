const gulp = require('gulp')
const mocha = require('gulp-mocha')
const plumber = require('gulp-plumber')

gulp.task('test', () => {
  gulp.src('./test/*.js')
    .pipe(plumber())
    .pipe(mocha())
})

gulp.task('watch', () => {
  gulp.watch('./src/*.js', ['test'])
  gulp.watch('./test/*.js', ['test'])
})

gulp.task('default', ['test', 'watch'])
