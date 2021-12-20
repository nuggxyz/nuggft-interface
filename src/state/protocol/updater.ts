import { useCallback } from 'react';

import useRecursiveTimeout from '../../hooks/useRecursiveTimeout';
import {
    isUndefinedOrNullOrNumberZero,
    isUndefinedOrNullOrObjectEmpty,
} from '../../lib';
import constants from '../../lib/constants';

import ProtocolSelectors from './selectors';
import ProtocolDispatches from './dispatches';

const ProtocolUpdater = () => {
    const block = ProtocolSelectors.currentBlock();
    const epoch = ProtocolSelectors.epoch();

    const checkEpoch = useCallback(() => {
        if (
            isUndefinedOrNullOrObjectEmpty(epoch) ||
            (!isUndefinedOrNullOrNumberZero(block) && block >= +epoch.endblock)
        ) {
            ProtocolDispatches.updateEpoch();
            ProtocolDispatches.updateStaked();
        }
    }, [epoch, block]);

    useRecursiveTimeout(() => {
        checkEpoch();
        ProtocolDispatches.updateBlock();
    }, constants.QUERYTIME);
    return null;
};

export default ProtocolUpdater;
