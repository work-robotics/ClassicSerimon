const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const nodeExternals = require("webpack-node-externals");
const electron = require("electron-connect").server;
const fs = require("fs");
const { format } = require("util");

class ElectronAutoRepload {
  server = undefined;
  intervalId = undefined;
  mainProcessPath = "./dist/main.js";
  constructor() {
    this.intervalId = setInterval(() => {
      if (this.server == undefined && fs.existsSync(this.mainProcessPath)) {
        this.server = electron.create();
        this.server.start();
        console.log("\n\u001b[36m===================================================\u001b[0m");
        console.log(format("\u001b[36m[%s] ElectronServer Start.\u001b[0m", new Date()));
        console.log("\u001b[36m===================================================\u001b[0m\n");
        clearInterval(this.intervalId);
      }
    }, 1000);
  }
  apply(compiler) {
    compiler.hooks.done.tap("ElectronAutoRepload", () => {
      if (this.server != undefined) {
        this.server.reload();
        console.log("\n\u001b[36m===================================================\u001b[0m");
        console.log(format("\u001b[36m[%s] Renderer Reload.\u001b[0m", new Date()));
        console.log("\u001b[36m===================================================\u001b[0m\n");
      }
    });
  }
}

var electron_main = {
  target: "electron-main",
  entry: "./src/main.ts",
  output: { filename: "main.js", path: path.join(__dirname, "/dist") },
  node: { __dirname: false, __filename: false },
  module: {
    rules: [{ test: /.ts?$/, loader: "ts-loader" }],
  },
  resolve: { extensions: [".js", ".ts"] },
  plugins: [],
};

var electron_renderer = {
  target: "electron-renderer",
  entry: "./src/index.tsx",
  output: { filename: "index.js", path: __dirname + "/dist/contents" },
  resolve: {
    extensions: [".json", ".js", ".jsx", ".css", ".ts", ".tsx"],
  },
  externals: [
    nodeExternals({
      allowlist: [/^bootstrap/],
    }),
  ],
  module: {
    rules: [
      { test: /\.(tsx|ts)$/, loader: "ts-loader" },
      { test: /\.css$/i, use: ["style-loader", "css-loader"] },
    ],
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: "./src/*.html", to: "[name].[ext]" },
        { from: "./src/*.css", to: "[name].[ext]" },
      ],
    }),
  ],
};

module.exports = (env, argv) => {
  if (argv.mode === "development") {
    electron_renderer.plugins.push(new ElectronAutoRepload());
  }
  return [electron_main, electron_renderer];
};
