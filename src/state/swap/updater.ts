import useRecursiveTimeout from '../../hooks/useRecursiveTimeout';
import { isUndefinedOrNullOrStringEmpty } from '../../lib';
import constants from '../../lib/constants';

import SwapState from '.';

export default () => {
    const swapId = SwapState.select.id();
    useRecursiveTimeout(() => {
        if (!isUndefinedOrNullOrStringEmpty(swapId)) {
            SwapState.dispatch.pollOffers({ swapId });
        }
    }, constants.BLOCKTIME);

    return null;
};
