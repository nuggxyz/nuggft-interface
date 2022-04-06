import { useCallback, useEffect } from 'react';
import { BigNumber } from 'ethers';

import web3 from '@src/web3';
import lib, { extractItemId } from '@src/lib';
import { useNuggftV1 } from '@src/contracts/useContract';
import { EthInt } from '@src/classes/Fraction';
import { LiveActiveItemSwap } from '@src/client/interfaces';

// eslint-disable-next-line import/no-cycle

import client from '..';

export default (activate: boolean, tokenId: string | undefined) => {
    const chainId = web3.hook.usePriorityChainId();
    const liveEpoch = client.live.epoch.default();

    const provider = web3.hook.usePriorityProvider();
    const nuggft = useNuggftV1(provider);
    const blocknum = client.live.blocknum();

    const updateOffers = client.mutate.updateOffers();
    const updateToken = client.mutate.updateToken();

    const callback = useCallback(async () => {
        if (activate && tokenId && tokenId.isItemId() && chainId && liveEpoch) {
            const itemId = extractItemId(tokenId);
            const items = lib.parse.lastItemSwap(await nuggft.lastItemSwap(itemId));

            const active = items.find((x) => x.endingEpoch === liveEpoch.id);
            const upcoming = items.find((x) => x.endingEpoch === liveEpoch.id + 1);

            const check = await Promise.all(
                [active, upcoming].map(async (arg) => {
                    const agency = lib.parse.agency(
                        await nuggft.itemAgency(
                            BigNumber.from(itemId)
                                .shl(24)
                                .or(arg?.tokenId || 0),
                        ),
                    );

                    const epoch =
                        agency.flag === 0x3 && agency.epoch !== 0
                            ? {
                                  id: agency.epoch,
                                  startblock: web3.config.calculateStartBlock(
                                      agency.epoch,
                                      chainId,
                                  ),
                                  endblock:
                                      web3.config.calculateStartBlock(agency.epoch + 1, chainId) -
                                      1,
                                  status: 'PENDING' as const, // i dont think this matters so not calcing it
                              }
                            : null;

                    return agency.flag === 0x3
                        ? ({
                              type: 'item' as const,
                              id: tokenId,
                              epoch,
                              eth: agency.eth,
                              leader: agency.addressAsBigNumber.toString(),
                              nugg: nuggft.address,
                              endingEpoch: epoch && epoch.id,
                              num: Number(0),
                              isActive: false,
                              bottom: new EthInt(0),
                              sellingNuggId: arg?.tokenId,
                              isTryout: false,
                              owner: null,
                              count: 0,
                              isBackup: true,
                          } as LiveActiveItemSwap)
                        : undefined;
                }),
            );

            updateToken(tokenId, {
                type: 'item' as const,
                id: tokenId,
                swaps: [],
                activeSwap: check[0],
                upcomingActiveSwap: check[1],
                count: 0,
                tryout: {
                    count: 0,
                    swaps: [],
                },
                isBackup: true,
            });

            updateOffers(
                tokenId,
                check
                    .filter((x) => x !== undefined)
                    .filter((x) => x && !x.eth.eq(0))
                    .map((x) => ({
                        eth: x!.eth,
                        user: x!.leader,
                        type: 'item' as const,
                        sellingNuggId: x!.sellingNuggId,
                        isBackup: true,
                    })),
            );
        }
    }, [chainId, tokenId, activate, nuggft, updateOffers, updateToken, liveEpoch]);

    useEffect(() => {
        void callback();
    }, [blocknum]);

    return null;
};
