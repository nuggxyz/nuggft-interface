import { InfuraWebSocketProvider, Log, TransactionReceipt } from '@ethersproject/providers';
import { BigNumber } from 'ethers';
import { useEffect, useState } from 'react';
import { ApolloClient, gql } from '@apollo/client';
import { Subscription } from 'apollo-client/util/Observable';

import NuggftV1Helper from '@src/contracts/NuggftV1Helper';
import { LOSS } from '@src/lib/conversion';
import web3 from '@src/web3';
import TransactionState from '@src/state/transaction';
import { wsclient } from '@src/graphql/client';

import { StakeEvent, OfferEvent } from '../../typechain/NuggftV1';

import { formatBlockLog, formatEventLog, formatGraphEventLog, SocketType } from './interfaces';

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

    const [instance, setInstance] = useState<InfuraWebSocketProvider>(undefined);
    const [graphInstance, setGraphInstance] = useState<ApolloClient<WebSocket>>(undefined);

    const [watchingSockets, setWatchingSockets] = useState<Dictionary<Subscription>>({});

    const watching = SocketState.select.swapsToWatch();

    useEffect(() => {
        let tmp = {};

        let diff = difference(Object.keys(watchingSockets), watching);

        diff.forEach((x) => {
            watchingSockets[x].unsubscribe();
        });

        watching.forEach((x) => {
            if (!watchingSockets[x]) {
                tmp[x] = graphInstance
                    .subscribe<{
                        user: { id: string };
                        eth: string;
                        swap: { epoch: { id: string }; nugg: { id: string } };
                    }>({
                        query: COMMENTS_SUBSCRIPTION,
                        variables: { tokenId: x },
                    })
                    .subscribe((value) => {
                        if (value.data) {
                            console.log(value.data);
                            SocketState.dispatch.incomingEvent({
                                type: SocketType.OFFER,
                                account: value.data.user.id,
                                value: value.data.eth,
                                endingEpoch: value.data.swap.epoch.id,
                                tokenId: value.data.swap.nugg.id,
                                ...formatGraphEventLog(),
                            });
                        }
                    });
            }
        });

        setWatchingSockets(tmp);
    }, [watching]);

    useEffect(() => {
        if (chainId && web3.config.isValidChainId(chainId)) {
            const _instance = web3.config.createInfuraWebSocket(chainId);
            const _wsinstance = wsclient(chainId);

            setInstance(_instance);

            setGraphInstance(_wsinstance);

            const _helper = new NuggftV1Helper(chainId, undefined);

            const stake__listener = _helper.contract.filters.Stake();
            const offer__listener = _helper.contract.filters['Offer(uint160,bytes32)'](null, null);
            const block__listener = 'block';

            async function getit() {
                const blocknum = await _instance.getBlockNumber();
                SocketState.dispatch.incomingEvent({
                    type: SocketType.BLOCK,
                    ...formatBlockLog(blocknum),
                });
                SocketState.dispatch.incomingEvent({
                    type: SocketType.STAKE,
                    shares: (await _helper.contract.connect(_instance).shares())._hex,
                    staked: (await _helper.contract.connect(_instance).staked())._hex,
                    proto: (await _helper.contract.connect(_instance).proto())._hex,
                    ...formatBlockLog(blocknum),
                });
            }
            getit();

            _instance.on(stake__listener, (log: Log) => {
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

            _instance.on(offer__listener, (log: Log) => {
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
            _instance.on(block__listener, (log: number) => {
                SocketState.dispatch.incomingEvent({
                    type: SocketType.BLOCK,
                    ...formatBlockLog(log),
                });
            });

            return () => {
                _wsinstance;
                _instance.off(block__listener, () => undefined);
                _instance.off(offer__listener, () => undefined);
                _instance.off(stake__listener, () => undefined);
                if (_instance && _instance._wsReady) {
                    _instance.removeAllListeners();
                    _instance.destroy();
                }
            };
        }
    }, [chainId]);

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
