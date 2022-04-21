import { useCallback, useEffect } from 'react';
import { BigNumber } from 'ethers';

import web3 from '@src/web3';
import lib from '@src/lib';
import { useNuggftV1 } from '@src/contracts/useContract';
import { EthInt, Fraction } from '@src/classes/Fraction';
import { LiveActiveItemSwap } from '@src/client/interfaces';

// eslint-disable-next-line import/no-cycle

import client from '..';

export default (activate: boolean, tokenId: ItemId | undefined) => {
    const chainId = web3.hook.usePriorityChainId();
    const liveEpoch = client.live.epoch.default();

    const provider = web3.hook.usePriorityProvider();
    const nuggft = useNuggftV1(provider);
    const blocknum = client.live.blocknum();

    const updateOffers = client.mutate.updateOffers();
    const updateToken = client.mutate.updateToken();

    const callback = useCallback(async () => {
        if (activate && tokenId && tokenId.isItemId() && chainId && liveEpoch) {
            const items = lib.parse.lastItemSwap(await nuggft.lastItemSwap(tokenId.toRawId()));

            const active = items.find((x) => x.endingEpoch === liveEpoch.id);
            const upcoming = items.find((x) => x.endingEpoch === liveEpoch.id + 1);

            const check = await Promise.all(
                [active, upcoming].map(async (arg) => {
                    if (!arg) return undefined;

                    const agency = lib.parse.agency(
                        await nuggft.itemAgency(arg.tokenId, BigNumber.from(tokenId.toRawId())),
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
                              type: 'item',
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
                type: 'item',
                id: tokenId,
                swaps: [],
                activeSwap: check[0],
                upcomingActiveSwap: check[1],
                count: 0,
                rarity: new Fraction(0),
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
                        tokenId,
                        user: x!.leader.toNuggId(),
                        sellingTokenId: x!.sellingNuggId.toNuggId(),
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
