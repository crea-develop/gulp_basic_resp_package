var gulp            = require('gulp');

var uglify          = require('gulp-uglify');

var imagemin        = require('gulp-imagemin');

var prettify        = require('gulp-prettify');

var cssbeautify     = require('gulp-cssbeautify');
var autoprefixer    = require('gulp-autoprefixer');
var cssmin          = require('gulp-cssmin');

var rename          = require('gulp-rename');
var plumber         = require('gulp-plumber');
var concat          = require('gulp-concat');
var changed         = require('gulp-changed');
var del             = require('del');

var paths = {
    dist        : 'dist/',
    html        : 'src/**/*.html',
    image       : 'src/**/*.+(jpg|gif|png)',
    css         : {
        src     : 'src/assets/css/*.css',
        dist    : 'dist/assets/css/'
    },
    js          : {
        src     : 'src/assets/js/*.js',
        dist    : 'dist/assets/js/'
    }
};

var common_js_sort = [
    'src/assets/js/common/jquery-3.2.0.min.js',
    'src/assets/js/common/jquery.easing.js'
];

// =======================================================
//    Common tasks
// =======================================================

// 画像の圧縮タスク
// ====================
gulp.task('image', function() {
    gulp
    .src(paths.image)
    .pipe(plumber(paths.image))
    .pipe(changed(paths.dist))
    .pipe(imagemin())
    .pipe(gulp.dest(paths.dist));
});

// HTMLの整形タスク
// ====================
gulp.task('html', function () {
    gulp
    .src(paths.html)
    .pipe(plumber(paths.html))
    .pipe(changed(paths.dist))
    .pipe(prettify())
    .pipe(gulp.dest(paths.dist));
});

// cssのminifyタスク
// ====================
gulp.task('css', function () {
    gulp
    .src(paths.css.src)
    .pipe(plumber(paths.css.src))
    .pipe(changed(paths.css.dist))
    .pipe(autoprefixer())
    .pipe(cssbeautify())
    .pipe(cssmin())
    .pipe(concat('style.css'))
    .pipe(gulp.dest(paths.css.dist));
});

// jsのminifyタスク
// ====================
gulp.task('js', ['main_js', 'common_js']);

// 監視タスク
// ====================
gulp.task('watch', function() {
    gulp.watch(paths.html, ['html']);
    gulp.watch(paths.css.src, ['css']);
    gulp.watch(paths.js.src,   ['js']);
});

// 一括処理タスク
// ====================
gulp.task('default', ['html', 'css', 'js', 'image']);

// distの中身を全削除
// ※※※　distの中だけに動画ファイルとかおいていると全部消えるのでお気をつけください　※※※
gulp.task('clean', function () {
    return del([paths.dist + '**/*']);
});


//  JavaScript minify task
gulp.task('main_js', function() {
    gulp
    .src(paths.js.src)
    .pipe(plumber())
    .pipe(uglify({preserveComments: 'some'}))
    .pipe(changed(paths.js.dist))
    .pipe(gulp.dest(paths.dist));
});

//  JavaScript concat & minify task
gulp.task('common_js', function() {
    gulp
    .src(common_js_sort) // gulp/config.jsで設定
    .pipe(plumber())
    .pipe(uglify({preserveComments: 'some'})) // minify
    .pipe(changed(paths.js.dist))
    .pipe(concat('common.js'))                // 結合
    .pipe(gulp.dest(paths.js.dist));
});
