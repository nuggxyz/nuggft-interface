import { AnyAction, createSelector } from '@reduxjs/toolkit';
import { useSelector } from 'react-redux';

import store, { NLSelector } from './store';

export const createSelectors = <T>(
    initialState: T,
    name: string,
): ApplyFuncToChildren<T> => {
    return Object.keys(initialState).reduce((selectors, key) => {
        selectors[key] = (eqFn?: (prev: any, cur: any) => boolean) =>
            useSelector(
                createSelector(NLSelector, (s) => s[name][key]),
                eqFn,
            );
        return selectors;
    }, {}) as any;
};

export const createDispatches = <A, T>(
    actions: A,
    thactions: T,
): ApplyDispatchToChildren<T & A> => {
    return [
        ...Object.entries(actions),
        ...Object.entries(thactions as any),
    ].reduce((dispatches, [name, action]) => {
        dispatches[name] = (value?: any) => store.dispatch<any>(action(value));
        return dispatches;
    }, {}) as any;
};

export const hasPrefix = (action: AnyAction, prefix: string) =>
    action.type.startsWith(prefix);

export const hasSuffix = (action: AnyAction, suffix: string) =>
    action.type.includes(suffix);

export const isPending = (action: AnyAction) =>
    action.type.endsWith('/pending');

export const isFulfilled = (action: AnyAction) =>
    action.type.endsWith('/fulfilled');

export const isRejected = (action: AnyAction) =>
    action.type.endsWith('/rejected');

export const isPendingAction =
    (prefix: string) =>
    (action: AnyAction): action is AnyAction => {
        return hasPrefix(action, prefix) && isPending(action);
    };

export const isRejectedAction =
    (prefix: string) =>
    (action: AnyAction): action is AnyAction => {
        return hasPrefix(action, prefix) && isRejected(action);
    };

export const isFulfilledAction =
    (prefix: string) =>
    (action: AnyAction): action is AnyAction => {
        return hasPrefix(action, prefix) && isFulfilled(action);
    };
