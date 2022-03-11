import React from 'react';
import { Log } from '@ethersproject/providers';
import { BigNumber } from 'ethers';

import web3 from '@src/web3';
import NuggftV1Helper from '@src/contracts/NuggftV1Helper';
import { EthInt } from '@src/classes/Fraction';
import { ItemId, NuggId } from '@src/client/router';
import { InterfacedEvent } from '@src/interfaces/events';

import client from '..';

export const useBlockUpdater = () => {
    const infura = client.live.infura();
    const chainId = web3.hook.usePriorityChainId();

    const address = web3.hook.usePriorityAccount();

    React.useEffect(() => {
        if (infura) {
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
                let event = nuggft.interface.parseLog(log) as unknown as InterfacedEvent;

                console.log({ event });

                switch (event.name) {
                    case 'Offer':
                    case 'OfferMint':
                    case 'OfferItem':
                    case 'Stake': {
                        client.actions.updateProtocol({
                            stake: EthInt.fromNuggftV1Stake(
                                event.name === 'Stake' ? event.args.cache : event.args.stake,
                            ),
                        });
                        break;
                    }
                }

                switch (event.name) {
                    case 'Offer':
                    case 'OfferMint': {
                        const agency = BigNumber.from(event.args.agency);

                        client.actions.updateOffers(event.args.tokenId.toString() as NuggId, [
                            {
                                eth: EthInt.fromNuggftV1Agency(event.args.agency),
                                user: agency.mask(160)._hex,
                                txhash: log.transactionHash,
                            },
                        ]);
                        break;
                    }
                    case 'OfferItem': {
                        const agency = BigNumber.from(event.args.agency);

                        client.actions.updateOffers(
                            ('item-' + Number(event.args.itemId).toString()) as ItemId,
                            [
                                {
                                    eth: EthInt.fromNuggftV1Agency(event.args.agency),
                                    user: agency.mask(160)._hex,
                                    txhash: log.transactionHash,
                                },
                            ],
                        );
                        break;
                    }
                    case 'Claim':
                    case 'ClaimItem':
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
