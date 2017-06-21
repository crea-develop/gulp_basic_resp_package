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
var replace         = require('gulp-replace');
var fs              = require('graceful-fs');
var del             = require('del');
var browserSync     = require('browser-sync');


// =======================================================
// 各種パスの定義
// =======================================================
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
    },
    other       : 'src/**/*.!(jpg|gif|png|php|html|scss|css|*.scss|*.css|js|*.js)',
    release     : {
        dist    : 'release/',
        html    : 'dist/**/*.+(html|php)',
        image   : 'dist/**/*.+(jpg|gif|png)',
        js      : 'dist/**/*.js',
        css     : 'dist/**/*.css',
        other   : 'dist/**/*.!(html|php)'
    }
};

// =======================================================
// パスの書き換え設定
// =======================================================
// 書き換え前のパスのパターン
var replace_path_pattern = /(\.\.\/)*assets\//g;
// 書き換えるURL
var replace_url = 'http://replace.url/assets/';

// =======================================================
// リリース用ファイル生成に関する設定
// =======================================================
// リリースファイル生成時にリプレースするテキスト
var replace_text = '<!-- === REPLACE TEXT === -->';
// リプレース内容の記述してあるファイルパス
var replace_file = './_replace_text.html';

// =======================================================
// common.jsに結合するjsファイルの一覧
// =======================================================
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

// HTML, CSS, JS, 画像以外のファイルをdistにコピーする
gulp.task('copy', function () {
    gulp
    .src(paths.other)
    .pipe(gulp.dest(paths.dist));
});

  // オートリロードタスク
// ====================
gulp.task('browser-sync', function() {
    browserSync({
        server: {
            baseDir: "dist/",
            index: "index.html"
        }
    });
});
gulp.task('bs-reload', function () {
    browserSync.reload();
});


// 監視タスク
// ====================
gulp.task('watch', ['browser-sync'], function() {
    gulp.watch(paths.html, ['html']);
    gulp.watch(paths.css.src, ['css']);
    gulp.watch(paths.js.src,   ['js']);
    gulp.watch(paths.other, ['copy']);
    gulp.watch('dist/**', ['bs-reload']);
});


// 一括処理タスク
// ====================
gulp.task('default', ['html', 'css', 'js', 'image', 'copy']);

// distの中身を全削除
// ====================
// ※※※　distの中だけに動画ファイルとかおいていると全部消えるのでお気をつけください　※※※
gulp.task('clean', function () {
    return del([paths.dist + '**/*']);
});


//  JavaScript 圧縮タスク
// ====================
gulp.task('main_js', function() {
    gulp
    .src(paths.js.src)
    .pipe(plumber())
    .pipe(uglify({output: {comments: "some"}}))
    .pipe(changed(paths.js.dist))
    .pipe(gulp.dest(paths.js.dist));
});

//  JavaScript 圧縮・結合タスク
// ====================
gulp.task('common_js', function() {
    gulp
    .src(common_js_sort) // gulp/config.jsで設定
    .pipe(plumber())
    .pipe(uglify({output: {comments: "some"}})) // minify
    .pipe(changed(paths.js.dist))
    .pipe(concat('common.js'))                // 結合
    .pipe(gulp.dest(paths.js.dist));
});


// リリース用ファイルの生成
// ====================
gulp.task('release', ['release_html', 'release_copy']);
gulp.task('release_html', function () {
    var text = fs.readFileSync(replace_file);
    gulp
    .src(paths.release.html)
    .pipe(plumber())
    .pipe(replace(replace_text, text))
    .pipe(prettify())
    .pipe(gulp.dest(paths.release.dist));
});
gulp.task('release_copy', function () {
    gulp
    .src(paths.release.other)
    .pipe(gulp.dest(paths.release.dist));
});


// パスの書き換え
// ====================
gulp.task('release_path', function () {
    gulp
    .src([paths.release.html, paths.release.css, paths.release.js])
    .pipe(replace(replace_path_pattern, replace_url))
    .pipe(gulp.dest(paths.release.dist));
});