const { series, parallel, src, dest, watch } = require('gulp');
const browserSync = require('browser-sync').create();
const del = require('del');
const gulpCsso = require('gulp-csso');
const gulpHtmlmin = require('gulp-htmlmin');
const gulpIf = require('gulp-if');
const gulpImagemin = require('gulp-imagemin');
const gulpSass = require('gulp-sass');
const gulpUglify = require('gulp-uglify');

/* clean dist folder */
function clean() {
    return del(['dist']);
}

/* inject html into browser */
function htmlBundler() {
    return src(['src/*.html'])
        .pipe(gulpHtmlmin({
            caseSensitive: true,
            removeComments: true
        }))
        .pipe(dest('dist'))
        .pipe(browserSync.stream());
}

/* to check whether file is sass or not*/
function isSassFile(file) {
  return file.extname === '.scss';
}

/* convert sass into css and inject it into browser along with css */
function scssBundler() {
    return src([
			'node_modules/bootstrap/dist/css/bootstrap.min.css', 
			'src/assets/scss/*.scss',
		])
        .pipe(gulpIf(isSassFile, gulpSass()))
        .pipe(gulpCsso())
        .pipe(dest('dist/assets/css'))
        .pipe(browserSync.stream());
}

/* inject js into browser */
function jsBundler() {
    return src([
            'node_modules/jquery/dist/jquery.min.js',
            'node_modules/bootstrap/dist/js/bootstrap.min.js',
            'src/assets/js/*.js'
        ])
        .pipe(gulpUglify())
        .pipe(dest('dist/assets/js'))
        .pipe(browserSync.stream());
}

/* compress image */
function imgCompression() {
    return src(['src/assets/img/**/*'])
        .pipe(gulpImagemin([
            gulpImagemin.gifsicle({interlaced: true}),
            gulpImagemin.jpegtran({progressive: true}),
            gulpImagemin.optipng({optimizationLevel: 5}),
            gulpImagemin.svgo({
                plugins: [
                    {removeViewBox: true},
                    {cleanupIDs: false}
                ]
            })
        ]))
        .pipe(dest('dist/assets/img'));
}

/* static server + watching html/scss/js file */
function serve() {
    browserSync.init({
        server: 'dist',
        port: 3000
    })

    watch(['src/*.html'], htmlBundler)
    watch(['src/assets/scss/*.scss'], scssBundler)
    watch(['src/assets/js/*.js'], jsBundler)
    watch(['src/assets/img/**/*'], imgCompression)
    .on('change', browserSync.reload);
}

exports.default = series(clean, parallel(htmlBundler, scssBundler, jsBundler, imgCompression), serve);
