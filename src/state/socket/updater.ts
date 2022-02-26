import {
    InfuraWebSocketProvider,
    Listener,
    Log,
    TransactionReceipt,
} from '@ethersproject/providers';
import { BigNumber } from 'ethers';
import { useEffect, useState } from 'react';

import NuggftV1Helper from '@src/contracts/NuggftV1Helper';
import { LOSS } from '@src/lib/conversion';
import ProtocolState from '@src/state/protocol';
import web3 from '@src/web3';
import TransactionState from '@src/state/transaction';

import { StakeEvent, ClaimEvent, OfferEvent } from '../../typechain/NuggftV1';

import { formatBlockLog, formatEventLog, SocketType } from './interfaces';

import SocketState from './index';

export default () => {
    const address = web3.hook.usePriorityAccount();
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
        if (instance) {
            async function getit() {
                SocketState.dispatch.incomingEvent({
                    type: SocketType.BLOCK,
                    ...formatBlockLog(await instance.getBlockNumber()),
                });
            }
            getit();

            instance.on('block', (log: number) => {
                SocketState.dispatch.incomingEvent({
                    type: SocketType.BLOCK,
                    ...formatBlockLog(log),
                });
            });
        }
    }, [instance]);

    useEffect(() => {
        if (instance && tx) {
            instance.once(tx, (log: TransactionReceipt) => {
                console.log({ log });
                TransactionState.dispatch.finalizeTransaction({
                    hash: log.transactionHash,
                    successful: log.status === 1,
                });
            });
        }
    }, [tx, instance]);

    useEffect(() => {
        if (instance && helper) {
            const update: Listener = (log: Log) => {
                let event = helper.contract.interface.parseLog(log);

                console.log({ input: log, parsed: event });

                switch (event.name) {
                    case helper.contract.interface.events['Stake(bytes32)'].name: // suck it
                        const cache = BigNumber.from((event as unknown as StakeEvent).args.cache);

                        SocketState.dispatch.incomingEvent({
                            type: SocketType.STAKE,
                            shares: cache.shr(192)._hex,
                            staked: cache.shr(96).mask(96)._hex,
                            proto: cache.mask(96)._hex,
                            ...formatEventLog(log),
                        });

                        break;
                    case helper.contract.interface.events['Claim(uint160,address)'].name: // suck it more
                        SocketState.dispatch.incomingEvent({
                            type: SocketType.CLAIM,
                            tokenId: (event as unknown as ClaimEvent).args.tokenId._hex,
                            ...formatEventLog(log),
                        });
                        break;
                    case helper.contract.interface.events['Offer(uint160,bytes32)'].name: // suck it more
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
                        break;
                    case helper.contract.interface.events['Mint(uint160,uint96)'].name: // suck it more
                        // const mintEvent = (event as unknown as MintEvent).args;
                        // const mintAgnecy = BigNumber.from(mintEvent.);

                        // setSubscribedMint({
                        //     receivedAt: new Date(),
                        //     data: {
                        //         account: mintAgnecy.mask(160)._hex,
                        //         value: mintAgnecy.shr(160).mask(70).mul(LOSS),
                        //         tokenId: mintEvent.tokenId,
                        //     },
                        // });
                        break;
                    // case 'block':
                    default:
                }
            };

            instance.addListener('block', (num: number) =>
                ProtocolState.dispatch.setCurrentBlock(num),
            );
            instance.addListener(helper.contract.filters.Stake(null), update);
            instance.addListener(helper.contract.filters.Offer(null, null), update);
            address && instance.addListener(helper.contract.filters.Claim(null, address), update);
        }
    }, [instance, helper, address]);

    return null;
};
