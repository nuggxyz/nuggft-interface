/* eslint-disable no-duplicate-case */
import React from 'react';
import { Log } from '@ethersproject/providers';
import { BigNumber } from 'ethers';

import web3 from '@src/web3';
import NuggftV1Helper from '@src/contracts/NuggftV1Helper';
import { EthInt } from '@src/classes/Fraction';
import { ItemId } from '@src/client/router';
import { InterfacedEvent } from '@src/interfaces/events';
import lib from '@src/lib';
import emitter from '@src/emitter';

// eslint-disable-next-line import/no-cycle
import client from '..';

export default () => {
    const rpc = client.live.rpc();
    const chainId = web3.hook.usePriorityChainId();
    const address = web3.hook.usePriorityAccount();

    React.useEffect(() => {
        if (rpc && chainId) {
            rpc.on('block', (log: number) => {
                client.actions.updateBlocknum(log, chainId);
            });

            const nuggft = new NuggftV1Helper(chainId, undefined).contract;

            const globalEvent = {
                address: nuggft.address,
                topics: [],
            };

            rpc.on(globalEvent, (log: Log) => {
                const event = nuggft.interface.parseLog(log) as unknown as InterfacedEvent;

                switch (event.name) {
                    case 'Offer':
                    case 'OfferMint':
                    case 'OfferItem':
                    case 'Mint':
                    case 'Stake': {
                        emitter.emit({
                            type: emitter.events.Stake,
                            event,
                            log,
                        });

                        client.actions.updateProtocol({
                            stake: EthInt.fromNuggftV1Stake(event.args.stake),
                        });
                        break;
                    }
                    default:
                        break;
                }

                switch (event.name) {
                    case 'OfferMint':
                    case 'Mint': {
                        emitter.emit({
                            type: emitter.events.Mint,
                            event,
                            log,
                        });
                        break;
                    }
                    default:
                        break;
                }

                switch (event.name) {
                    case 'Offer':
                    case 'OfferMint': {
                        const agency = BigNumber.from(event.args.agency);

                        const data = {
                            eth: EthInt.fromNuggftV1Agency(event.args.agency),
                            user: agency.mask(160)._hex,
                            txhash: log.transactionHash,
                        };

                        emitter.emit({
                            type: emitter.events.Offer,
                            event,
                            log,
                            data,
                        });

                        client.actions.updateOffers(event.args.tokenId.toString(), [data]);
                        break;
                    }
                    default:
                        break;
                }

                switch (event.name) {
                    case 'OfferItem': {
                        const agency = BigNumber.from(event.args.agency);

                        client.actions.updateOffers(
                            `item-${Number(event.args.itemId).toString()}` as ItemId,
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
                            emitter.emit({
                                type: emitter.events.Transfer,
                                event,
                                log,
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
                        client.actions.removeLoan(event.args.tokenId.toString());
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
                            `item-${BigNumber.from(event.args.itemId).toString()}` as ItemId,
                        );
                        break;
                    }
                    default:
                        break;
                }
            });
            return () => {
                rpc.off(globalEvent, () => undefined);
                rpc.off('block', () => undefined);
            };
        }
        return () => undefined;
    }, [rpc, chainId, address]);
};
