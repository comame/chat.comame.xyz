module.exports = {
    output: {
        filename: '[name].bundle.js',
        assetModuleFilename: '[name][ext]'
    },
    mode: 'development',
    devtool: 'inline-source-map',
    module: {
        rules: [{
            test: /.tsx?$/,
            loader: 'ts-loader'
        }, {
            test: /.html$/,
            type: 'asset/resource'
        }]
    },
    resolve: {
        extensions: ['.ts', '.tsx', 'js']
    },
    entry: './src/web/index.tsx'
}
