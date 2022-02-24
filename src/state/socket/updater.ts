import {
    InfuraWebSocketProvider,
    Listener,
    Log,
} from '@ethersproject/providers';
import { BigNumber } from 'ethers';
import { useEffect } from 'react';

import NuggftV1Helper from '../../contracts/NuggftV1Helper';
import { LOSS } from '../../lib/conversion';
import { StakeEvent, ClaimEvent, OfferEvent } from '../../typechain/NuggftV1';
import Web3State from '../web3';

import { formatLog, SocketType } from './interfaces';

import SocketState from '.';

export default () => {
    const { library } = Web3State.hook.useActiveWeb3React();
    const address = Web3State.select.web3address();

    useEffect(() => {
        if (library) {
            const socket = new InfuraWebSocketProvider(
                'goerli',
                'a1625b39cf0047febd415f9b37d8c931',
            );
            const update: Listener = (log: Log) => {
                let event = NuggftV1Helper.instance.interface.parseLog(log);

                console.log({ input: log, parsed: event });

                switch (event.name) {
                    case NuggftV1Helper.instance.interface.events[
                        'Stake(bytes32)'
                    ].name: // suck it
                        const cache = BigNumber.from(
                            (event as unknown as StakeEvent).args.cache,
                        );

                        SocketState.dispatch.incomingEvent({
                            type: SocketType.STAKE,
                            shares: cache.shr(192)._hex,
                            staked: cache.shr(96).mask(96)._hex,
                            proto: cache.mask(96)._hex,
                            ...formatLog(log),
                        });

                        break;
                    case NuggftV1Helper.instance.interface.events[
                        'Claim(uint160,address)'
                    ].name: // suck it more
                        SocketState.dispatch.incomingEvent({
                            type: SocketType.CLAIM,
                            tokenId: (event as unknown as ClaimEvent).args
                                .tokenId._hex,
                            ...formatLog(log),
                        });
                        break;
                    case NuggftV1Helper.instance.interface.events[
                        'Offer(uint160,bytes32)'
                    ].name: // suck it more
                        const offerEvent = (event as unknown as OfferEvent)
                            .args;
                        const offerAgnecy = BigNumber.from(offerEvent.agency);

                        SocketState.dispatch.incomingEvent({
                            type: SocketType.OFFER,
                            account: offerAgnecy.mask(160)._hex,
                            value: offerAgnecy.shr(160).mask(70).mul(LOSS)._hex,
                            endingEpoch: offerAgnecy.shr(230).mask(24)._hex,
                            tokenId: offerEvent.tokenId._hex,
                            ...formatLog(log),
                        });
                        break;
                    case NuggftV1Helper.instance.interface.events[
                        'Mint(uint160,uint96)'
                    ].name: // suck it more
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
                    default:
                }
            };

            socket.addListener(
                NuggftV1Helper.instance.filters.Stake(null),
                update,
            );

            socket.addListener(
                NuggftV1Helper.instance.filters.Offer(null, null),
                update,
            );
            address &&
                socket.addListener(
                    NuggftV1Helper.instance.filters.Claim(null, address),
                    update,
                );

            return () => {
                socket.removeAllListeners();
            };
        }
    }, [library, address]);

    return null;
};
