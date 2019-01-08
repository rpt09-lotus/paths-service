const webpack = require('webpack');
const dotenv = require('dotenv').config();
const CompressionPlugin = require('compression-webpack-plugin');

module.exports = {
  entry: [
    './client/src/components/app.js'
  ],
  devtool: false, 
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          query: {
            plugins: [
              [require('babel-plugin-transform-imports'), {
                '@fortawesome/free-solid-svg-icons': {
                  'transform': '@fortawesome/free-solid-svg-icons/${member}',
                  'skipDefaultConversion': true
                }
              }]
            ]
          }
        }
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
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"' + process.env.NODE_ENV + '"'
    }),
    new webpack.IgnorePlugin({
      resourceRegExp: /^\.\/locale$/,
      contextRegExp: /moment$/
    }),
    new CompressionPlugin()
  ],
  resolve: {
    extensions: ['*', '.js', '.jsx']
  },
  output: {
    path: __dirname + '/client/dist/assets/',
    publicPath: '/client/dist/assets/',
    filename: 'app.bundle.js'
  }
};