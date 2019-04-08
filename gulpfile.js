var gulp = require('gulp'),
    gulpHtmlBeautify = require('gulp-html-beautify'),
    gulpWait = require('gulp-wait'),
    gulpSass = require('gulp-sass'),
    gulpCleanCss = require('gulp-clean-css'),
    gulpAutoprefixer = require('gulp-autoprefixer'),
    gulpUglify = require('gulp-uglify'),
    gulpConcat = require('gulp-concat'),
    gulpRename = require('gulp-rename'),
    gulpInsert = require('gulp-insert'),
    gulpCopy = require('gulp-copy'),
    gulpInclude = require('gulp-file-include'),
    gulpReload = require('gulp-server-livereload'),
    gulpImageMin = require('gulp-image'),
    gulpNewer = require('gulp-newer'),
    gulpHtmlReplace = require('gulp-html-replace'),
    gulpCount = require('gulp-count'),
    gulpClean = require('gulp-dest-clean'),
    del = require('del');

var paths = {
  root: {
    src: 'src',
    dest: 'dist'
  },
  styles: {
    file: 'src/css/**/*',
    src: 'src/css',
    dest: 'dist/css'
  },
  scripts: {
    file: 'src/js/**/*',
    src: 'src/js',
    dest: 'dist/js'
  },
  images: {
    file: 'src/images/**/*',
    src: 'src/images',
    dest: 'dist/images'
  },
  html: {
    file: 'src/html/**/*.html',
    include: 'src/include',
    src: 'src/html',
    dest: 'dist/html'
  }
};

//css
function styles() {
  return gulp.src(paths.styles.file)
  .pipe(gulpClean(paths.styles.dest))
  .pipe(gulpCopy(paths.root.dest, {prefix: 1}))
  .pipe(gulpWait(1000))
  .pipe(gulpSass({outputStyle: 'compact'}).on('error', gulpSass.logError))
  .pipe(gulpInsert.prepend('@charset "UTF-8";\n'))
  .pipe(gulp.dest(paths.styles.dest))
  .pipe(gulpConcat('all.min.css'))
  .pipe(gulpRename({
    basename: 'all',
    suffix: '.min'
  }))
  .pipe(gulpAutoprefixer({
    browsers: ['last 2 versions'],
    cascade: false
  }))
  .pipe(gulpCleanCss())
  .pipe(gulp.dest(paths.styles.dest))
  .pipe(gulpCount('<%= counter %> css files'));
}

//js
function scripts() {
  return gulp.src(paths.scripts.file)
  .pipe(gulpClean(paths.scripts.dest))
  .pipe(gulpCopy(paths.root.dest, {prefix: 1}))
  .pipe(gulpUglify())
  .pipe(gulpConcat('all.min.js'))
  .pipe(gulp.dest(paths.scripts.dest))
  .pipe(gulpCount('<%= counter %> js files'));
}

//images
function images() {
  return gulp.src(paths.images.file)
  .pipe(gulpClean(paths.images.dest))
  .pipe(gulpNewer(paths.images.dest))
  .pipe(gulpImageMin())
  .pipe(gulp.dest(paths.images.dest))
  .pipe(gulpCount('<%= counter %> images files'));
}

//html include
function html() {
  return gulp.src(paths.html.file)
  .pipe(gulpClean(paths.html.dest))
  .pipe(gulpNewer(paths.html.dest))
  .pipe(gulpInclude({
    prefix: '@@',
    basepath: '@file'
  }))
  .pipe(gulpHtmlReplace({
    'css': '../css/all.min.css',
    'js': '../js/all.min.js'
  }))

  .pipe(gulpHtmlBeautify({
    "indent_size": 2
  }))
  .pipe(gulp.dest(paths.html.dest))
  .pipe(gulpCount('<%= counter %> html files'));
}

//reload
function webServer() {
  return gulp.src(paths.root.dest)
  .pipe(gulpReload({
    port: 9999,
    livereload: true,
    open: true,
    defaultFile: '/html/index.html',
  }));
}

//delete
function clean() {
  return del([paths.styles.dest + '/css', paths.styles.dest + '/js', paths.html.dest + '/*.html']);
}

function watch() {
  gulp.watch(paths.html.include + '/*.html', html);
  gulp.watch(paths.html.file, html);
  gulp.watch(paths.scripts.file, scripts);
  gulp.watch(paths.styles.file, styles);
  gulp.watch(paths.images.file, images);
}

// var build = gulp.parallel(clean, styles, scripts, images, html, watch);
var build = gulp.series(clean, styles, scripts, images, html, webServer, watch);

gulp.task(build);
gulp.task('default', build);

