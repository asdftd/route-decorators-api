const path = require('path');

module.exports = {
    mode: "production",
    target: 'node',
    context: path.resolve("src"),
    entry: './index.ts',
    output: {
        filename: 'index.js',
        path: path.resolve(__dirname, 'dist')
    },
    resolve : {
        extensions : [".ts"]
      },
    "devtool": "source-map",
    module: {
        rules: [{
            "test": /\.tsx?$/,
            "exclude": /node_modules/,
            loader: "ts-loader",
            options: {
                configFile: "tsconfig.build.json"
            }
        }]
    }
};
