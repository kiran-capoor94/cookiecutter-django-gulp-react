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
const pathsConfig = (appName) => {
  this.app = `./${(appName || pjson.name)}`;

  return {
    app: this.app,
    css: `${this.app}/static/css`,
    scss: './app/scss',
    js: `${this.app}/static/js`,
    jsx: './app/js',
    templates: `${this.app}/templates`,
  };
};

const paths = pathsConfig('{{cookiecutter.project_slug}}');

// Compile js changes
gulp.task('javascript', () => {
  gulp.src('./app/js/app.jsx')
    .pipe(plumber())
    .pipe(bro({
      transform: [
        babelify.configure({ presets: ['env', 'react'] }),
      ],
      extensions: ['.js', '.jsx'],
    }))
    .pipe(rename('project.js'))
    .pipe(gulp.dest(paths.js));
});


// Compile sass changes
gulp.task('scss', () => {
  gulp.src(`${paths.scss}/*.scss`)
    .pipe(plumber())
    .pipe(sass())
    .pipe(gulp.dest(paths.css))
    .pipe(stream());
});

// create a task that ensures the `javascript` task is complete before
// reloading browsers
gulp.task('js-watch', ['javascript'], (done) => {
  reload();
  done();
});

// Run django server
gulp.task('runServer', (cb) => {
  const cmd = spawn('python', ['manage.py', 'runserver', '0.0.0.0:8002'], { stdio: 'inherit' });
  cmd.on('close', code => cb(code));
});


// Browser sync server for live reload
gulp.task('browserSync', () => {
  browserSync.init({ proxy: 'localhost:8002' });
});


// Watch files for changes
gulp.task('watch', () => {
  gulp.watch(`${paths.jsx}/**/*.jsx`, ['js-watch']);
  gulp.watch(`${paths.scss}/**/*.scss`, ['scss']);
  gulp.watch(`${paths.templates}/**/*.html`).on('change', reload);
});


// Default task
gulp.task('default', () => runSequence(['javascript', 'scss'], ['runServer', 'browserSync', 'watch']));
