//@ts-check

"use strict";
const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

/**@type {import('webpack').Configuration} */
const config = {
    mode: "production",
    entry: {
        webviewApp: "./src/index.tsx",
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
                test: /.(sass|scsss)$/,
                use: [
                    {loader: "style-loader" },
                    {loader: "css-loader" },
                    {loader: "sass-loader" },
                ],
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
}
module.exports = config;