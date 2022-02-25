import useRecursiveTimeout from '@src/hooks/useRecursiveTimeout';
import { isUndefinedOrNullOrStringEmpty } from '@src/lib';
import constants from '@src/lib/constants';
import web3 from '@src/web3';

import SwapState from '.';

export default () => {
    const swapId = SwapState.select.id();
    const chainId = web3.hook.usePriorityChainId();
    // const updateOffer = useCallback((log: any) => {
    //     const { args } = new NuggftV1Helper(chainId, provider).contract.interface.parseLog(log);

    //     if (!isUndefinedOrNullOrArrayEmpty(args)) {
    //         SwapState.dispatch.setLeader({
    //             eth: args[2].toString(),
    //             leader: args[1],
    //             tokenId: args[0].toString(),
    //         });
    //     }
    // }, []);

    // useEffect(() => {
    //     if (!isUndefinedOrNullOrObjectEmpty(library) && !isUndefinedOrNullOrStringEmpty(swapId)) {
    //         const filters = new NuggftV1Helper(chainId, provider).contract.filters.Offer(
    //             BigNumber.from(swapId.split('-')[0]),
    //             null,
    //         );
    //         library.on(filters, updateOffer);

    //         return () => {
    //             library.removeListener(filters, updateOffer);
    //         };
    //     }
    // }, [swapId, library, updateOffer]);

    useRecursiveTimeout(() => {
        if (!isUndefinedOrNullOrStringEmpty(swapId)) {
            SwapState.dispatch.pollOffers({ swapId, chainId });
        }
    }, constants.QUERYTIME);

    return null;
};
