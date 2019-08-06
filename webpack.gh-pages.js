const path = require('path');
const merge = require('webpack-merge');
const common = require('./webpack.production.js');

module.exports = merge(common, {
    output: {
        path: path.resolve(__dirname, "gh-pages"),
    }
});
