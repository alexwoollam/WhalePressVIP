const gulp =          require('gulp');
const htmlValidator = require('gulp-w3c-html-validator');
const casperJs = require('gulp-casperjs');

gulp.task('static', function () {
  gulp.src('casper.js')
    .pipe(casperJs());
});

const task = {
   validateHtml() {
      return gulp.src('caspers/static/**/*.html')
         .pipe(htmlValidator())
         .pipe(htmlValidator.reporter());
      },
   };
 
// Gulp
gulp.task('validate-html', task.validateHtml,'static', task.static);
