// I dont think we need this, saving it just in case

// // webpack config
// plugins: [new ESLintClearPlugin()]
// const ESLintClearPlugin = require('./webpack/plugins/clearEslintCache');

// https://stackoverflow.com/a/68166046

// var exec = require('child_process').execSync;

// module.exports = class ESLintClearPlugin {
//     constructor(options) {
//         this.options = options;
//     }
//     apply(compiler) {
//         compiler.hooks.watchRun.tap('ESLintClearPlugin', () => {
//             exec('del .eslintcache');
//         });
//     }
// };
