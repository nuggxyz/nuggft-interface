import { useCallback } from 'react';

import web3 from '@src/web3';
import lib from '@src/lib';
import { useNuggftV1 } from '@src/contracts/useContract';
import { EthInt } from '@src/classes/Fraction';
import { Address } from '@src/classes/Address';
import { buildTokenIdFactory } from '@src/prototypes';

import client from '..';

// eslint-disable-next-line @typescript-eslint/no-unused-vars

export default () => {
    const chainId = web3.hook.usePriorityChainId();
    const liveEpoch = client.epoch.active.useId();
    const provider = web3.hook.usePriorityProvider();
    const nuggft = useNuggftV1(provider);
    const updateToken = client.mutate.updateToken();
    const updateOffers = client.mutate.updateOffers();

    const callback = useCallback(
        async (tokenId: NuggId | undefined) => {
            if (tokenId && chainId && liveEpoch) {
                const agency = lib.parse.agency(await nuggft.agency(tokenId.toRawId()));

                const items = lib.parse
                    .proof(await nuggft.proofOf(tokenId.toRawId()))
                    .map((x) => buildTokenIdFactory({ ...x, activeSwap: undefined }));

                const owner =
                    agency.flag === 0x0 && agency.epoch === 0
                        ? (Address.ZERO.hash as AddressString)
                        : (nuggft.address as AddressString);

                if (agency.flag === 0 && Number(tokenId.toRawId()) === liveEpoch) {
                    agency.epoch = liveEpoch;
                    agency.flag = 0x3;
                }

                const activeSwap =
                    agency.flag === 0x3
                        ? buildTokenIdFactory({
                              tokenId,
                              eth: agency.eth,
                              leader: agency.address as AddressString,
                              owner,
                              endingEpoch: agency.epoch,
                              num: Number(0),
                              bottom: new EthInt(0).bignumber,
                              isBackup: true,
                              listDataType: 'swap' as const,
                              canceledEpoch: null,
                              offers: [
                                  buildTokenIdFactory({
                                      eth: agency.eth,
                                      isBackup: true,
                                      sellingTokenId: null,
                                      tokenId,
                                      account: agency.address as AddressString,
                                      txhash: '',
                                      agencyEpoch: agency.epoch,
                                  }),
                              ],
                          })
                        : undefined;

                updateToken(
                    tokenId,
                    buildTokenIdFactory({
                        tokenId,
                        activeLoan: null,
                        owner,
                        items,
                        pendingClaim: null,
                        lastTransfer: null,
                        swaps: [],
                        activeSwap,
                        isBackup: true,
                    }),
                );
            }
        },
        [chainId, nuggft, liveEpoch, updateOffers, updateToken],
    );

    return callback;
};
