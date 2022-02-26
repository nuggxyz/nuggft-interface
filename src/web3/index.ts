import * as config from './config';
import * as core from './core/core';
import * as clients from './clients';

const web3 = { config, core, clients, hook: config.priority };

export default web3;
