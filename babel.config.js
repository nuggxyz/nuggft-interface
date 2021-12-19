/** @format */

// https://reactnative.dev/docs/typescript#using-custom-path-aliases-with-typescript

module.exports = function (api) {
    api.cache(true);
    return {
        plugins: [
            // [
            //     'module-resolver',
            //     {
            //         root: ['./src'],
            //         extensions: ['.js', '.ts', '.tsx', '.json', '.svg'],
            //         alias: {
            //             '@src': './src',
            //         },
            //     },
            // ],
            
               [ '@babel/plugin-transform-typescript', {
                   allowDeclareFields: true,
               }],
            ['@babel/plugin-proposal-decorators', { legacy: true }],
        ],
        presets: [
            [
                '@babel/preset-typescript',
                {
                    allowDeclareFields: true,
                },
            ],
            ["@babel/preset-env"],
            ["@babel/preset-react"]
        ],
    };
};
