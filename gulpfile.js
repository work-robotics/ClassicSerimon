const { dest, watch, parallel } = require("gulp");
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
  watch("src/main.ts", Main);
  watch("src/*.{ts,tsx,html,css}", Renderer);
  watch("dist/main.js", Restart);
  watch("dist/contents/*.{html,js,css}", Reload);
};

exports.default = parallel(Start, Watch);
