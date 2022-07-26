import fs from 'fs';
import path from 'path';

import paths from './paths';

import expand from 'dotenv-expand';
import dotenv from 'dotenv';

// Make sure that including paths.js after env.js will read .env variables.
delete require.cache[require.resolve('./paths')];

const NODE_ENV = process.env.NODE_ENV;
if (!NODE_ENV) {
	throw new Error('The NODE_ENV environment variable is required but was not specified.');
}

// https://github.com/bkeepers/dotenv#what-other-env-files-can-i-use
const dotenvFiles = [
	`${paths.dotenv}.${NODE_ENV}.local`,
	// Don't include `.env.local` for `test` environment
	// since normally you expect tests to produce the same
	// results for everyone
	NODE_ENV !== 'test' && `${paths.dotenv}.local`,
	`${paths.dotenv}.${NODE_ENV}`,
	paths.dotenv,
].filter(Boolean);

// Load environment variables from .env* files. Suppress warnings using silent
// if this file is missing. dotenv will never modify any environment variables
// that have already been set.  Variable expansion is supported in .env files.
// https://github.com/motdotla/dotenv
// https://github.com/motdotla/dotenv-expand
dotenvFiles.forEach((dotenvFile) => {
	if (fs.existsSync(dotenvFile)) {
		expand.expand(
			dotenv.config({
				path: dotenvFile,
			}),
		);
	}
});

// We support resolving modules according to `NODE_PATH`.
// This lets you use absolute paths in imports inside large monorepos:
// https://github.com/facebook/create-react-app/issues/253.
// It works similar to `NODE_PATH` in Node itself:
// https://nodejs.org/api/modules.html#modules_loading_from_the_global_folders
// Note that unlike in Node, only *relative* paths from `NODE_PATH` are honored.
// Otherwise, we risk importing Node.js core modules into an app instead of webpack shims.
// https://github.com/facebook/create-react-app/issues/1023#issuecomment-265344421
// We also resolve them to make sure all tools using them work consistently.
const appDirectory = fs.realpathSync(process.cwd());
process.env.NODE_PATH = (process.env.NODE_PATH || '')
	.split(path.delimiter)
	.filter((folder) => folder && !path.isAbsolute(folder))
	.map((folder) => path.resolve(appDirectory, folder))
	.join(path.delimiter);

// Grab NODE_ENV and NUGG_APP_* environment variables and prepare them to be
// injected into the application via DefinePlugin in webpack configuration.
const NUGG_APP = /^NUGG_APP_/i;

function getClientEnvironment(publicUrl) {
	const raw1 = Object.keys(process.env).filter((key) => NUGG_APP.test(key));

	if (raw1.length === 0) throw Error(`no NUGG_APP environment vars found`);

	const raw = raw1.reduce(
		(env, key) => {
			env[key] = process.env[key];
			return env;
		},
		{
			// Useful for determining whether we’re running in production mode.
			// Most importantly, it switches React into the correct mode.
			NODE_ENV: process.env.NODE_ENV || 'development',
			// Useful for resolving the correct path to static assets in `public`.
			// For example, <img src={process.env.PUBLIC_URL + '/img/logo.png'} />.
			// This should only be used as an escape hatch. Normally you would put
			// images into the `src` and `import` them in code to get their paths.
			PUBLIC_URL: publicUrl,
			// We support configuring the sockjs pathname during development.
			// These settings let a developer run multiple simultaneous projects.
			// They are used as the connection `hostname`, `pathname` and `port`
			// in webpackHotDevClient. They are used as the `sockHost`, `sockPath`
			// and `sockPort` options in webpack-dev-server.
			WDS_SOCKET_HOST: process.env.WDS_SOCKET_HOST,
			WDS_SOCKET_PATH: process.env.WDS_SOCKET_PATH,
			WDS_SOCKET_PORT: process.env.WDS_SOCKET_PORT,
			// Whether or not react-refresh is enabled.
			// It is defined here so it is available in the webpackHotDevClient.
			FAST_REFRESH: process.env.FAST_REFRESH !== 'false',
		},
	);

	// console.log('injecting into process.env: ', raw1);
	// Stringify all values so we can feed into webpack DefinePlugin
	const stringified = {
		'process.env': Object.keys(raw).reduce((env, key) => {
			env[key] = JSON.stringify(raw[key]);
			return env;
		}, {}),
	};

	return { raw, stringified };
}

export default getClientEnvironment;
