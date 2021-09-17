// ==============
// ==== PATH ====
// ==============

const source_folder = "src";
const project_folder = "dist";

const path = {
  src: {
    html: [source_folder + "/*.html", "!" + source_folder + "/_*.html"],
    css: source_folder + "/assets/scss/main.scss",
    js: source_folder + "/assets/js/main.js",
    img: source_folder + "/assets/img/**/*.{jpg,png,svg,gif,ico,webp}",
    fonts: source_folder + "/assets/fonts/*.ttf",
  },
  build: {
    html: project_folder + "/",
    css: project_folder + "/assets/css/",
    js: project_folder + "/assets/js/",
    img: project_folder + "/assets/img/",
    fonts: project_folder + "/assets/fonts/",
  },
  watch: {
    html: source_folder + "/**/*.html",
    css: source_folder + "/assets/scss/**/*.scss",
    js: source_folder + "/assets/js/**/*.js",
    img: source_folder + "/assets/img/**/*.{jpg,png,svg,gif,ico,webp}",
  },
  del: "",
};

// =================
// ==== IMPORTS ====
// =================

const { src, dest } = require("gulp");
const gulp = require("gulp");
const browser_sync = require("browser-sync").create();
const del = require("del");
// const webp = require("gulp-webp");
// const webphtml = require("gulp-webp-html");
const file_include = require("gulp-file-include");
const scss = require("gulp-sass")(require("sass"));
const group_media = require("gulp-group-css-media-queries");
const autoprefixer = require("gulp-autoprefixer");
const clean_css = require("gulp-clean-css");
const rename = require("gulp-rename");
const uglify = require("gulp-uglify-es").default;
const imagemin = require("gulp-imagemin");
// const webpcss = require("gulp-webpcss");
const svgSprite = require("gulp-svg-sprite");

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
  return (
    src(path.src.html)
      .pipe(file_include())
      // .pipe(webphtml())
      .pipe(dest(path.build.html))
      .pipe(browser_sync.stream())
  );
}

function css() {
  return (
    src(path.src.css)
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
      // .pipe(webpcss())
      .pipe(dest(path.build.css))
      .pipe(clean_css())
      .pipe(
        rename({
          extname: ".min.css",
        })
      )
      .pipe(dest(path.build.css))
      .pipe(browser_sync.stream())
  );
}

function js() {
  return src(path.src.js)
    .pipe(file_include())
    .pipe(dest(path.build.js))
    .pipe(uglify())
    .pipe(
      rename({
        extname: ".min.js",
      })
    )
    .pipe(dest(path.build.js))
    .pipe(browser_sync.stream());
}

function images() {
  // return src("src/assets/img/**/*.{jpg,png,svg,gif,ico,webp}")
  //   .pipe(
  //     webp({
  //       quality: 70,
  //     })
  //   )
  //   .pipe(dest("dist/assets/img/"))

  return (
    src(path.src.img)
      // .pipe(src("src/assets/img/**/*.{jpg,png,svg,gif,ico,webp}"))
      .pipe(
        imagemin({
          progressive: true,
          svgoPlugins: [{ removeViewBox: false }],
          interlaced: true,
          optimizationLevel: 3, // from 0 to 7
        })
      )
      .pipe(dest(path.build.img))
      .pipe(browser_sync.stream())
  );
}

gulp.task("sprite", function () {
  return src("src/assets/iconsprite/*.svg")
    .pipe(
      svgSprite({
        mode: {
          stack: {
            sprite: "../icons/icons.svg",
            example: false,
          },
        },
      })
    )
    .pipe(dest("src/assets/img"));
});

function watchFiles() {
  gulp.watch([path.watch.html], html);
  gulp.watch([path.watch.css], css);
  gulp.watch([path.watch.js], js);
  gulp.watch([path.watch.img], images);
}

const build = gulp.series(clean, gulp.parallel(html, css, js, images));
const watch = gulp.parallel(build, watchFiles, browserSync);

exports.html = html;
exports.css = css;
exports.js = js;
exports.images = images;
exports.clean = clean;

exports.default = watch;
