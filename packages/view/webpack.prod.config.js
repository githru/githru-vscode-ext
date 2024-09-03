const path = require("path");

const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const ReactRefreshWebpackPlugin = require("@pmmmwh/react-refresh-webpack-plugin");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");

/** @type {import('webpack').Configuration} */
const config = {
  mode: "production",
  entry: {
    webviewApp: "./src/index.prod.tsx",
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js",
  },
  devtool: "nosources-source-map",
  externals: {
    vscode: "commonjs vscode",
  },
  resolve: {
    extensions: [".js", ".ts", ".tsx", ".json"],
    alias: {
      assets: path.resolve(__dirname, "src/assets/"),
      components: path.resolve(__dirname, "src/components/"),
      utils: path.resolve(__dirname, "src/utils/"),
      services: path.resolve(__dirname, "src/services/"),
      styles: path.resolve(__dirname, "src/styles/"),
      types: path.resolve(__dirname, "src/types/"),
      hooks: path.resolve(__dirname, "src/hooks/"),
      store: path.resolve(__dirname, "src/store/"),
    },
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        loader: "ts-loader",
        options: {},
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: "style-loader",
          },
          {
            loader: "css-loader",
          },
        ],
      },
      {
        test: /.(sass|scss)$/,
        use: [{ loader: "style-loader" }, { loader: "css-loader" }, { loader: "sass-loader" }],
      },
      {
        test: /\.svg$/,
        issuer: /\.[jt]sx?$/,
        loader: "@svgr/webpack",
      },
    ],
  },
  performance: {
    hints: false,
  },
  plugins: [
    new webpack.DefinePlugin({
      VERSION: JSON.stringify("v0.1.0"),
    }),
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: "./public/index.html",
    }),
    new ReactRefreshWebpackPlugin(),
    new ForkTsCheckerWebpackPlugin(),
  ],
};
module.exports = config;
