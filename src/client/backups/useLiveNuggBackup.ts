import { useCallback, useEffect } from 'react';

// eslint-disable-next-line import/no-cycle
import web3 from '@src/web3';
import lib from '@src/lib';
import { useNuggftV1 } from '@src/contracts/useContract';
import { EthInt } from '@src/classes/Fraction';
import { Address } from '@src/classes/Address';

// eslint-disable-next-line import/no-cycle
import client from '..';

export default (activate: boolean, tokenId: string | undefined) => {
    const chainId = web3.hook.usePriorityChainId();
    const liveEpoch = client.live.epoch.default();
    const provider = web3.hook.usePriorityProvider();
    const nuggft = useNuggftV1(provider);
    const blocknum = client.live.blocknum();
    const updateToken = client.mutate.updateToken();
    const updateOffers = client.mutate.updateOffers();

    const callback = useCallback(async () => {
        if (activate && tokenId && chainId && liveEpoch) {
            const agency = lib.parse.agency(await nuggft.agency(tokenId));

            const items = lib.parse
                .proof(await nuggft.proofOf(tokenId))
                .map((x) => ({ ...x, activeSwap: undefined }));

            const owner =
                agency.flag === 0x0 && agency.epoch === 0 ? Address.ZERO.hash : nuggft.address;

            if (agency.flag === 0 && Number(tokenId) === liveEpoch.id) {
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
                    ? {
                          type: 'nugg' as const,
                          id: tokenId,
                          epoch,
                          eth: agency.eth,
                          leader: agency.address,
                          owner,
                          endingEpoch: epoch && epoch.id,
                          num: Number(0),
                          isActive: false,
                          bottom: new EthInt(0),
                          isBackup: true,
                      }
                    : undefined;

            updateToken(tokenId, {
                type: 'nugg' as const,
                id: tokenId,
                activeLoan: null,
                owner,
                items,
                pendingClaim: null,
                lastTransfer: null,
                swaps: [],
                activeSwap,
                isBackup: true,
            });
            if (activeSwap && !activeSwap.eth.eq(0))
                updateOffers(tokenId, [
                    {
                        eth: activeSwap.eth,
                        user: activeSwap.leader,
                        type: 'nugg',
                        isBackup: true,
                    },
                ]);
        }
    }, [chainId, tokenId, activate, nuggft, liveEpoch]);

    useEffect(() => {
        void callback();
    }, [blocknum]);

    return null;
};
