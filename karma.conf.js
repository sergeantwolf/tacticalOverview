'use strict';

var path = require('path');
var webpack = require('webpack');

module.exports = function (config) {
    config.set({
        basePath: '',
        frameworks: ['jasmine'],
        files: [
            'test/helpers/**/*.js',
            'test/spec/**/*.js'
        ],
        preprocessors: {
            'test/spec/**/*.js': ['webpack']
        },
        webpack: {
            cache: true,
            module: {
                loaders: [{
                    test: /\.gif/,
                    loader: 'url-loader?limit=10000&mimetype=image/gif'
                }, {
                    test: /\.jpg/,
                    loader: 'url-loader?limit=10000&mimetype=image/jpg'
                }, {
                    test: /\.png/,
                    loader: 'url-loader?limit=10000&mimetype=image/png'
                }, {
                    test: /\.js$/,
                    exclude: /node_modules/,
                    loader: 'jsx-loader?harmony!babel-loader'
                }, {
                    test: /\.css$/,
                    loader: 'style-loader!css-loader'
                }]
            },
            resolve: {
                alias: {
                    'styles': path.join(process.cwd(), './src/styles/'),
                    'json': path.join(process.cwd(), './src/json'),
                    'components': path.join(process.cwd(), './src/components'),
                    'classes': path.join(process.cwd(), './src/classes')
                }
            },
            plugins: [
                new webpack.ProvidePlugin({
                    $: "jquery",
                    jQuery: "jquery",
                    "window.jQuery": "jquery",
                    "root.jQuery": "jquery"
                })
            ]
        },
        webpackServer: {
            stats: {
                colors: true
            }
        },
        exclude: [],
        port: 8080,
        logLevel: config.LOG_INFO,
        colors: true,
        autoWatch: false,
        // Start these browsers, currently available:
        // - Chrome
        // - ChromeCanary
        // - Firefox
        // - Opera
        // - Safari (only Mac)
        // - PhantomJS
        // - IE (only Windows)
        browsers: ['Chrome'],
        reporters: ['progress'],
        captureTimeout: 60000,
        singleRun: true
    });
};
