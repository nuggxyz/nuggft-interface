import * as config from './config';
import * as core from './core/core';
import * as clients from './clients';
import * as interfaces from './core/interfaces';
import * as store from './core/store';
import * as constants from './constants';

const web3 = {
	config: {
		...config,
		...constants,
	},
	constants,
	store,
	core,
	...interfaces,
	clients,
	hook: { ...config.priority, ...config.network, ...config.selected },
};

export default web3;
