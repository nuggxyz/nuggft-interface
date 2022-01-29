import { gql, useSubscription } from '@apollo/client';
import { useCallback, useEffect } from 'react';
import { BigNumber, utils } from 'ethers';

import useRecursiveTimeout from '../../hooks/useRecursiveTimeout';
import {
    isUndefinedOrNullOrArrayEmpty,
    isUndefinedOrNullOrObjectEmpty,
    isUndefinedOrNullOrStringEmpty,
} from '../../lib';
import constants from '../../lib/constants';
import { client } from '../../graphql/client';
import Web3State from '../web3';
import Web3Config from '../web3/Web3Config';
import NuggftV1Helper from '../../contracts/NuggftV1Helper';
import { fromEth } from '../../lib/conversion';

import SwapState from '.';

export default () => {
    const swapId = SwapState.select.id();
    const { library } = Web3State.hook.useActiveWeb3React();

    const updateOffer = useCallback((log: any) => {
        const { args } = NuggftV1Helper.instance.interface.parseLog(log);

        if (!isUndefinedOrNullOrArrayEmpty(args)) {
            SwapState.dispatch.setLeader({
                eth: args[2].toString(),
                leader: args[1],
                tokenId: args[0].toString(),
            });
        }
    }, []);

    useEffect(() => {
        if (
            !isUndefinedOrNullOrObjectEmpty(library) &&
            !isUndefinedOrNullOrStringEmpty(swapId)
        ) {
            const filters = NuggftV1Helper.instance.filters.Offer(
                BigNumber.from(swapId.split('-')[0]),
                null,
            );
            library.on(filters, updateOffer);

            return () => {
                library.removeListener(filters, updateOffer);
            };
        }
    }, [swapId, library, updateOffer]);

    useRecursiveTimeout(() => {
        if (!isUndefinedOrNullOrStringEmpty(swapId)) {
            SwapState.dispatch.pollOffers({ swapId });
        }
    }, constants.QUERYTIME);

    return null;
};
