
const path = require('path');
module.exports = {

    mode: 'prodection',
    entry: path.resolve(__dirname, "../src/test_netbus_server.ts"),
    module: {
        rules: [
          {
            test: /\.tsx?$/,
            use: 'ts-loader',
            exclude: /node_modules/
          }
        ]
      },
      resolve: {
        extensions: [ '.tsx', '.ts', '.js' ],
        alias: {
          '@': path.resolve(__dirname, '../src'),
        },
      },
      output: {
        filename: 'app.js',
        path: path.resolve(__dirname, '../dist')
      },
      target: 'node',
      externals: nodeModules,
}