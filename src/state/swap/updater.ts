import useRecursiveTimeout from '@src/hooks/useRecursiveTimeout';
import { isUndefinedOrNullOrStringEmpty } from '@src/lib';
import constants from '@src/lib/constants';
import web3 from '@src/web3';

import SwapState from './index';

export default () => {
    const swapId = SwapState.select.id();
    const chainId = web3.hook.usePriorityChainId();

    useRecursiveTimeout(() => {
        if (!isUndefinedOrNullOrStringEmpty(swapId)) {
            SwapState.dispatch.pollOffers({ swapId, chainId });
        }
    }, constants.QUERYTIME);

    return null;
};
