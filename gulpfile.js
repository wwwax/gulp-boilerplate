const { src, dest } = require("gulp");
const gulp = require("gulp");
const browser_sync = require("browser-sync").create();
const del = require("del");
const webp = require("gulp-webp");
const webphtml = require("gulp-webp-html");
const file_include = require("gulp-file-include");
const scss = require("gulp-sass")(require("sass"));
const group_media = require("gulp-group-css-media-queries");
const autoprefixer = require("gulp-autoprefixer");
const clean_css = require("gulp-clean-css");
const rename = require("gulp-rename");

function browserSync() {
  browser_sync.init({
    server: {
      baseDir: "./dist/",
    },
    port: 3000,
    notify: true,
  });
}

function clean() {
  return del("dist");
}

function html() {
  return src(["src/*.html", "!src/_*.html"])
    .pipe(file_include())
    .pipe(webphtml())
    .pipe(dest("dist/"))
    .pipe(browser_sync.stream());
}

function css() {
  return src("src/assets/scss/main.scss")
    .pipe(
      scss({
        outputStyle: "expanded",
      }).on("error", scss.logError)
    )
    .pipe(group_media())
    .pipe(
      autoprefixer({
        overrideBrowserslist: ["last 5 versions"],
        cascade: true,
      })
    )
    .pipe(dest("dist/assets/css"))
    .pipe(clean_css())
    .pipe(
      rename({
        extname: ".min.css",
      })
    )
    .pipe(dest("dist/assets/css"))
    .pipe(browser_sync.stream());
}

function images() {
  return src("src/assets/img/**/*.{jpg,png}")
    .pipe(
      webp({
        quality: 70,
      })
    )
    .pipe(dest("dist/assets/img/"));
}

function watchFiles() {
  gulp.watch(["src/**/*.html"], html);
  gulp.watch(["src/assets/scss/**/*.scss"], css);
}

const build = gulp.series(clean, gulp.parallel(html, css, images));
const watch = gulp.parallel(build, watchFiles, browserSync);

exports.html = html;
exports.css = css;
exports.images = images;
exports.clean = clean;

exports.default = watch;
