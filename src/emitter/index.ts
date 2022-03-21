import _emitter from './core';
import { EmitEventNames } from './interfaces';
import hook from './hook';

const emitter = {
    ..._emitter,
    events: EmitEventNames,
    hook,
};

export default emitter;
