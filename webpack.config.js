const path = require('path')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const BrowserSyncPlugin = require('browser-sync-webpack-plugin')

module.exports = {
    entry: {
        global: './src/js/global.js',
        auth: './src/js/auth.js'
    },
    output: {
        path: path.resolve(__dirname, 'public'),
        filename: './js/[name].bundle.js'
    },
    module: {
        rules: [
            {
                test: /\.scss$/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: ['css-loader', 'postcss-loader', 'sass-loader']
                })
            },
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['env']
                    }
                }
            },
            {
                test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
                exclude: path.resolve(__dirname, 'src/img'),
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: '[name].[ext]',
                            outputPath: './css/fonts/',
                            publicPath: '../'
                        }
                    }
                ]
            },
            {
                test: /\.(png|jpg|gif|svg)$/,
                exclude: /(node_modules|bower_components)/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: '[name].[ext]',
                            outputPath: './img/',
                            publicPath: '../'
                        }
                    }
                ]
            }
        ]
    },
    plugins: [
        new ExtractTextPlugin('css/style.css'),
        new BrowserSyncPlugin({
            host: 'localhost',
            port: 3001,
            proxy: 'http://localhost:3000/',
            notify: false,
            files: [
                {
                    match: ['**/*.hbs']
                }
            ]
        })
    ],
    resolve: {
        alias: {
            vue: 'vue/dist/vue.js',
            '@': path.join(__dirname, 'src')
        }
    },
    watch: true
}
