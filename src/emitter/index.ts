import _emitter from './core';
import { EmitEventNames } from './interfaces';
import hook from './hook';

const emitter = {
    emit: _emitter.emit,
    events: EmitEventNames,
    hook,
};

export default emitter;
