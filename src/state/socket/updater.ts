import { InfuraWebSocketProvider, Log, TransactionReceipt } from '@ethersproject/providers';
import { BigNumber } from 'ethers';
import { useEffect, useState } from 'react';

import NuggftV1Helper from '@src/contracts/NuggftV1Helper';
import { LOSS } from '@src/lib/conversion';
import web3 from '@src/web3';
import TransactionState from '@src/state/transaction';

import { StakeEvent, OfferEvent } from '../../typechain/NuggftV1';

import { formatBlockLog, formatEventLog, SocketType } from './interfaces';

import SocketState from './index';

export default () => {
    const chainId = web3.hook.usePriorityChainId();
    const tx = TransactionState.select.txn();

    const [instance, setInstance] = useState<InfuraWebSocketProvider>(undefined);
    const [helper, setHelper] = useState<NuggftV1Helper>(undefined);

    useEffect(() => {
        if (chainId && web3.config.isValidChainId(chainId)) {
            setInstance(web3.config.createInfuraWebSocket(chainId));
            setHelper(new NuggftV1Helper(chainId, undefined));

            return () => {
                setHelper(undefined);
                if (instance && instance._wsReady) {
                    instance.removeAllListeners();
                    instance.destroy();
                }
            };
        }
    }, [chainId]);

    useEffect(() => {
        if (instance && helper) {
            async function getit() {
                const blocknum = await instance.getBlockNumber();
                SocketState.dispatch.incomingEvent({
                    type: SocketType.BLOCK,
                    ...formatBlockLog(blocknum),
                });
                SocketState.dispatch.incomingEvent({
                    type: SocketType.STAKE,
                    shares: (await helper.contract.connect(instance).shares())._hex,
                    staked: (await helper.contract.connect(instance).staked())._hex,
                    proto: (await helper.contract.connect(instance).proto())._hex,
                    ...formatBlockLog(blocknum),
                });
            }
            getit();

            instance.addListener(helper.contract.filters.Stake(), (log: Log) => {
                let event = helper.contract.interface.parseLog(log) as unknown as StakeEvent;
                const cache = BigNumber.from(event.args.cache);

                SocketState.dispatch.incomingEvent({
                    type: SocketType.STAKE,
                    shares: cache.shr(192)._hex,
                    staked: cache.shr(96).mask(96)._hex,
                    proto: cache.mask(96)._hex,
                    ...formatEventLog(log),
                });
            });

            instance.addListener(
                helper.contract.filters['Offer(uint160,bytes32)'](null, null),
                (log: Log) => {
                    let event = helper.contract.interface.parseLog(log) as unknown as OfferEvent;

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
                },
            );
            instance.addListener('block', (log: number) => {
                SocketState.dispatch.incomingEvent({
                    type: SocketType.BLOCK,
                    ...formatBlockLog(log),
                });
            });
        }
    }, [instance, helper]);

    useEffect(() => {
        console.log('yoooooo');
        if (instance && tx) {
            console.log();
            instance.once('tx', (log: TransactionReceipt) => {
                console.log({ log });
                TransactionState.dispatch.finalizeTransaction({
                    hash: log.transactionHash,
                    successful: log.status === 1,
                });
            });
        }
    }, [tx, instance]);

    return null;
};
