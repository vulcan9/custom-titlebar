const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
  target: "web",
  entry: {
    index: "./src/index.ts"
  },
  output: {
    path: path.resolve(__dirname, "./run/lib"),
    filename: "index.js",
    libraryTarget: "umd",
    libraryExport: "default",
    library: "Titlebar",
    globalObject: "this"
  },
  resolve: {
    extensions: [".js", ".ts", ".tsx"]
  },
  plugins: [
    new MiniCssExtractPlugin({
      // linkType: false,
      // filename: '[name].[contenthash].css',
      // chunkFilename: '[id].[contenthash].css',
      // linkType: "text/css",
      filename: "[name].css",
      chunkFilename: "[id].css"
    })
  ],
  module: {
    rules: [
      { test: /\.tsx?$/, loader: "ts-loader" },
      {
        test: /\.scss$/,
        use: [

          /*
          {
            loader: "style-loader",
            options: {
              injectType: "lazyStyleTag"
            }
          },
          "@teamsupercell/typings-for-css-modules-loader",
          {
            loader: "css-loader",
            options: {
              modules: true
            }
          },
          */

          // https://runebook.dev/ko/docs/webpack/loaders/style-loader?page=3
          // https://yamoo9.gitbook.io/webpack/webpack/webpack-plugins/extract-css-files
          // https://runebook.dev/ko/docs/webpack/plugins/mini-css-extract-plugin

          MiniCssExtractPlugin.loader,
          "css-loader",
          "sass-loader"
        ]
      }
    ]
  }
};