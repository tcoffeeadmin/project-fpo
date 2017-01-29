var config       = require('../config')
if(!config.tasks.html) return

console.log('required!')

var browserSync  = require('browser-sync')
var gulp         = require('gulp')
var cp           = require('child_process');
var exec         = cp.exec;

var jekyll      = process.platform === "win32" ? "jekyll.bat" : "jekyll";

var htmlTask = function() {
  
  exec(jekyll + ' build', null, function(err, stdout, stderr) {
    if (err) {
      console.log('Child process exited with error code:', err.code);
      console.log(stderr);
      console.log(stdout);      
      return 
    }

    browserSync.reload();

    console.log(stdout);
  });

}

gulp.task('html', htmlTask)
module.exports = htmlTask