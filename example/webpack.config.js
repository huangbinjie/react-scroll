var webpack = require('webpack');
var path = require('path');

module.exports = {
  entry: [
    './src/app.tsx'
  ],
  output: {
    path: path.join(__dirname, './dist'),
    filename: 'app.js'
  },
  module: {
    loaders: [
      { test: /\.tsx?$/, loader: 'ts-loader' }
    ]
  },
  resolve: {
    extensions: ['', '.webpack.js', '.tsx', '.ts', '.js']
  }
}