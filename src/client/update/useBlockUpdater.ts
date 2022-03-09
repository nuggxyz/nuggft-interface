import React from 'react';
import { Log } from '@ethersproject/providers';
import { BigNumber } from 'ethers';

import web3 from '@src/web3';
import NuggftV1Helper from '@src/contracts/NuggftV1Helper';
import { EthInt } from '@src/classes/Fraction';
import { NuggId } from '@src/client/router';

import client from '..';
import { StakeEvent, OfferEvent } from '../../typechain/NuggftV1';

export const useBlockUpdater = () => {
    const infura = client.live.infura();
    const chainId = web3.hook.usePriorityChainId();

    const address = web3.hook.usePriorityAccount();

    React.useEffect(() => {
        if (infura) {
            // const go = async () => {
            //     client.actions.updateBlocknum(await infura.getBlockNumber(), chainId);
            // };
            // go();
            infura.on('block', (log: number) => {
                client.actions.updateBlocknum(log, chainId);
            });

            const nuggft = new NuggftV1Helper(chainId, undefined).contract;

            const globalEvent = {
                address: nuggft.address,
                topics: [
                    // ...nuggft.filters['Stake(bytes32)']().topics,
                    // ...nuggft.filters['OfferMint(uint160,bytes32,bytes32)']().topics,
                    // ...nuggft.filters['Offer(uint160,bytes32)']().topics,
                    // ...nuggft.filters['OfferItem(uint160,bytes2,bytes32)']().topics,
                    // ...nuggft.filters['Claim(uint160,address)'](null, address).topics,
                    // ...nuggft.filters['ClaimItem(uint160,bytes2,uint160)'](null, null, null),
                ],
            };

            infura.on(globalEvent, (log: Log) => {
                let event = nuggft.interface.parseLog(log);

                switch (event.signature) {
                    case 'Stake(bytes32)': {
                        let typedEvent = event as unknown as StakeEvent;

                        client.actions.updateProtocol({
                            stake: EthInt.fromNuggftV1Stake(typedEvent.args.cache),
                        });
                        break;
                    }
                    case 'Offer(uint160,bytes32)':
                    case 'OfferMint(uint160,bytes32,bytes32)':
                    case 'OfferItem(uint160,bytes32,bytes32)':
                        let typedEvent = event as unknown as OfferEvent;

                        const agency = BigNumber.from(typedEvent.args.agency);

                        client.actions.updateOffers(typedEvent.args.tokenId.toString() as NuggId, [
                            {
                                eth: EthInt.fromNuggftV1Agency(typedEvent.args.agency),
                                user: agency.mask(160)._hex,
                                txhash: typedEvent.transactionHash,
                            },
                        ]);
                        break;
                    case 'Claim(uint160,address)':
                    case 'ClaimItem(uint160,bytes2,uint160)':
                        break;
                }
            });
            return () => {
                infura.off(globalEvent);
                infura.off('block', () => undefined);
            };
        }
    }, [infura, chainId, address]);
};
