import { useCallback } from 'react';

import useRecursiveTimeout from '../../hooks/useRecursiveTimeout';
import {
    isUndefinedOrNullOrNumberZero,
    isUndefinedOrNullOrObjectEmpty,
} from '../../lib';
import constants from '../../lib/constants';

import ProtocolState from '.';

export default () => {
    const block = ProtocolState.select.currentBlock();
    const epoch = ProtocolState.select.epoch();

    const checkEpoch = useCallback(() => {
        if (
            isUndefinedOrNullOrObjectEmpty(epoch) ||
            (!isUndefinedOrNullOrNumberZero(block) && block >= +epoch.endblock)
        ) {
            ProtocolState.dispatch.updateEpoch();
            ProtocolState.dispatch.updateStaked();
        }
    }, [epoch, block]);

    useRecursiveTimeout(() => {
        checkEpoch();
        ProtocolState.dispatch.updateBlock();
    }, constants.BLOCKTIME);
    return null;
};
