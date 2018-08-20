const path = require('path');

module.exports = {
    mode: "development",
    target: 'node',
    context: path.resolve("src"),
    entry: './index.ts',
    
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'index.js',
        libraryTarget: "umd"
    },
    resolve : {
        extensions : [".webpack.js", ".web.js", ".ts", ".js"]
      },
    "devtool": "source-map",
    module: {
        rules: [{
            "test": /\.tsx?$/,
            "exclude": /node_modules/,
            loader: "awesome-typescript-loader",
            options: {
                configFileName: "tsconfig.webpack.json"
            }
        }]
    }
};
