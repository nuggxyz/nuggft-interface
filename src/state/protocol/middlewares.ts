import { Dispatch, Middleware, PayloadAction } from '@reduxjs/toolkit';

import {
    isUndefinedOrNullOrNotNumber,
    isUndefinedOrNullOrObjectEmpty,
    isUndefinedOrNullOrStringEmpty,
} from '../../lib';
import SwapState from '../swap';

import ProtocolState from '.';

const updateEpochMiddleware: Middleware<
    Record<string, unknown>,
    NL.Redux.RootState,
    Dispatch<any>
> =
    ({ getState }) =>
    (next) =>
    async (action: PayloadAction<any>) => {
        if (ProtocolState.isOwnFulfilledAction(action, 'safeSetEpoch')) {
            const currentEpoch = !isUndefinedOrNullOrObjectEmpty(getState().protocol.epoch)
                ? getState().protocol.epoch.id
                : '';
            const nextEpoch = action.payload.data.epoch.id;
            const currentSwap = getState().swap.endingEpoch;
            console.log(action.payload);
            if (
                !isUndefinedOrNullOrStringEmpty(nextEpoch) &&
                currentEpoch !== nextEpoch &&
                (window.location.hash.length <= 2 || window.location.hash.includes('/nugg')) &&
                (isUndefinedOrNullOrNotNumber(currentSwap) || currentSwap === +currentEpoch) &&
                action.payload.data.chainId !== undefined
            ) {
                SwapState.dispatch.initSwap({
                    chainId: action.payload.data.chainId,
                    swapId: `${nextEpoch}-0`,
                });
            }

            // if (!navigator.onLine) {
            //     Web3State.dispatch.setConnectivityWarning(true);
            // }
            // TODO figure out another way todo this
            //  else if (getState().web3.connectivityWarning === true) {
            //     Web3State.dispatch.setConnectivityWarning(false);
            // }
        }
        return next(action);
    };

export default { updateEpochMiddleware };
