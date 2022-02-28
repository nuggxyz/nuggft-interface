import { Log, TransactionReceipt } from '@ethersproject/providers';
import { BigNumber } from 'ethers';
import { useEffect, useState } from 'react';
import { gql } from '@apollo/client';

import NuggftV1Helper from '@src/contracts/NuggftV1Helper';
import { LOSS } from '@src/lib/conversion';
import web3 from '@src/web3';
import TransactionState from '@src/state/transaction';
import client from '@src/client';

import { StakeEvent, OfferEvent } from '../../typechain/NuggftV1';

import { formatBlockLog, formatEventLog, SocketType } from './interfaces';

import SocketState from './index';

const COMMENTS_SUBSCRIPTION = gql`
    subscription OnOffer($tokenId: ID!) {
        offers(where: { swap_starts_with: $tokenId }) {
            user {
                id
            }
            eth
            swap {
                id
                epoch {
                    id
                }
                nugg {
                    id
                }
            }
        }
    }
`;

function difference(arr1: string[], arr2: string[]): string[] {
    let tmp: string[] = [];
    for (let i = 0; i < arr1.length; i++) {
        if (!arr2.includes(arr1[i])) {
            tmp.push(arr1[i]);
        }
    }
    return tmp;
}

export default () => {
    const chainId = web3.hook.usePriorityChainId();
    const tx = TransactionState.select.txn();

    const graphInstance = client.useApollo();
    const instance = client.useInfura();

    const [init, setInit] = useState(false);

    useEffect(() => {
        console.log({ instance });
        if (chainId && web3.config.isValidChainId(chainId) && !init) {
            if (instance && graphInstance) {
                const _helper = new NuggftV1Helper(chainId, undefined);

                const stake__listener = _helper.contract.filters.Stake();
                const offer__listener = _helper.contract.filters['Offer(uint160,bytes32)'](
                    null,
                    null,
                );
                const block__listener = 'block';

                async function getit() {
                    const blocknum = await instance.getBlockNumber();
                    SocketState.dispatch.incomingEvent({
                        type: SocketType.BLOCK,
                        ...formatBlockLog(blocknum),
                    });
                    SocketState.dispatch.incomingEvent({
                        type: SocketType.STAKE,
                        shares: (await _helper.contract.connect(instance).shares())._hex,
                        staked: (await _helper.contract.connect(instance).staked())._hex,
                        proto: (await _helper.contract.connect(instance).proto())._hex,
                        ...formatBlockLog(blocknum),
                    });
                }
                getit();

                instance.on(stake__listener, (log: Log) => {
                    let event = _helper.contract.interface.parseLog(log) as unknown as StakeEvent;
                    const cache = BigNumber.from(event.args.cache);

                    SocketState.dispatch.incomingEvent({
                        type: SocketType.STAKE,
                        shares: cache.shr(192)._hex,
                        staked: cache.shr(96).mask(96)._hex,
                        proto: cache.mask(96)._hex,
                        ...formatEventLog(log),
                    });
                });

                instance.on(offer__listener, (log: Log) => {
                    let event = _helper.contract.interface.parseLog(log) as unknown as OfferEvent;

                    const offerEvent = (event as unknown as OfferEvent).args;
                    const offerAgnecy = BigNumber.from(offerEvent.agency);

                    SocketState.dispatch.incomingEvent({
                        type: SocketType.OFFER,
                        account: offerAgnecy.mask(160)._hex,
                        value: offerAgnecy.shr(160).mask(70).mul(LOSS)._hex,
                        endingEpoch: offerAgnecy.shr(230).mask(24)._hex,
                        tokenId: offerEvent.tokenId._hex,
                        ...formatEventLog(log),
                    });
                });
                instance.on(block__listener, (log: number) => {
                    SocketState.dispatch.incomingEvent({
                        type: SocketType.BLOCK,
                        ...formatBlockLog(log),
                    });
                });
                setInit(true);
                return () => {
                    instance.off(block__listener, () => undefined);
                    instance.off(offer__listener, () => undefined);
                    instance.off(stake__listener, () => undefined);
                    if (instance && instance._wsReady) {
                        instance.removeAllListeners();
                        instance.destroy();
                    }
                    setInit(false);
                };
            }
        }
    }, [chainId, instance, graphInstance]);

    useEffect(() => {
        if (instance && tx && instance.listeners(tx).length === 0) {
            instance.once(tx, (log: TransactionReceipt) => {
                TransactionState.dispatch.finalizeTransaction({
                    hash: log.transactionHash,
                    successful: log.status === 1,
                });
            });
        }
    }, [tx]);

    return null;
};
