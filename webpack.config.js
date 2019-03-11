let webpack = require('webpack');
let HtmlPlugin = require('html-webpack-plugin');
//let CleanWebpackPlugin = require('clean-webpack-plugin');
let ExtractTextPlugin = require('extract-text-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
let rules = require('./webpack.config.rules')();
let path = require('path');

rules.push({
    test: /\.css$/,
    use: ExtractTextPlugin.extract({
        fallback: 'style-loader',
        use: 'css-loader'
    })
});

module.exports = {
    entry: './src/js/index.js',
    output: {   
        filename: '[name].js',
        path: path.resolve('dist')
    },
    devtool: 'source-map',
    module: { rules },
    optimization: {
        minimizer: [
            // we specify a custom UglifyJsPlugin here to get source maps in production
            new UglifyJsPlugin({
                cache: true,
                parallel: true,
                uglifyOptions: {
                    compress: false,
                    ecma: 6,
                    mangle: true
                },
                sourceMap: true
            })
        ]
    },
    plugins: [
        new ExtractTextPlugin('styles.css'),
        new HtmlPlugin({
            title: "Geo-app",
            template: './src/template/index.hbs'
          }),
        // new CleanWebpackPlugin(['dist'])
    ]
};