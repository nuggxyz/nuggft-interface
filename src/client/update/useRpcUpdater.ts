/* eslint-disable no-duplicate-case */
import React from 'react';
import { Log } from '@ethersproject/providers';
import { BigNumber } from 'ethers';

import web3 from '@src/web3';
import { EthInt } from '@src/classes/Fraction';
import { InterfacedEvent } from '@src/interfaces/events';
import lib from '@src/lib';
import emitter from '@src/emitter';
import { useNuggftV1 } from '@src/contracts/useContract';
import { WebSocketProvider } from '@src/web3/classes/WebSocketProvider';

// eslint-disable-next-line import/no-cycle

import { Chain } from '@src/web3/core/interfaces';

import client from '..';

export default () => {
    const chainId = web3.hook.usePriorityChainId();
    const address = web3.hook.usePriorityAccount();

    const updateOffers = client.mutate.updateOffers();
    const updateBlocknum = client.mutate.updateBlocknum();
    const updateProtocol = client.mutate.updateProtocol();

    const removeLoan = client.mutate.removeLoan();
    const removeNuggClaim = client.mutate.removeNuggClaim();
    const removeItemClaimIfMine = client.mutate.removeItemClaimIfMine();
    const addFeedMessage = client.mutate.addFeedMessage();

    const [rpc, setRpc] = React.useState<WebSocketProvider>();

    const nuggft = useNuggftV1();

    const eventListener = React.useCallback(
        (log: Log) => {
            const event = nuggft.interface.parseLog(log) as unknown as InterfacedEvent;

            console.log(event);

            void emitter.emit({
                type: emitter.events.TransactionComplete,
                txhash: log.transactionHash,
                success: true,
            });

            switch (event.name) {
                case 'Offer':
                case 'OfferMint':
                case 'OfferItem':
                case 'Mint':
                case 'Stake': {
                    void emitter.emit({
                        type: emitter.events.Stake,
                        event,
                        log,
                    });

                    void updateProtocol({
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
                    void emitter.emit({
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
                        tokenId: event.args.tokenId.toNuggId(),
                        eth: EthInt.fromNuggftV1Agency(event.args.agency),
                        user: agency.mask(160)._hex as AddressString,
                        txhash: log.transactionHash,
                        isBackup: false,
                        sellingTokenId: null,
                    };

                    void emitter.emit({
                        type: emitter.events.Offer,
                        event,
                        log,
                        data,
                    });

                    void updateOffers(event.args.tokenId.toNuggId(), [data]);
                    break;
                }
                default:
                    break;
            }

            switch (event.name) {
                case 'OfferItem': {
                    const agency = BigNumber.from(event.args.agency);
                    updateOffers(event.args.itemId.toItemId(), [
                        {
                            tokenId: event.args.itemId.toItemId(),
                            eth: EthInt.fromNuggftV1Agency(event.args.agency),
                            user: agency.mask(160).toNumber().toString().toNuggId(),
                            txhash: log.transactionHash,
                            sellingTokenId: event.args.sellingTokenId.toNuggId(),
                            isBackup: false,
                        },
                    ]);
                    break;
                }
                case 'Transfer': {
                    if (address && event.args._to.toLowerCase() === address.toLowerCase()) {
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
                        // addLoan({
                        //     startingEpoch: agency.epoch,
                        //     endingEpoch: agency.epoch.add(1024).toNumber(),
                        //     eth: agency.eth,
                        //     nugg: event.args.tokenId.toString(),
                        // });
                    }
                    break;
                }
                case 'Rebalance': {
                    const agency = lib.parse.agency(event.args.agency);
                    if (agency.address === address) {
                        // updateLoan({
                        //     startingEpoch: agency.epoch.toNumber(),
                        //     endingEpoch: agency.epoch.add(1024).toNumber(),
                        //     eth: agency.eth,
                        //     nugg: event.args.tokenId.toString(),
                        // });
                    }
                    break;
                }
                case 'Liquidate':
                    removeLoan(event.args.tokenId.toNuggId());
                    break;
                case 'Claim': {
                    if (event.args.account.toLowerCase() === address?.toLowerCase()) {
                        removeNuggClaim(event.args.tokenId.toNuggId());
                    }
                    break;
                }
                case 'ClaimItem': {
                    removeItemClaimIfMine(
                        event.args.buyerTokenId.toNuggId(),
                        event.args.itemId.toItemId(),
                    );
                    break;
                }
                default:
                    break;
            }
        },
        [
            address,
            nuggft.interface,
            removeItemClaimIfMine,
            removeLoan,
            removeNuggClaim,
            updateOffers,
            updateProtocol,
            addFeedMessage,
        ],
    );

    const blockListener = React.useCallback(
        (log: number) => {
            if (chainId) updateBlocknum(log, chainId);
        },
        [chainId, updateBlocknum],
    );

    React.useEffect(() => {
        if (rpc) {
            rpc.updateListener('block', blockListener);
        }
    }, [blockListener, rpc]);

    React.useEffect(() => {
        if (rpc) {
            rpc.updateListener(
                {
                    address: nuggft.address,
                    topics: [],
                },
                eventListener,
            );
        }
    }, [eventListener, rpc, nuggft.address]);

    const buildRpc = React.useCallback(
        (chainIdArg: Chain) => {
            const _rpc = web3.config.createInfuraWebSocket(chainIdArg, () => buildRpc(chainIdArg));

            void _rpc.getBlockNumber().then(blockListener);

            _rpc.on('block', blockListener);

            _rpc.on(
                {
                    address: nuggft.address,
                    topics: [],
                },
                eventListener,
            );

            setRpc(_rpc);
        },
        [blockListener, eventListener, nuggft.address],
    );

    const destoyRpc = React.useCallback(() => {
        void rpc?.destroy();
    }, [rpc]);

    React.useEffect(() => {
        if (chainId) {
            buildRpc(chainId);
            return destoyRpc;
        }
        return () => undefined;
    }, [chainId]);

    return null;
};
