import { useCallback, useEffect } from 'react';
import { BigNumber } from '@ethersproject/bignumber/lib/bignumber';

import web3 from '@src/web3';
import lib from '@src/lib';
import { useNuggftV1 } from '@src/contracts/useContract';
import { EthInt, Fraction } from '@src/classes/Fraction';
import { buildTokenIdFactory } from '@src/prototypes';

import client from '..';

export default (activate: boolean, tokenId: ItemId | undefined) => {
    const chainId = web3.hook.usePriorityChainId();
    const liveEpoch = client.epoch.active.useId();
    const provider = web3.hook.usePriorityProvider();
    const nuggft = useNuggftV1(provider);
    const blocknum = client.block.useBlock();

    const updateOffers = client.mutate.updateOffers();
    const updateToken = client.mutate.updateToken();

    const callback = useCallback(async () => {
        if (activate && tokenId && chainId && liveEpoch) {
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
                        ? buildTokenIdFactory({
                              tokenId,
                              epoch,
                              eth: agency.eth.bignumber,
                              leader: agency.addressAsBigNumber.toString().toNuggId(),
                              nugg: nuggft.address,
                              endingEpoch: epoch && epoch.id,
                              num: Number(0),
                              bottom: new EthInt(0).bignumber,
                              isTryout: false,
                              owner: 'nugg-0' as NuggId,
                              count: 0,
                              isBackup: true,
                              listDataType: 'swap' as const,
                              canceledEpoch: null,
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

            updateOffers(
                tokenId,
                check
                    .filter((x) => x !== undefined)
                    .filter((x) => x && !x.eth.eq(0))
                    .map((x) =>
                        buildTokenIdFactory({
                            eth: x!.eth,
                            tokenId,
                            user: x!.leader.toNuggId(),
                            sellingTokenId: x!.owner.toNuggId(),
                            isBackup: true,
                            account: x!.leader.toNuggId(),
                            txhash: '',
                        }),
                    ),
            );
        }
    }, [chainId, tokenId, activate, nuggft, updateOffers, updateToken, liveEpoch]);

    useEffect(() => {
        void callback();
    }, [blocknum]);

    return null;
};
