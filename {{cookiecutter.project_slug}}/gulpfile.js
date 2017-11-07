var gulp = require('gulp'),
  browserify = require('browserify'),
  source = require('vinyl-source-stream'),
  buffer = require('vinyl-buffer'),
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
  // set up the browserify instance on a task basis
  var b = browserify({
    entries: paths.jsx + '/app.jsx',
    debug: true,
    // defining transforms here will avoid crashing your stream
    transform: [babelify]
  });

  return b.bundle()
    .pipe(source('project.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
        // Add transformation tasks to the pipeline here.
        .pipe(uglify())
        .on('error', gutil.log)
    .pipe(rename({ suffix: '.min' }))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(paths.js));
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
  gulp.watch(paths.js + '/project.js', ['javascript']).on("change", reload);
  gulp.watch(paths.templates + '/**/*.html').on("change", reload);
});


// Default task
gulp.task('default', function() {
  runSequence(['javascript'], ['runServer', 'browserSync', 'watch']);
});
