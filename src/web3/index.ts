import * as config from './config';
import * as core from './core/core';
import * as clients from './clients';

export default { config, core, clients, hook: config.priority };
