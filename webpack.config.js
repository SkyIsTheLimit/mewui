const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
  entry: './src/index.ts',
  output: {
    path: path.join(__dirname, 'dist', 'umd'),
    filename: 'mewui.js',
    library: 'MewUI',
    libraryTarget: 'umd'
  },
  resolve: {
    extensions: ['.ts']
  },
  module: {
    rules: [{
      test: /\.ts$/,
      loader: 'ts-loader'
    }]
  },
  devtool: 'source-map',
  plugins: [
    new CleanWebpackPlugin()
  ]
}