import { Middleware, Dispatch, PayloadAction } from '@reduxjs/toolkit';

import {
    isUndefinedOrNullOrArrayEmpty,
    isUndefinedOrNullOrObjectEmpty,
    isUndefinedOrNullOrStringEmpty,
    loadFromLocalStorage,
    saveToLocalStorage,
} from '../../lib';
import { isUndefinedOrNull } from '../../lib/index';
import SwapState from '../swap';
import TokenState from '../token';
import { NLState } from '../NLState';

import AppState from '.';

const logger: NL.Redux.Middleware<
    Record<string, unknown>,
    any,
    Dispatch<any>
> =
    ({ dispatch, getState }) =>
    (next: any) =>
    async (action) => {
        // console.groupCollapsed(action.type);
        // console.log(
        //     '%cPrevious state:',
        //     'color:  #b3bd2d; font-weight: bold',
        //     getState(),
        // );
        console.log(
            '%cAction',
            'color: #6FAAF7; font-weight: bold',
            action.type,
            action,
        );
        let fin = next(action);
        // console.log(
        //     '%cCurrent state:',
        //     'color: #2bba0b; font-weight: bold;',
        //     getState(),
        // );
        // console.groupEnd();
        return fin;
    };

const localStorager: Middleware<{}, any, Dispatch<any>> =
    ({ dispatch }) =>
    (next: any) =>
    async (action: PayloadAction<NL.Redux.LocalStoragePayload<any>>) => {
        const _ = action.payload;
        let tempAction = action;
        if (
            !isUndefinedOrNullOrObjectEmpty(_) &&
            !isUndefinedOrNullOrStringEmpty(_._localStorageTarget) &&
            !isUndefinedOrNull(_._localStorageValue) &&
            !isUndefinedOrNullOrStringEmpty(_._localStorageExpectedType)
        ) {
            let possibleValue = await loadFromLocalStorage(
                _._localStorageTarget,
            );
            if (_._localStorageExpectedType === 'array') {
                if (!isUndefinedOrNullOrArrayEmpty(possibleValue)) {
                    if (possibleValue.indexOf(_._localStorageValue) === -1) {
                        possibleValue.push(_._localStorageValue);
                    }
                } else {
                    possibleValue = [_._localStorageValue];
                }
            } else if (_._localStorageExpectedType === 'object') {
                if (!isUndefinedOrNullOrObjectEmpty(possibleValue)) {
                    possibleValue = {
                        ...possibleValue,
                        ..._._localStorageValue,
                    };
                } else {
                    possibleValue = {
                        ..._._localStorageValue,
                    };
                }
            } else {
                possibleValue = _._localStorageValue;
            }
            await saveToLocalStorage(possibleValue, _._localStorageTarget);

            tempAction.payload = _._localStorageValue;
        } else if (
            !isUndefinedOrNullOrObjectEmpty(_) &&
            !isUndefinedOrNullOrStringEmpty(_._localStorageTarget)
        ) {
            let possibleValue = await loadFromLocalStorage(
                _._localStorageTarget,
            );
            tempAction.payload = possibleValue;
        }

        return next(tempAction);
    };

const viewChange: Middleware<{}, any, Dispatch<any>> =
    ({ getState }) =>
    (next: any) =>
    async (action: PayloadAction<NL.Redux.App.Views>) => {
        const go = next(action);
        if (AppState.isOwnFulfilledAction(action, 'changeView')) {
            if (action.payload === 'Search') {
                const currentToken = getState().token.tokenId;
                AppState.silentlySetRoute(
                    `#/nugg${
                        !isUndefinedOrNullOrStringEmpty(currentToken)
                            ? `/${currentToken}`
                            : ''
                    }`,
                );
            } else {
                const currentSwap = getState().swap.id;
                const currentEpoch = !isUndefinedOrNullOrObjectEmpty(
                    getState().protocol.epoch,
                )
                    ? getState().protocol.epoch.id
                    : '';
                AppState.silentlySetRoute(
                    (currentEpoch &&
                        currentSwap &&
                        currentSwap.includes(currentEpoch)) ||
                        !currentSwap
                        ? '/'
                        : `#/swap/${currentSwap}`,
                );
            }
        }

        return go;
    };

const rejectedThactions: Middleware<{}, any, Dispatch<any>> =
    ({ getState }) =>
    (next: any) =>
    async (action: PayloadAction<NL.Redux.App.Views>) => {
        if (NLState.isRejected(action)) {
            const toasts = getState().app.toasts.length;
            AppState.dispatch.addToastToList({
                index: toasts + 1,
                id: `${toasts + 1}`,
                duration: 0,
                error: true,
                loading: false,
                message: 'An unknown error has occured',
                title: 'Error',
            });
        }

        return next(action);
    };

export default { localStorager, viewChange, rejectedThactions };
