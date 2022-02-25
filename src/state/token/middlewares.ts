import { PayloadAction } from '@reduxjs/toolkit';

import AppState from '@src/state/app';

import TokenState from '.';

const onTokenSet: NL.Redux.Middleware<
    Record<string, unknown>,
    NL.Redux.RootState,
    NL.Redux.Dispatch<any>
> =
    ({ getState }) =>
    (next) =>
    async (action: PayloadAction<any>) => {
        const go = next(action);
        if (TokenState.isOwnFulfilledAction(action, 'setTokenFromId')) {
            AppState.silentlySetRoute(`#/nugg/${action.payload}`);
        }
        return go;
    };

export default { onTokenSet };
