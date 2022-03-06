import * as config from './config';
import * as core from './core/core';
import * as clients from './clients';
import * as interfaces from './core/interfaces';
import * as store from './core/store';

const web3 = {
    config,
    store,
    core,
    ...interfaces,
    clients,
    hook: { ...config.priority, ...config.network },
};

export default web3;
