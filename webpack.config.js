const path = require('path')

module.exports = {
  mode: 'development',
  entry: {
    main: './src.index.js'
  },
  devtool: 'cheap-module-eval-source-map',
  devServer: {
    contentBase: './dist',
    open: 'true',
    port: 9000
  },
  module: {
    rules: [{
      test: /\.js$/,
      exclude: /node_modules/,
      loader: 'babel-loader'
    }]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html'
    }),
    new CleanWebpackPlugin({
      dry: false,
      cleanStateWebpackAssets: true,
      cleanOnceBeforeBuildPatterns: [
        path.resolve(__dirname, 'dist')
      ]
    })
  ],
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  }
}