import * as config from './config';
import * as core from './core/core';
import * as clients from './clients';
import * as interfaces from './core/interfaces';

const web3 = { config, core, ...interfaces, clients, hook: config.priority };

export default web3;
