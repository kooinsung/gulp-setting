var gulp = require('gulp'),
    gulpHtmlBeautify = require('gulp-html-beautify'),
    gulpHtmlInclude = require('gulp-html-tag-include'),
    gulpWait = require('gulp-wait'),
    gulpSass = require('gulp-sass'),
    gulpCleanCss = require('gulp-clean-css'),
    gulpAutoprefixer = require('gulp-autoprefixer'),
    gulpUglify = require('gulp-uglify'),
    gulpConcat = require('gulp-concat'),
    gulpRename = require('gulp-rename'),
    gulpInsert = require('gulp-insert'),
    gulpCopy = require('gulp-copy'),
    gulpImageMin = require('gulp-imagemin'),
    gulpNewer = require('gulp-newer'),
    gulpHtmlReplace = require('gulp-html-replace'),
    gulpCount = require('gulp-count'),
    gulpEmptyLine = require('gulp-remove-empty-lines'),
    gulpClean = require('gulp-dest-clean'),
    gulpPlumber = require('gulp-plumber'),
    browserSync = require('browser-sync').create(),
    del = require('del');

var paths = {
  root: {
    src: 'src',
    dest: 'dist'
  },
  styles: {
    file: 'src/assets/css/**/*.scss',
    src: 'src/assets/css',
    dest: 'dist/assets/css'
  },
  scripts: {
    file: 'src/assets/js/**/*',
    src: 'src/assets/js',
    dest: 'dist/assets/js'
  },
  images: {
    file: 'src/assets/images/**/*',
    src: 'src/assets/image',
    dest: 'dist/assets/images'
  },
  html: {
    file: 'src/html/**/*.html',
    include: 'src/include/**/*.html',
    src: 'src/html',
    dest: 'dist/html'
  }
};

//css
function styles() {
  return gulp.src(paths.styles.file)
  .pipe(gulpPlumber())
  .pipe(gulpClean(paths.styles.dest))
  .pipe(gulpCopy(paths.root.dest, {prefix: 1}))
  .pipe(gulpWait(500))
  // .pipe(gulpSass({outputStyle: 'compact'}).on('error', gulpSass.logError))
  .pipe(gulpSass({
    outputStyle: 'compact',
    includePaths: ['src/assets/css/']
  }))
  // .pipe(gulpInsert.prepend('@charset "UTF-8";\n'))
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
  .pipe(browserSync.reload({stream: true}))
  .pipe(gulpCount('<%= counter %> css files'));
}

//js
function scripts() {
  return gulp.src(paths.scripts.file)
  .pipe(gulpPlumber())
  .pipe(gulpClean(paths.scripts.dest))
  .pipe(gulpCopy(paths.root.dest, {prefix: 1}))
  .pipe(gulpUglify())
  .pipe(gulpConcat('all.min.js'))
  .pipe(gulp.dest(paths.scripts.dest))
  .pipe(browserSync.reload({stream: true}))
  .pipe(gulpCount('<%= counter %> js files'));
}

//images
function images() {
  return gulp.src(paths.images.file)
  .pipe(gulpPlumber())
  .pipe(gulpClean(paths.images.dest))
  .pipe(gulpNewer(paths.images.dest))
  .pipe(gulpImageMin())
  .pipe(gulp.dest(paths.images.dest))
  .pipe(gulpCount('<%= counter %> images files'));
}

//html include
function html() {
  return gulp.src(paths.html.file)
  .pipe(gulpPlumber())
  .pipe(gulpClean(paths.html.dest))
  .pipe(gulpNewer(paths.html.dest))
  .pipe(gulpHtmlInclude())
  .pipe(gulpHtmlReplace({
    'css': '../assets/css/all.min.css',
    'js': '../assets/js/all.min.js'
  }))
  .pipe(gulpHtmlBeautify({
    "indent_size": 2
  }))
  // .pipe(gulpEmptyLine())
  .pipe(gulp.dest(paths.html.dest))
  .pipe(browserSync.reload({stream: true}))
  .pipe(gulpCount('<%= counter %> html files'));
}

//delete
function clean() {
  return del([paths.root.dest + '/assets/css', paths.root.dest + '/assets/js', paths.root.dest + '/*.html']);
  //return del([paths.root.dest + '/assets/css', paths.root.dest + '/assets/js', paths.root.dest + '/*.html']);
}

//watch
function watch() {
  browserSync.init({
    server: {
      baseDir: paths.root.dest + "/",
      index: "./html/index.html"
    }
  });

  gulp.watch(paths.styles.file, styles);
  gulp.watch(paths.scripts.file, scripts);
  gulp.watch(paths.images.file, images);
  gulp.watch(paths.html.file, html).on('change', browserSync.reload);
}

// var build = gulp.parallel(clean, styles, scripts, images, html, watch);
var build = gulp.series(clean, styles, scripts, images, html, watch);

gulp.task(build);
gulp.task('default', build);

