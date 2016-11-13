var gulp = require('gulp');
var concat = require('gulp-concat');//合并文件
var rename = require('gulp-rename');//重命名
var minifyCss = require('gulp-minify-css');//- 压缩CSS；
var sass = require('gulp-ruby-sass');			//编译scss
var mainBowerFiles = require('main-bower-files');

var watch = require('gulp-watch');
var browserSync  = require('browser-sync');

var src = {
    scss: './scss/*.scss',
    css:  './dist/css/',
    html: './tpl/*.html'
};

// sass任务
gulp.task('sass', function() {
    return sass('scss/*.scss', { style: 'expanded', noCache: true })
        .pipe(gulp.dest('dist/css/'))
});

//合并压缩css
gulp.task('minifyCss', ['sass'], function(){
    return gulp.src('dist/css/*.css')		//监听对象文件
        .pipe(concat('main.all.css'))			//指定合并后的文件名
        .pipe(gulp.dest('dist/css/min/'))		//指定合并后生成文件的输出目录
        .pipe(minifyCss())					//执行压缩
        .pipe(rename('main.min.css'))		//压缩后的文件名
        .pipe(gulp.dest('dist/css/min/'));		//压缩后生成文件的输出目录
});

/**
 * Start the Browsersync Static Server + Watch files
 */
gulp.task('server', ['minifyCss'], function() {
    browserSync({
        server: {
            baseDir: "./",
            index: "index.html"
        }
    });

    gulp.watch(src.scss, ['minifyCss'], browserSync.reload);
    gulp.watch(src.html).on('change', browserSync.reload);
});

// 获取 bower main 文件
gulp.task('bower', function () {
    gulp.src(mainBowerFiles())
        // 重新设置目录结构
        .pipe(rename({dirname: ''}))
        // 另存
        .pipe(gulp.dest('public'));
});

gulp.task('default', ['server'], function () {});
