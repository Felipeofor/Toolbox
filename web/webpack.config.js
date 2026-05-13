const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = (env, argv) => {
  const isProd = argv.mode === 'production'
  const apiBaseUrl = process.env.API_BASE_URL || 'http://localhost:3000'

  return {
    entry: './src/index.jsx',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: isProd ? '[name].[contenthash].js' : 'bundle.js',
      clean: true,
      publicPath: '/'
    },
    resolve: { extensions: ['.js', '.jsx'] },
    module: {
      rules: [
        {
          test: /\.jsx?$/,
          exclude: /node_modules/,
          use: { loader: 'babel-loader' }
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader']
        }
      ]
    },
    plugins: [
      new HtmlWebpackPlugin({ template: './public/index.html' }),
      new (require('webpack')).DefinePlugin({
        'process.env.API_BASE_URL': JSON.stringify(apiBaseUrl)
      })
    ],
    devServer: {
      port: 8080,
      historyApiFallback: true,
      hot: true,
      static: path.resolve(__dirname, 'public')
    },
    devtool: isProd ? 'source-map' : 'eval-cheap-module-source-map',
    performance: {
      hints: isProd ? 'warning' : false,
      maxAssetSize: 1536 * 1024,
      maxEntrypointSize: 1536 * 1024
    }
  }
}
