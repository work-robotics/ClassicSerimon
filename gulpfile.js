const { dest, watch, parallel, series } = require("gulp");
const webpackStream = require("webpack-stream");
const webpack = require("webpack");
const electron = require("electron-connect").server.create();

const [mainConfig, rendererConfig] = require("./webpack.config");

const Main = (done) => {
  return webpackStream(mainConfig, webpack).pipe(dest("./dist"));
};

const Renderer = (done) => {
  return webpackStream(rendererConfig, webpack).pipe(dest("./dist/contents"));
};

const Restart = (done) => {
  electron.restart();
  done();
};

const Reload = (done) => {
  electron.reload();
  done();
};

const Start = (done) => {
  electron.start();
  done();
};

const Watch = () => {
  watch("src/main.ts", series(Main, Restart));
  watch(["src/*.{ts,tsx,html,css}", "!src/main.ts"], series(Renderer, Reload));
};

exports.default = parallel(Start, Watch);
