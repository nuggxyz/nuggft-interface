import _emitter from './core';
import { EmitEventNames } from './interfaces';
import hook from './hook';

const emitter = {
    emit: _emitter.emit,
    events: EmitEventNames,
    hook,
};

export default emitter;

// emitter.hook.useOn({
//     type: emitter.events.OfferModalOpened,
//     callback: useCallback((args) => {
//         args.onModalOpen();
//     }, []),
// });

// useEffect(() => {
//     emitter.emit({
//         type: emitter.events.OfferModalOpened,
//         onModalOpen: () => {
//             console.log('hi boo');
//         },
//     });
// }, []);
