import { useCallback, useEffect } from 'react';

// eslint-disable-next-line import/no-cycle
import web3 from '@src/web3';
import lib from '@src/lib';
import { useNuggftV1 } from '@src/contracts/useContract';
import { EthInt } from '@src/classes/Fraction';
import { Address } from '@src/classes/Address';

// eslint-disable-next-line import/no-cycle

import { buildTokenIdFactory } from '@src/prototypes';

import client from '..';

export default (activate: boolean, tokenId: NuggId | undefined) => {
    const chainId = web3.hook.usePriorityChainId();
    const liveEpoch = client.live.epoch.default();
    const provider = web3.hook.usePriorityProvider();
    const nuggft = useNuggftV1(provider);
    const blocknum = client.live.blocknum();
    const updateToken = client.mutate.updateToken();
    const updateOffers = client.mutate.updateOffers();

    const callback = useCallback(async () => {
        if (activate && tokenId && chainId && liveEpoch) {
            const agency = lib.parse.agency(await nuggft.agency(tokenId.toRawId()));

            const items = lib.parse
                .proof(await nuggft.proofOf(tokenId.toRawId()))
                .map((x) => buildTokenIdFactory({ ...x, activeSwap: undefined }));

            const owner =
                agency.flag === 0x0 && agency.epoch === 0
                    ? (Address.ZERO.hash as AddressString)
                    : (nuggft.address as AddressString);

            if (agency.flag === 0 && Number(tokenId.toRawId()) === liveEpoch.id) {
                agency.epoch = liveEpoch.id;
                agency.flag = 0x3;
            }

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
                    ? buildTokenIdFactory({
                          tokenId,
                          epoch,
                          eth: agency.eth.bignumber,
                          leader: agency.address as AddressString,
                          owner,
                          endingEpoch: epoch && epoch.id,
                          num: Number(0),
                          isActive: false,
                          bottom: new EthInt(0).bignumber,
                          isBackup: true,
                          listDataType: 'swap' as const,
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
            if (activeSwap && !activeSwap.eth.eq(0))
                updateOffers(tokenId, [
                    buildTokenIdFactory({
                        eth: activeSwap.eth,
                        user: activeSwap.leader as AddressString,
                        isBackup: true,
                        sellingTokenId: null,
                        tokenId,
                        account: activeSwap.leader as AddressString,
                        txhash: '',
                    }),
                ]);
        }
    }, [chainId, tokenId, activate, nuggft, liveEpoch, updateOffers, updateToken]);

    useEffect(() => {
        void callback();
    }, [blocknum]);

    return null;
};
