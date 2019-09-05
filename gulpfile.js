const gulp = require("gulp");
const pug = require("gulp-pug");
const fs = require("fs");
const data = require("gulp-data");
const path = require("path");
const plumber = require("gulp-plumber");
const notify = require("gulp-notify");
const browsersync = require("browser-sync");
const sass = require("gulp-sass");
const autoprefixer = require("gulp-autoprefixer");
const cssmin = require("gulp-cssmin");
const uglify = require("gulp-uglify");
const del = require("del");

// 開発ディレクトリパス格納
const src = {
  html: ["src/**/*.pug", "!" + "src/**/_*.pug"],
  _scss: "src/sass/_*.scss",
  scss: "src/sass/*.scss",
  js: "src/**/*.js",
  image: "src/images/**/*",
  json: "src/_data/"
};

//  出力するディレクトリを指定
const dest = "public/";

// pugをコンパイルしてから、publicディレクトリに出力
gulp.task("html", () => {
  // JSONファイルの読み込み。
  var locals = {
    site: JSON.parse(fs.readFileSync(src.json + "site.json"))
  };
  return (
    gulp
      .src(src.html)
      .pipe(
        plumber({ errorHandler: notify.onError("Error: <%= error.message %>") })
      )
      // 各ページごとの`/`を除いたルート相対パスを取得します。
      .pipe(
        data(function(file) {
          locals.relativePath = path.relative(
            file.base,
            file.path.replace(/.pug$/, ".html")
          );
          return locals;
        })
      )
      .pipe(
        pug({
          locals: locals,
          basedir: "src", // Pugファイルのルートディレクトリを指定します。
          pretty: true
        })
      )
      .pipe(gulp.dest(dest))
  );
});

//Sass
gulp.task("scss", () => {
  return gulp
    .src([src.scss, "!" + src._scss])
    .pipe(
      plumber({
        errorHandler: notify.onError("Error: <%= error.message %>")
      })
    )
    .pipe(
      sass({
        outputStyle: "expanded"
      })
    )
    .pipe(
      autoprefixer({
        overrideBrowserslist: "last 2 versions"
      })
    )
    .pipe(cssmin())
    .pipe(gulp.dest(dest + "/css"));
});

//JavaScript
gulp.task("js", () => {
  return gulp
    .src(src.js)
    .pipe(uglify())
    .pipe(gulp.dest(dest + "/js"));
});

//Image File
gulp.task("image", () => {
  return gulp.src(src.image).pipe(gulp.dest(dest + "/images"));
});

//Browser Sync
gulp.task("browser-sync", done => {
  browsersync({
    server: {
      baseDir: dest
    }
  });
  done();
});

//Reload
gulp.task("reload", done => {
  browsersync.reload();
  done();
});

//Watch
gulp.task("watch", done => {
  gulp.watch(src.scss, gulp.task("scss"));
  gulp.watch(src.html, gulp.task("html"));
  gulp.watch(src.js, gulp.task("js"));
  gulp.watch(src.image, gulp.task("image"));
  gulp.watch("src/*/**", gulp.task("reload"));
  done();
});

//Clean
gulp.task("clean", done => {
  del.sync(dest + "/**", "！" + dest);
  done();
});

//Default
gulp.task(
  "default",
  gulp.series(
    "clean",
    gulp.parallel("html", "scss", "js", "image", "watch", "browser-sync")
  )
);
