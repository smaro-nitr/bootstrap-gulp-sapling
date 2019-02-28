const autoprefixer = require('autoprefixer');

module.exports = {
  entry: [
    './app/src/scss/style.scss', 
    './app/src/js/script.js'
  ],
  output: {
    filename: './app/assets/js/bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.html$/,
        loader: "raw-loader"
      },
      {
        test: /\.scss$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: './app/assets/css/bundle.css',
            },
          },
          {loader: 'extract-loader'},
          {loader: 'css-loader'},
          {loader: 'postcss-loader',
            options: {
              plugins: () => [autoprefixer()],
            },
          },
          {
            loader: 'sass-loader',
            options: {
              includePaths: ['./node_modules'],
            },
          }
        ],
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015'],
          plugins: ['transform-object-assign']
        },
      }
    ],
  },
  devServer: {
    port: 3001,
    contentBase: 'app',
    watchContentBase: true
  } 
};
