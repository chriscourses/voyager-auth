// Always run this config before deployment: npm run build
const merge = require('webpack-merge')
const common = require('./webpack.config.js')
const NodemonPlugin = require('nodemon-webpack-plugin')

module.exports = merge(common, {
    mode: 'development',
    plugins: [
        new NodemonPlugin({
            script: './bin/www',
            verbose: true,
            ext: 'js',
            watch: '.'
        })
    ],
    devtool: 'cheap-eval-source-map'
})
