/* eslint-disable no-duplicate-case */
import { BigNumber } from '@ethersproject/bignumber/lib/bignumber';

import { EthInt } from '@src/classes/Fraction';
import emitter from '@src/emitter';
import lib from '@src/lib';
import { buildTokenIdFactory } from '@src/prototypes';
import { DEFAULT_CONTRACTS } from '@src/web3/constants';

import client from '..';

export default () => {
    const updateOffers = client.mutate.updateOffers();
    const updateStake = client.stake.useUpdate();
    const nuggs = client.user.useNuggs();

    const epoch = client.epoch.active.useId();

    emitter.useOn(
        emitter.events.IncomingRpcEvent,
        ({ data: event, log }) => {
            if (!epoch) return;
            console.log({ event });

            const emitCompletedTx = (
                from: AddressString | null,
                validate: (from: AddressString, data: Hash) => boolean,
            ) => {
                void emitter.emit(emitter.events.PotentialTransactionReceipt, {
                    txhash: log.transactionHash as Hash,
                    success: true,
                    from,
                    to: DEFAULT_CONTRACTS.NuggftV1 as AddressString,
                    log,
                    validate,
                });
            };

            switch (event.name) {
                case 'Offer':
                case 'OfferMint':
                case 'OfferItem':
                case 'Stake': {
                    void emitter.emit(emitter.events.Stake, {
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
                case 'Offer':
                case 'OfferMint': {
                    const agency = BigNumber.from(event.args.agency);
                    const agencyParsed = lib.parse.agency(agency);

                    const data = buildTokenIdFactory({
                        agencyEpoch: agencyParsed.epoch,
                        tokenId: event.args.tokenId.toNuggId(),
                        eth: EthInt.fromNuggftV1Agency(event.args.agency).bignumber,
                        txhash: log.transactionHash,
                        isBackup: false,
                        sellingTokenId: null,
                        account: agencyParsed.address,
                    });

                    const txFrom = data.account;

                    emitCompletedTx(txFrom, (from) => {
                        return from.toLowerCase() === txFrom.toLowerCase();
                    });

                    void emitter.emit(emitter.events.Offer, {
                        event,
                        log,
                        data,
                    });

                    void updateOffers(event.args.tokenId.toNuggId(), data);
                    break;
                }
                default:
                    break;
            }

            switch (event.name) {
                case 'OfferItem': {
                    const agency = BigNumber.from(event.args.agency);

                    const allgoood =
                        nuggs.findIndex(
                            (x) => x.tokenId.toRawIdNum() === agency.mask(24).toNumber(),
                        ) !== -1;

                    emitCompletedTx(null, () => {
                        return allgoood;
                    });

                    const agencyParsed = lib.parse.agency(agency);

                    updateOffers(
                        event.args.itemId.toItemId(),
                        buildTokenIdFactory({
                            agencyEpoch: agencyParsed.epoch,
                            type: 'item' as const,
                            tokenId: event.args.itemId.toItemId(),
                            eth: EthInt.fromNuggftV1Agency(event.args.agency).bignumber,
                            txhash: log.transactionHash,
                            sellingTokenId: event.args.sellingTokenId.toNuggId(),
                            isBackup: false,
                            account: agency.mask(160).toNumber().toString().toNuggId(),
                        }),
                    );
                    break;
                }
                case 'Transfer': {
                    break;
                }
                case 'Loan': {
                    break;
                }
                case 'Rebalance': {
                    break;
                }

                case 'Claim': {
                    emitCompletedTx(event.args.account as AddressString, (from) => {
                        return from === event.args.account;
                    });
                    break;
                }
                case 'ClaimItem': {
                    emitCompletedTx(null, (from, dat) => {
                        return log.data === dat;
                    });

                    break;
                }
                case 'Rotate': {
                    void emitter.emit(emitter.events.Rotate, { event, log });
                    break;
                }
                default:
                    break;
            }
        },
        [updateOffers, updateStake, nuggs, epoch],
    );

    // React.useEffect(() => {
    //     const check = buildRpcWebsocket();
    //     return check;
    // }, []);

    return null;
};
