import React from 'react';
import { Log } from '@ethersproject/providers';
import { BigNumber } from 'ethers';

import web3 from '@src/web3';
import NuggftV1Helper from '@src/contracts/NuggftV1Helper';
import { EthInt } from '@src/classes/Fraction';
import { ItemId } from '@src/client/router';
import { InterfacedEvent } from '@src/interfaces/events';
import lib from '@src/lib';

import client from '..';

export const useRpcUpdater = () => {
    const infura = client.live.infura();
    const chainId = web3.hook.usePriorityChainId();
    const address = web3.hook.usePriorityAccount();

    React.useEffect(() => {
        if (infura && chainId) {
            infura.on('block', (log: number) => {
                client.actions.updateBlocknum(log, chainId);
            });

            const nuggft = new NuggftV1Helper(chainId, undefined).contract;

            const globalEvent = {
                address: nuggft.address,
                topics: [],
            };

            infura.on(globalEvent, (log: Log) => {
                const event = nuggft.interface.parseLog(log) as unknown as InterfacedEvent;

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

                        client.actions.updateOffers(event.args.tokenId.toString(), [
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
                    case 'Transfer': {
                        if (address && event.args._to.toLowerCase() === address.toLowerCase()) {
                            client.actions.addNugg({
                                tokenId: event.args._tokenId.toString(),
                                activeLoan: false,
                                activeSwap: false,
                                unclaimedOffers: [],
                            });
                        }

                        break;
                    }
                    case 'Loan': {
                        const agency = lib.parse.agency(event.args.agency);
                        if (agency.address === address) {
                            client.actions.addLoan({
                                startingEpoch: agency.epoch.toNumber(),
                                endingEpoch: agency.epoch.add(1024).toNumber(),
                                eth: agency.eth,
                                nugg: event.args.tokenId.toString(),
                            });
                        }
                        break;
                    }
                    case 'Rebalance': {
                        const agency = lib.parse.agency(event.args.agency);
                        if (agency.address === address) {
                            client.actions.updateLoan({
                                startingEpoch: agency.epoch.toNumber(),
                                endingEpoch: agency.epoch.add(1024).toNumber(),
                                eth: agency.eth,
                                nugg: event.args.tokenId.toString(),
                            });
                        }
                        break;
                    }
                    case 'Liquidate':
                        {
                            client.actions.removeLoan(event.args.tokenId.toString());
                        }
                        break;
                    case 'Claim': {
                        if (event.args.account === address) {
                            client.actions.removeNuggClaim(event.args.tokenId.toString());
                        }
                        break;
                    }
                    case 'ClaimItem': {
                        client.actions.removeItemClaimIfMine(
                            event.args.buyerTokenId.toString(),
                            ('item-' + BigNumber.from(event.args.itemId).toString()) as ItemId,
                        );
                        break;
                    }
                }
            });
            return () => {
                infura.off(globalEvent, () => undefined);
                infura.off('block', () => undefined);
            };
        }
    }, [infura, chainId, address]);
};
