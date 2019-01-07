const webpack = require('webpack');
const dotenv = require('dotenv').config();

module.exports = {
  entry: [
    './client/src/components/app.js'
  ],
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: ['babel-loader']
      },
      {
        test: /\.(css|scss)$/,
        use: [ 'style-loader', {
          loader: 'css-loader',
          query: {
            modules: true,
            localIdentName: '[name]__[local]___[hash:base64:5]'
          }
        }, 'sass-loader']
      }
    ]
  },
  plugins: [new webpack.DefinePlugin({
    'process.env': {
      NODE_ENV: '\'' + process.env.NODE_ENV + '\'',
    },
  })],
  resolve: {
    extensions: ['*', '.js', '.jsx']
  },
  output: {
    path: __dirname + '/client/dist/assets/',
    publicPath: '/client/dist/assets/',
    filename: 'app.bundle.js'
  }
};