module.exports = function (api) {
    api.cache(true);
    return {
        plugins: [
            [
                '@babel/plugin-transform-typescript',
                {
                    allowDeclareFields: true,
                },
            ],
            ['@babel/plugin-proposal-decorators', { legacy: true }],
            [
                'module-resolver',
                {
                    root: ['.'],
                    extensions: ['.js', '.ts', '.tsx', '.json'],
                    alias: {
                        '@src': './src',
                    },
                },
            ],
            [
                'wildcard',
                {
                    exts: ['js', 'es6', 'es', 'tsx', 'typescript'],
                },
            ],
            ['import-directory'],
        ],
        presets: [
            [
                '@babel/preset-typescript',
                {
                    allowDeclareFields: true,
                },
            ],
            ['@babel/preset-env'],
            ['@babel/preset-react'],
        ],
    };
};
