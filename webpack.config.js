const path = require( 'path' )


module.exports = {
    entry: './frontend/1-webpack/0-data/snarkyjs.mjs',
    output: {
      filename: 'snarkyjs.mjs',
      path: path.resolve( __dirname, 'frontend/1-webpack/1-build' ),
      library: {
        type: 'module',
      },
    },
    experiments: {
      outputModule: true,
    },
    module: {
        rules: [
            {
                test: /\.m?js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                loader: 'babel-loader',
                options: {
                    presets: ['@babel/preset-env'],
                },
                },
            },
        ],
    },
}