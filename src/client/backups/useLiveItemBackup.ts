import { useCallback } from 'react';
import { BigNumber } from '@ethersproject/bignumber/lib/bignumber';

import web3 from '@src/web3';
import lib from '@src/lib';
import { useNuggftV1 } from '@src/contracts/useContract';
import { EthInt, Fraction } from '@src/classes/Fraction';
import { buildTokenIdFactory } from '@src/prototypes';

import client from '..';

export default () => {
    const chainId = web3.hook.usePriorityChainId();
    const liveEpoch = client.epoch.active.useId();
    const provider = web3.hook.usePriorityProvider();
    const nuggft = useNuggftV1(provider);

    const updateToken = client.mutate.updateToken();

    const callback = useCallback(
        async (tokenId: ItemId | undefined) => {
            if (tokenId && chainId && liveEpoch) {
                const items = lib.parse.lastItemSwap(await nuggft.lastItemSwap(tokenId.toRawId()));

                const active = items.find((x) => x.endingEpoch === liveEpoch);
                const upcoming = items.find((x) => x.endingEpoch === liveEpoch + 1);

                const check = await Promise.all(
                    [active, upcoming].map(async (arg) => {
                        if (!arg) return undefined;

                        const agency = lib.parse.agency(
                            await nuggft.itemAgency(
                                arg.tokenId.toRawId(),
                                BigNumber.from(tokenId.toRawId()),
                            ),
                        );

                        return agency.flag === 0x3
                            ? buildTokenIdFactory({
                                  tokenId,
                                  eth: agency.eth,
                                  leader: agency.addressAsBigNumber.toString().toNuggId(),
                                  nugg: nuggft.address,
                                  endingEpoch: agency.epoch === 0 ? null : agency.epoch,
                                  num: Number(0),
                                  bottom: new EthInt(0).bignumber,
                                  isTryout: false,
                                  owner: 'nugg-0' as NuggId,
                                  count: 0,
                                  isBackup: true,
                                  listDataType: 'swap' as const,
                                  canceledEpoch: null,
                                  offers: [
                                      buildTokenIdFactory({
                                          eth: agency.eth,
                                          tokenId,
                                          sellingTokenId: 'nugg-0' as NuggId,
                                          isBackup: true,
                                          account: agency.addressAsBigNumber.toString().toNuggId(),
                                          txhash: '',
                                          agencyEpoch: agency.epoch,
                                      }),
                                  ],
                              })
                            : undefined;
                    }),
                );

                updateToken(
                    tokenId,
                    buildTokenIdFactory({
                        tokenId,
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
                    }),
                );
            }
        },
        [chainId, nuggft, updateToken, liveEpoch],
    );

    return callback;
};
