const common = {
    output: {
        filename: '[name].bundle.js'
    },
    mode: 'development',
    devtool: 'inline-source-map',
    module: {
        rules: [{
            test: /.ts$/,
            loader: 'ts-loader'
        }]
    },
    resolve: {
        extensions: ['.ts', 'js']
    }
}

module.exports = [{
    ...common,
    entry: {
        server: './src/server.ts'
    },
    target: 'node',
    externals: nodeModules
}]
