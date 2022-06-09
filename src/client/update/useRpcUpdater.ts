/* eslint-disable no-duplicate-case */
import React from 'react';
import { BigNumber } from '@ethersproject/bignumber/lib/bignumber';

import web3 from '@src/web3';
import { EthInt } from '@src/classes/Fraction';
import lib from '@src/lib';
import emitter from '@src/emitter';
import { useNuggftV1 } from '@src/contracts/useContract';
import { buildTokenIdFactory } from '@src/prototypes';
import { buildRpcWebsocket } from '@src/web3/config';

import client from '..';

export default () => {
    const address = web3.hook.usePriorityAccount();

    const updateOffers = client.mutate.updateOffers();
    const updateStake = client.stake.useUpdate();

    const provider = web3.hook.useNetworkProvider();

    const nuggft = useNuggftV1(provider);

    emitter.hook.useOn({
        type: emitter.events.IncomingRpcEvent,
        callback: React.useCallback(
            ({ data: event, log }) => {
                console.log({ event });

                const emitCompletedTx = (
                    from: AddressString | null,
                    validate: (from: AddressString, data: Hash) => boolean,
                ) => {
                    void emitter.emit({
                        type: emitter.events.PotentialTransactionReceipt,
                        txhash: log.transactionHash as Hash,
                        success: true,
                        from,
                        to: nuggft.address as AddressString,
                        log,
                        validate,
                    });
                };

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
                        const stake = EthInt.fromNuggftV1Stake(event.args.stake);
                        void updateStake(stake.shares, stake.staked);
                        break;
                    }
                    default:
                        break;
                }

                switch (event.name) {
                    case 'Mint': {
                        void emitter.emit({
                            type: emitter.events.Mint,
                            event,
                            log,
                        });
                        const agency = BigNumber.from(event.args.agency);

                        const txFrom = agency.mask(160)._hex as AddressString;
                        const txData = nuggft.interface.encodeFunctionData('mint(uint24)', [
                            event.args.tokenId,
                        ]) as Hash;

                        emitCompletedTx(txFrom, (from, data) => {
                            return from === txFrom && data === txData;
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

                        const data = buildTokenIdFactory({
                            tokenId: event.args.tokenId.toNuggId(),
                            eth: EthInt.fromNuggftV1Agency(event.args.agency).bignumber,
                            user: agency.mask(160)._hex as AddressString,
                            txhash: log.transactionHash,
                            isBackup: false,
                            sellingTokenId: null,
                            account: agency.mask(160)._hex as AddressString,
                        });

                        const txFrom = data.user;
                        const txData = nuggft.interface.encodeFunctionData('offer(uint24)', [
                            event.args.tokenId,
                        ]) as Hash;

                        emitCompletedTx(txFrom, (from, dat) => {
                            console.log({ from, dat, txFrom, txData });
                            return from.toLowerCase() === txFrom.toLowerCase() && txData === dat;
                        });

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

                        const txData = nuggft.interface.encodeFunctionData(
                            'offer(uint24,uint24,uint16)',
                            [event.args.sellingTokenId, event.args.itemId, agency.mask(24)],
                        ) as Hash;

                        emitCompletedTx(null, (_, dat) => {
                            return dat.toLowerCase() === txData.toLowerCase();
                        });

                        updateOffers(event.args.itemId.toItemId(), [
                            buildTokenIdFactory({
                                type: 'item' as const,
                                tokenId: event.args.itemId.toItemId(),
                                eth: EthInt.fromNuggftV1Agency(event.args.agency).bignumber,
                                user: agency.mask(160).toNumber().toString().toNuggId(),
                                txhash: log.transactionHash,
                                sellingTokenId: event.args.sellingTokenId.toNuggId(),
                                isBackup: false,
                                account: agency.mask(160).toNumber().toString().toNuggId(),
                            }),
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
                    // case 'Liquidate':
                    //     removeLoan(event.args.tokenId.toNuggId());
                    //     break;
                    case 'Claim': {
                        emitCompletedTx(event.args.account as AddressString, (from) => {
                            return from === event.args.account;
                        });
                        break;
                    }
                    case 'ClaimItem': {
                        emitCompletedTx(null, (from, dat) => {
                            const dec = nuggft.interface.decodeFunctionData(
                                'claim(uint24[],address[],uint24[],uint16[])',
                                dat,
                            ) as [BigNumber[], string[], BigNumber[], BigNumber[]];

                            let check = false;
                            dec[0].forEach((x, i) => {
                                if (
                                    x.eq(event.args.sellingTokenId) &&
                                    dec[2][i].eq(event.args.buyerTokenId) &&
                                    dec[3][i].eq(event.args.itemId)
                                ) {
                                    check = true;
                                }
                            });

                            return check;
                        });

                        break;
                    }
                    case 'Rotate': {
                        void emitter.emit({ type: emitter.events.Rotate, event, log });
                        break;
                    }
                    default:
                        break;
                }
            },
            [address, nuggft.interface, updateOffers, updateStake, nuggft.address],
        ),
    });

    React.useEffect(() => {
        const check = buildRpcWebsocket();
        return check;
    }, []);

    return null;
};
