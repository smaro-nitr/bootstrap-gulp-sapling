const { series, parallel, src, dest, watch } = require('gulp');
const browserSync = require('browser-sync').create();
const del = require('del');
const gulpCsso = require('gulp-csso');
const gulpHtmlmin = require('gulp-htmlmin');
const gulpIf = require('gulp-if');
const gulpSass = require('gulp-sass');
const gulpUglify = require('gulp-uglify');

/* clean dist folder */
function clean() {
    return del(['dist']);
}

/* inject assets into browser */
function assetBundler() {
    return src(['src/asset/**'])
        .pipe(dest('dist/asset'))
        .pipe(browserSync.stream());
}

/* inject html into browser */
function htmlBundler() {
    return src(['src/*.html'])
        .pipe(gulpHtmlmin({
            caseSensitive: true,
            collapseWhitespace: true,
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
/* note : avoid using scss and css extension file with same name */
function scssBundler() {
    return src([
			'node_modules/bootstrap/scss/bootstrap.scss', 
			'src/scss/*.scss',
			'src/scss/*.css'
		])
        .pipe(gulpIf(isSassFile, gulpSass()))
        .pipe(gulpCsso())
        .pipe(dest('dist/css'))
        .pipe(browserSync.stream());
}

/* inject js into browser */
function jsBundler() {
    return src([
            'node_modules/jquery/dist/jquery.min.js',
            'node_modules/bootstrap/dist/js/bootstrap.min.js',
            'node_modules/sweetalert/dist/sweetalert.min.js',
            'src/js/*.js'
        ])
        .pipe(gulpUglify())
        .pipe(dest('dist/js'))
        .pipe(browserSync.stream());
}

/* static server + watching html/scss/js file */
function serve() {
    browserSync.init({
        server: 'dist',
        port: 3000
    })

    watch(['src/*.html'], htmlBundler)
    watch(['src/scss/*.scss', 'src/scss/*.css'], scssBundler)
    watch(['src/js/*.js'], jsBundler)
    .on('change', browserSync.reload);
}

exports.default = series(clean, parallel(assetBundler, htmlBundler, scssBundler, jsBundler), serve);

