const prod = require("./webpack.prod.config");

const webviewAppRoot = "./src/index.tsx";
const { merge } = require("webpack-merge");

/** @type {import('webpack').Configuration} */
const config = merge(prod, {
  mode: "development",
  entry: {
    webviewApp: webviewAppRoot,
  },
  devServer: {
    port: 3000,
  },
});
module.exports = config;
