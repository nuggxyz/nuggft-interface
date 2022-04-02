import { useCallback, useEffect } from 'react';
import { BigNumber } from 'ethers';

import web3 from '@src/web3';
import lib, { extractItemId } from '@src/lib';
import { useNuggftV1 } from '@src/contracts/useContract';
import { EthInt } from '@src/classes/Fraction';
import { LiveActiveItemSwap } from '@src/client/interfaces';

// eslint-disable-next-line import/no-cycle
import client from '..';

export default (
    activate: boolean,
    tokenId: string | undefined,
    sellingNuggId: string | undefined,
) => {
    const chainId = web3.hook.usePriorityChainId();

    const provider = web3.hook.usePriorityProvider();
    const nuggft = useNuggftV1(provider);
    const blocknum = client.live.blocknum();

    const updateOffers = client.mutate.updateOffers();
    const updateToken = client.mutate.updateToken();

    const callback = useCallback(async () => {
        if (activate && tokenId && chainId && sellingNuggId) {
            const agency = lib.parse.agency(
                await nuggft.itemAgency(
                    BigNumber.from(tokenId).shl(24).and(extractItemId(sellingNuggId)),
                ),
            );

            const epoch =
                agency.flag === 0x3 && agency.epoch !== 0
                    ? {
                          id: agency.epoch,
                          startblock: web3.config.calculateStartBlock(agency.epoch, chainId),
                          endblock: web3.config.calculateStartBlock(agency.epoch + 1, chainId) - 1,
                          status: 'PENDING' as const, // i dont think this matters so not calcing it
                      }
                    : null;

            const activeSwap =
                agency.flag === 0x3
                    ? ({
                          type: 'item' as const,
                          id: tokenId,
                          epoch,
                          eth: agency.eth,
                          leader: agency.address,
                          nugg: nuggft.address,
                          endingEpoch: epoch && epoch.id,
                          num: Number(0),
                          isActive: false,
                          bottom: new EthInt(0),
                          sellingNuggId,
                          isTryout: false,
                          owner: null,
                          count: 0,
                          isBackup: true,
                      } as LiveActiveItemSwap)
                    : undefined;

            updateToken(tokenId, {
                type: 'item' as const,
                swaps: [],
                activeSwap,
                count: 0,
                tryout: {
                    count: 0,
                    swaps: [],
                },
                isBackup: true,
            });

            if (activeSwap && !activeSwap.eth.eq(0))
                updateOffers(tokenId, [
                    {
                        eth: activeSwap.eth,
                        user: activeSwap.leader,
                        type: 'item',
                        sellingNuggId,
                        isBackup: true,
                    },
                ]);
        }
    }, [chainId, tokenId, activate, nuggft, sellingNuggId]);

    useEffect(() => {
        void callback();
    }, [blocknum]);

    return null;
};
