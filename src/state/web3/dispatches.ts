import { isUndefinedOrNullOrObjectEmpty } from '../../lib';
import store from '../store';

import Web3Thactions from './thactions';

import Web3Slice from '.';

let _dispatches: ApplyDispatchToChildren<
    typeof Web3Thactions & typeof Web3Slice.actions
>;

const Web3Dispatches = () => {
    if (isUndefinedOrNullOrObjectEmpty(_dispatches)) {
        //@ts-ignore
        _dispatches = [
            ...Object.entries(Web3Slice.actions),
            ...Object.entries(Web3Thactions as any),
        ].reduce((dispatches, [name, action]) => {
            dispatches[name] = (value?: any) =>
                //@ts-ignore
                store.dispatch<any>(action(value));
            return dispatches;
        }, {});
    }
    return _dispatches;
};

export default Web3Dispatches;
