import { createSelector } from '@reduxjs/toolkit';
import { useSelector } from 'react-redux';

import { isUndefinedOrNullOrObjectEmpty } from '../../lib';
import { NLSelector } from '../store';

import Web3InitialState from './initialState';

import { STATE_NAME } from '.';

let _selectors: ApplyFuncToChildren<typeof Web3InitialState>;

const Web3Selectors = () => {
    if (isUndefinedOrNullOrObjectEmpty(_selectors)) {
        //@ts-ignore
        _selectors = Object.keys(Web3InitialState).reduce((selectors, key) => {
            selectors[key] = (eqFn?: (prev: any, cur: any) => boolean) =>
                useSelector(
                    createSelector(NLSelector, (s) => s[STATE_NAME][key]),
                    eqFn,
                );
            return selectors;
        }, {});
    }
    return _selectors;
};

export default Web3Selectors;
