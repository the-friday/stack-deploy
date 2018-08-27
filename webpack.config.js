var path = require('path');
var webpack = require('webpack');
module.exports = {
  entry:   './src/index.ts',
  target:  'node',
  output:  {
    path:     path.join(__dirname, 'build'),
    filename: 'app.js'
  },
  devtool: 'source-map',
  resolve: {
    // Add `.ts` and `.tsx` as a resolvable extension.
    extensions: [".ts", ".js"]
  },
  plugins: [
    new webpack.DefinePlugin({"global.GENTLY": false})
  ],
  node:    {
    __dirname: true,
  },
  module:  {
    rules: [
      {test: /\.ts$/, loader: "ts-loader"}
    ]
  }
};