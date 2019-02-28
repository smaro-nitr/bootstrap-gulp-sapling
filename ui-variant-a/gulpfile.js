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
    return del(['app/dist']);
}

/* inject html into browser */
function htmlBundler() {
    return src(['app/src/*.html'])
        .pipe(gulpHtmlmin({
            caseSensitive: true,
            removeComments: true
        }))
        .pipe(dest('app/dist'))
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
			'app/src/assets/scss/*.scss',
		])
        .pipe(gulpIf(isSassFile, gulpSass()))
        .pipe(gulpCsso())
        .pipe(dest('app/dist/assets/css'))
        .pipe(browserSync.stream());
}

/* inject js into browser */
function jsBundler() {
    return src([
            'node_modules/jquery/dist/jquery.min.js',
            'node_modules/bootstrap/dist/js/bootstrap.min.js',
            'app/src/assets/js/*.js'
        ])
        .pipe(gulpUglify())
        .pipe(dest('app/dist/assets/js'))
        .pipe(browserSync.stream());
}

/* compress image */
function imgCompression() {
    return src(['app/src/assets/img/**/*'])
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
        .pipe(dest('app/dist/assets/img'));
}

/* static server + watching html/scss/js file */
function serve() {
    browserSync.init({
        server: 'app/dist',
        port: 3000
    })

    watch(['app/src/*.html'], htmlBundler)
    watch(['app/src/assets/scss/*.scss'], scssBundler)
    watch(['app/src/assets/js/*.js'], jsBundler)
    watch(['app/src/assets/img/**/*'], imgCompression)
    .on('change', browserSync.reload);
}

exports.default = series(clean, parallel(htmlBundler, scssBundler, jsBundler, imgCompression), serve);
