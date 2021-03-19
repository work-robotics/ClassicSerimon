const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const nodeExternals = require("webpack-node-externals");

var electron_main = {
  mode: "development",
  target: "electron-main",
  entry: "./src/main.ts",
  output: { filename: "main.js", path: path.join(__dirname, "/dist") },
  node: { __dirname: false, __filename: false },
  module: {
    rules: [{ test: /.ts?$/, loader: "ts-loader" }],
  },
  resolve: { extensions: [".js", ".ts"] },
};

var electron_renderer = {
  mode: "development",
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

module.exports = [electron_main, electron_renderer];
