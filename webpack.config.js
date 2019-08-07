const path = require('path');

module.exports = {
    devtool: 'source-map',
    mode: 'production',
    entry: {
        hex: './src/index.js',
    },
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "[name].js"
    }
}
