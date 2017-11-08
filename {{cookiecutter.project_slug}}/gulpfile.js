const gulp = require('gulp');
const bro = require('gulp-bro');
const pjson = require('./package.json');
const plumber = require('gulp-plumber');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const runSequence = require('run-sequence');
const browserSync = require('browser-sync').create();
const { spawn } = require('child_process');
const sass = require('gulp-sass');
const babelify = require('babelify');

const { reload, stream } = browserSync;

// Relative paths function
var pathsConfig = function (appName) {
  this.app = "./" + (appName || pjson.name);

  return {
    app: this.app,
    css: this.app + '/static/css',
    scss: './app/scss',
    js: this.app + '/static/js',
    jsx: './app/js',
    templates: `${this.app}/templates`,
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


// create a task that ensures the `javascript` task is complete before
// reloading browsers
gulp.task('js-watch', ['javascript'], (done) => {
  reload();
  done();
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

// Watch for sass changes
gulp.task('scss', () => {
  gulp.src(`${paths.scss}/*.scss`)
    .pipe(sass())
    .pipe(gulp.dest(paths.css))
    .pipe(stream());
});


// Watch files for changes
gulp.task('watch', () => {
  gulp.watch(`${paths.jsx}/**/*.jsx`, ['js-watch']);
  gulp.watch(`${paths.scss}/**/*.scss`, ['scss']);
  gulp.watch(`${paths.templates}/**/*.html`).on('change', reload);
});


// Default task
gulp.task('default', function() {
  runSequence(['javascript', 'scss'], ['runServer', 'browserSync', 'watch']);
});
