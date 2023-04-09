// @ts-check
const prod = require("./webpack.prod.config");
const webviewAppRoot = "./src/index.tsx";
const { merge } = require("webpack-merge");

// /** @type {import('webpack').Configuration} */
module.exports = merge(prod, {
    mode: "development",
    entry: {
        webviewApp: webviewAppRoot,
    }
});