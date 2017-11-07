var gulp = require('gulp'),
  bro = require('gulp-bro'),
  gutil = require('gulp-util'),
  sourcemaps = require('gulp-sourcemaps'),
  pjson = require('./package.json'),
  plumber = require('gulp-plumber'),
  uglify = require('gulp-uglify'),
  rename = require('gulp-rename'),
  runSequence = require('run-sequence'),
  browserSync = require('browser-sync').create(),
  spawn = require('child_process').spawn,
  babelify = require('babelify'),
  reload = browserSync.reload;

// Relative paths function
var pathsConfig = function (appName) {
  this.app = "./" + (appName || pjson.name);

  return {
    app: this.app,
    css: this.app + '/static/css',
    sass: './app/sass',
    js: this.app + '/static/js',
    jsx: './app/js'
  }
};

var paths = pathsConfig('{{cookiecutter.project_slug}}');


gulp.task('javascript', function () {
  gulp.src('./app/js/app.jsx')
    .pipe(bro({
        transform: [
          babelify.configure({ presets: ['env', 'react'] })
        ]
    }))
    .pipe(rename('project.js'))
    .pipe(gulp.dest(paths.js))
});


// Run django server
gulp.task('runServer', function(cb) {
  var cmd = spawn('python', ['manage.py', 'runserver', '0.0.0.0:8002'], {stdio: 'inherit'});
  cmd.on('close', function(code) {
    console.log('runServer exited with code ' + code);
    cb(code);
  });
});


// Browser sync server for live reload
gulp.task('browserSync', function() {
    browserSync.init(
      [paths.css + "/*.css", paths.js + "*.js", paths.templates + '*.html'], {
        proxy:  "localhost:8002"
    });
});


// Watch files for changes
gulp.task('watch', function () {
  gulp.watch(paths.jsx + '/app.jsx', ['javascript']).on("change", reload);
  gulp.watch(paths.templates + '/**/*.html').on("change", reload);
});


// Default task
gulp.task('default', function() {
  runSequence(['javascript'], ['runServer', 'browserSync', 'watch']);
});
