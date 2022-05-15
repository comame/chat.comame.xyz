module.exports = {
    output: {
        filename: '[name].bundle.js',
        assetModuleFilename: '[name][ext]'
    },
    mode: 'development',
    devtool: 'inline-source-map',
    module: {
        rules: [{
            test: /.ts$/,
            loader: 'ts-loader'
        }, {
            test: /.html$/,
            type: 'asset/resource'
        }]
    },
    resolve: {
        extensions: ['.ts', 'js']
    },
    entry: './src/web/index.ts'
}
