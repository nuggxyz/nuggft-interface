import { Dispatch, Middleware, PayloadAction } from '@reduxjs/toolkit';

import {
    isUndefinedOrNullOrNotNumber,
    isUndefinedOrNullOrObjectEmpty,
    isUndefinedOrNullOrStringEmpty,
} from '../../lib';
import SwapState from '../swap';
import Web3State from '../web3';

import ProtocolState from '.';

const updateEpochMiddleware: Middleware<
    Record<string, unknown>,
    NL.Redux.RootState,
    Dispatch<any>
> =
    ({ getState }) =>
    (next) =>
    async (action: PayloadAction<any>) => {
        if (
            ProtocolState.isOwnFulfilledAction(action, 'updateEpoch') ||
            ProtocolState.isOwnFulfilledAction(action, 'setEpoch')
        ) {
            const currentEpoch = !isUndefinedOrNullOrObjectEmpty(
                getState().protocol.epoch,
            )
                ? getState().protocol.epoch.id
                : '';
            const nextEpoch =
                action.payload.data?.epoch.id || action.payload.id;
            const currentSwap = getState().swap.endingEpoch;
            if (
                currentEpoch !== nextEpoch &&
                (window.location.hash.length <= 2 ||
                    window.location.hash.includes('/nugg')) &&
                (isUndefinedOrNullOrNotNumber(currentSwap) ||
                    currentSwap === +currentEpoch)
            ) {
                SwapState.dispatch.initSwap({
                    swapId: `${nextEpoch}-0`,
                });
            }

            if (!navigator.onLine) {
                Web3State.dispatch.setConnectivityWarning(true);
            } else if (getState().web3.connectivityWarning === true) {
                Web3State.dispatch.setConnectivityWarning(false);
            }
        }
        return next(action);
    };

export default { updateEpochMiddleware };
