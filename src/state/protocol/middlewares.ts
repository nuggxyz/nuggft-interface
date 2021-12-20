import { Dispatch, Middleware, PayloadAction } from '@reduxjs/toolkit';

import {
    isUndefinedOrNullOrObjectEmpty,
    isUndefinedOrNullOrStringEmpty,
} from '../../lib';
import SwapState from '../swap';
import Web3Dispatches from '../web3/dispatches';

import ProtocolState from '.';

const updateEpochMiddleware: Middleware<
    Record<string, unknown>,
    NL.Redux.RootState,
    Dispatch<any>
> =
    ({ getState }) =>
    (next) =>
    async (action: PayloadAction<any>) => {
        if (ProtocolState.isOwnFulfilledAction(action, 'updateEpoch')) {
            const currentEpoch = !isUndefinedOrNullOrObjectEmpty(
                getState().protocol.epoch,
            )
                ? getState().protocol.epoch.id
                : '';
            const nextEpoch = action.payload.data.epoch.id;
            const currentSwap = getState().swap.id;
            if (
                currentEpoch !== nextEpoch &&
                (isUndefinedOrNullOrStringEmpty(currentSwap) ||
                    currentSwap.split('-')[1] === currentEpoch)
            ) {
                SwapState.dispatch.initSwap({
                    swapId: `${nextEpoch}-${nextEpoch}`,
                });
            }

            if (!navigator.onLine) {
                Web3Dispatches.setConnectivityWarning(true);
            } else if (getState().web3.connectivityWarning === true) {
                Web3Dispatches.setConnectivityWarning(false);
            }
        }
        return next(action);
    };

export default { updateEpochMiddleware };
