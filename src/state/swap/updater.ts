import useRecursiveTimeout from '../../hooks/useRecursiveTimeout';
import { isUndefinedOrNullOrStringEmpty } from '../../lib';
import constants from '../../lib/constants';

import SwapDispatches from './dispatches';
import SwapSelectors from './selectors';

const SwapUpdater = () => {
    const swapId = SwapSelectors.id();
    useRecursiveTimeout(() => {
        if (!isUndefinedOrNullOrStringEmpty(swapId)) {
            SwapDispatches.pollOffers({ swapId });
        }
    }, constants.QUERYTIME);

    return null;
};

export default SwapUpdater;
