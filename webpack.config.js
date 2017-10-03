var path = require('path');

module.exports = {
  devtool: "sourcemap",
  entry: {
    domBeep: 'domBeep',
    options: 'options',
  },

  output: {
    path: path.resolve(__dirname, 'extension/js'),
    filename: '[name].js'
  },

  resolve: {
    extensions: [".ts", ".js", ".json"],
    modules: [path.resolve(__dirname, 'src'), 'node_modules']
  },

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'awesome-typescript-loader'
      }
    ]
  },

  watch: process.env.DEV === 'yes'
};
