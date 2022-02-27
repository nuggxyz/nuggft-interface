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

    useEffect(() => {
        if (chainId && web3.config.isValidChainId(chainId)) {
            const _instance = web3.config.createInfuraWebSocket(chainId);

            setInstance(_instance);

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
                instance.off(block__listener, () => undefined);
                instance.off(offer__listener, () => undefined);
                instance.off(stake__listener, () => undefined);
                if (instance && instance._wsReady) {
                    instance.removeAllListeners();
                    instance.destroy();
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
