var path = require('path');

module.exports = {
  entry: {
    domBeep: 'domBeep',
    options: 'options',
  },

  output: {
    path: path.resolve(__dirname, 'extension/js'),
    filename: '[name].js'
  },

  resolve: {
    modules: [path.resolve(__dirname, 'src'), 'node_modules']
  },

  watch: process.env.DEV === 'yes'
};