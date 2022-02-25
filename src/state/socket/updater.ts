import { InfuraWebSocketProvider, Listener, Log } from '@ethersproject/providers';
import { BigNumber } from 'ethers';
import { useEffect } from 'react';

import NuggftV1Helper from '@src/contracts/NuggftV1Helper';
import { LOSS } from '@src/lib/conversion';
import config from '@src/state/web32/config';
import ProtocolState from '@src/state/protocol';

import { StakeEvent, ClaimEvent, OfferEvent } from '../../typechain/NuggftV1';

import { formatLog, SocketType } from './interfaces';

import SocketState from '.';

export default () => {
    const address = config.priority.usePriorityAccount();

    const provider = config.priority.usePriorityProvider();
    const chainId = config.priority.usePriorityChainId();

    useEffect(() => {
        if (provider) {
            const helper = new NuggftV1Helper(chainId, provider);

            const socket = new InfuraWebSocketProvider(
                'goerli',
                'a1625b39cf0047febd415f9b37d8c931',
            );
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
                            ...formatLog(log),
                        });

                        break;
                    case helper.contract.interface.events['Claim(uint160,address)'].name: // suck it more
                        SocketState.dispatch.incomingEvent({
                            type: SocketType.CLAIM,
                            tokenId: (event as unknown as ClaimEvent).args.tokenId._hex,
                            ...formatLog(log),
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
                            ...formatLog(log),
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
            socket.addListener('block', (num: number) =>
                ProtocolState.dispatch.setCurrentBlock(num),
            );

            socket.addListener(helper.contract.filters.Stake(null), update);
            socket.addListener(helper.contract.filters.Offer(null, null), update);
            address && socket.addListener(helper.contract.filters.Claim(null, address), update);

            return () => {
                socket.removeAllListeners();
            };
        }
    }, [provider, address]);

    return null;
};
