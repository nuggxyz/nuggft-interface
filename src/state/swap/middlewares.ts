import { AnyAction } from '@reduxjs/toolkit';

import { isUndefinedOrNullOrObjectEmpty } from '../../lib';

import SwapState from '.';

const setSwapActiveStatus: NL.Redux.Middleware<
    Record<string, unknown>,
    NL.Redux.RootState,
    NL.Redux.Dispatch<any>
> =
    ({ getState }) =>
    (next) =>
    async (action: AnyAction) => {
        const go = next(action);
        if (SwapState.isOwnFulfilledAction(action, 'initSwap')) {
            const currentEpoch = !isUndefinedOrNullOrObjectEmpty(
                getState().protocol.epoch,
            )
                ? getState().protocol.epoch.id
                : null;
            SwapState.dispatch.setStatus(
                action.meta.arg.swapId.includes(currentEpoch)
                    ? 'ongoing'
                    : action.meta.arg.swapId.includes('-0')
                    ? 'waiting'
                    : 'over',
            );
        }
        return go;
    };

export default { setSwapActiveStatus };
