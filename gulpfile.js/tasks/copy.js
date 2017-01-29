var config = require('../config')
if(!config.tasks.copy) return

var gulp   = require('gulp')
var path   = require('path')

var copyTask = function() {
  return gulp.src('./assets')
    .pipe(gulp.dest('_site'))
}

gulp.task('copy', copyTask)
module.exports = copyTask