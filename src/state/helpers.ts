import { createSelector } from '@reduxjs/toolkit';
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
