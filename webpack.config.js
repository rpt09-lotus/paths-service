const webpack = require('webpack');

module.exports = {
  entry: [
    './client/src/index.js'
  ],
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: ['babel-loader']
      }
    // , {
    // test: /\.css$/,
    // use: [ 'style-loader', 'css-loader' ]
    // },
    ]
  },
  resolve: {
    extensions: ['*', '.js', '.jsx']
  },
  output: {
    path: __dirname + '/client/dist/assets/',
    publicPath: '/client/dist/assets/',
    filename: 'app.bundle.js'
  }
};