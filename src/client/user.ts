/* eslint-disable no-param-reassign */
import create from 'zustand';
import { combine } from 'zustand/middleware';
import { ApolloClient, ApolloQueryResult } from '@apollo/client';
import React from 'react';
import shallow from 'zustand/shallow';
import { Promise } from 'bluebird';

import { EthInt } from '@src/classes/Fraction';
import { LiveUserDocument, LiveUserQuery, LiveUserQueryVariables } from '@src/gql/types.generated';
import { buildTokenIdFactory } from '@src/prototypes';
import { Address } from '@src/classes/Address';
import web3 from '@src/web3';
import { apolloClient } from '@src/web3/config';
import { NuggftV1 } from '@src/typechain/NuggftV1';
import { nuggBackup } from '@src/contracts/backup';
import { useNuggftV1 } from '@src/contracts/useContract';
import emitter from '@src/emitter';
import { EmitEventNames, EmitEvents } from '@src/emitter/interfaces';
import { isUndefinedOrNullOrObjectEmpty } from '@src/lib';

import formatNuggItems from './formatters/formatNuggItems';
import epoch from './epoch';
import { OfferData } from './interfaces';
import { LOAN_EPOCH_LENGTH } from '@src/web3/constants';

export interface LoanData {
	endingEpoch: number;
	eth: EthInt;
	nugg: NuggId;
	startingEpoch: number;
}

export interface LiveNuggItem extends ItemIdFactory<TokenIdFactoryBase> {
	activeSwap: string | undefined;
	feature: number;
	position: number;
	count: number;
	displayed: boolean;
}

export interface MyNugg {
	activeLoan: boolean | null;
	activeSwap: boolean | object | undefined;
	tokenId: NuggId;
	recent: boolean | null;
	pendingClaim: boolean | null;
	lastTransfer: number | null;
	items: LiveNuggItem[];
	unclaimedOffers: {
		itemId: ItemId | null;
		endingEpoch: number | null;
		eth: BigNumberish | undefined;
		sellingNuggId: NuggId | null;
		leader: boolean;
	}[];
}

export interface UnclaimedOfferBase extends TokenIdFactoryBase {
	endingEpoch: number | null;
	eth: EthInt;
	leader: boolean;
	claimParams: unknown;
	nugg: unknown;
}

export type UnclaimedOffer = TokenIdFactoryCreator<
	UnclaimedOfferBase,
	{
		nugg: null;
		claimParams: {
			sellingTokenId: NuggId;
			address: AddressString;
			buyingTokenId: 'nugg-0';
			itemId: 'item-0';
		};
	},
	{
		nugg: NuggId;
		claimParams: {
			sellingTokenId: NuggId;
			address: AddressStringZero;
			buyingTokenId: NuggId;
			itemId: ItemId;
		};
	}
>;

const format = (address: AddressString, x: ApolloQueryResult<LiveUserQuery>) => {
	if (!x?.data?.user) return undefined;

	const { user } = x.data;

	const myNuggs: MyNugg[] = user.nuggs.map((z) => {
		return {
			recent: false,
			tokenId: z.id.toNuggId(),
			activeLoan: !!z.activeLoan,
			activeSwap: !!z.activeSwap,
			pendingClaim: z.pendingClaim,
			lastTransfer: z.lastTransfer,
			items: formatNuggItems(z),
			unclaimedOffers: z.offers.map((y) => {
				return {
					leader: y.swap.leader?.id === z.id,
					itemId: y.swap.sellingItem.id.toItemId(),
					eth: y.eth,
					sellingNuggId: y.swap.sellingNuggItem.nugg.id.toNuggId(),
					endingEpoch:
						y && y.swap && y.swap.endingEpoch ? Number(y.swap.endingEpoch) : null,
				};
			}),
		};
	});

	const myUnclaimedNuggOffers: UnclaimedOffer[] = user.offers.map((z) => {
		return buildTokenIdFactory({
			tokenId: z.swap.nugg.id.toNuggId(),
			endingEpoch: z && z.swap && z.swap.endingEpoch ? Number(z.swap.endingEpoch) : null,
			eth: new EthInt(z.eth),
			leader: z.swap.leader.id.toLowerCase() === address.toLowerCase(),
			claimParams: {
				address: address as AddressString,
				sellingTokenId: z.swap.nugg.id.toNuggId(),
				itemId: 'item-0',
				buyingTokenId: 'nugg-0',
			},
			nugg: null,
		});
	});
	const myUnclaimedItemOffers: UnclaimedOffer[] = user.nuggs
		.map((z) => {
			return z.offers.map((y) => {
				return buildTokenIdFactory({
					tokenId: y.swap.sellingItem.id.toItemId(),
					endingEpoch:
						y && y.swap && y.swap.endingEpoch ? Number(y.swap.endingEpoch) : null,
					eth: new EthInt(y.eth),
					leader: y.swap.leader?.id === z.id,
					nugg: z.id.toNuggId(),
					claimParams: {
						itemId: y.swap.sellingItem.id.toItemId(),
						buyingTokenId: z.id.toNuggId(),
						sellingTokenId: y.swap.sellingNuggItem.nugg.id.toNuggId(),
						address: Address.ZERO.hash as AddressStringZero,
					},
				});
			});
		})
		.flat();

	const myLoans: LoanData[] = user.loans.map((z) => {
		return {
			endingEpoch: Number(z.endingEpoch),
			eth: new EthInt(z.eth),
			nugg: z.nugg.id.toNuggId(),
			startingEpoch: +z.epoch.id,
		};
	});

	return {
		myNuggs,
		myUnclaimedNuggOffers,
		myUnclaimedItemOffers,
		myLoans,
	};
};

const store = create(
	combine(
		{
			nuggs: [] as MyNugg[],
			unclaimedOffers: [] as UnclaimedOffer[],
			loans: [] as LoanData[],
		},
		(set) => {
			const fetch = async (
				address?: AddressString,
				client?: ApolloClient<any>,
				nuggft?: NuggftV1,
				_epoch?: number,
			) => {
				if (!address || !client || !_epoch) return Promise.resolve();
				const backup = async () => {
					await nuggft?.tokensOf(address).then(async (x) => {
						const nuggs = await Promise.map(x, async (z) => {
							return nuggBackup(z.toNuggId(), nuggft, _epoch).then((b) => {
								return { ...b };
							});
						});
						set(() => ({
							// this filter is a hack that can be removed once we deploy the new nuggft - its an issue with ownerOf/agencyOf
							nuggs: nuggs.filter((y) => y.owner === address),
						}));
					});
				};

				return client
					.query<LiveUserQuery, LiveUserQueryVariables>({
						query: LiveUserDocument,
						variables: {
							address,
						},
						fetchPolicy: 'no-cache',
					})
					.then((x) => {
						if (x.error || x.errors) {
							void backup();
							return;
						}

						const res2 = format(address, x);

						if (!res2) return;
						set(() => ({
							nuggs: res2?.myNuggs,
							loans: res2?.myLoans,
							unclaimedOffers: [
								...res2.myUnclaimedItemOffers,
								...res2.myUnclaimedNuggOffers,
							],
						}));
					})
					.catch(() => {
						void backup();
					});
			};

			const wipe = () => {
				set(() => ({
					nuggs: [],
					loans: [],
					unclaimedOffers: [],
				}));
			};

			const handleIncomingOffers = (data: OfferData, address: AddressString) => {
				set((draft) => {
					if (
						data.isItem() &&
						(!isUndefinedOrNullOrObjectEmpty(
							draft.nuggs.find(
								(nugg) => data.account.toLowerCase() === nugg.tokenId.toLowerCase(),
							),
						) ||
							!isUndefinedOrNullOrObjectEmpty(
								draft.unclaimedOffers.find(
									(offer) =>
										offer.tokenId.toLowerCase() === data.tokenId.toLowerCase(),
								),
							))
					) {
						console.log(
							draft.nuggs.find(
								(nugg) => data.account.toLowerCase() === nugg.tokenId.toLowerCase(),
							),
						);
						draft.unclaimedOffers = [
							buildTokenIdFactory({
								tokenId: data.tokenId,
								endingEpoch: Number(data.agencyEpoch),
								eth: new EthInt(data.eth),
								leader: !isUndefinedOrNullOrObjectEmpty(
									draft.nuggs.find(
										(nugg) =>
											data.account.toLowerCase() ===
											nugg.tokenId.toLowerCase(),
									),
								),
								nugg: data.account as NuggId,
								claimParams: {
									itemId: data.tokenId,
									buyingTokenId: data.account as NuggId,
									sellingTokenId: data.sellingTokenId!,
									address: Address.ZERO.hash as AddressStringZero,
								},
							}),
							...draft.unclaimedOffers.filter(
								(offer) => offer.tokenId !== data.tokenId,
							),
						];
					} else if (
						data.isNugg() &&
						(data.account.toLowerCase() === address.toLowerCase() ||
							!isUndefinedOrNullOrObjectEmpty(
								draft.unclaimedOffers.find(
									(offer) =>
										offer.tokenId.toLowerCase() === data.tokenId.toLowerCase(),
								),
							))
					) {
						draft.unclaimedOffers = [
							buildTokenIdFactory({
								tokenId: data.tokenId,
								endingEpoch: Number(data.agencyEpoch),
								eth: new EthInt(data.eth),
								leader: data.account.toLowerCase() === address.toLowerCase(),
								claimParams: {
									address: address as AddressString,
									sellingTokenId: data.tokenId,
									itemId: 'item-0',
									buyingTokenId: 'nugg-0',
								},
								nugg: null,
							}),
							...draft.unclaimedOffers.filter(
								(offer) => offer.tokenId !== data.tokenId,
							),
						];
					}
					return draft;
				});
			};

			const updateNuggs = (
				nuggId: number,
				eventType: 'Loan' | 'Liquidate' | 'Rebalance',
				eth: BigNumber,
				startingEpoch: number,
			) => {
				set((draft) => {
					console.log(eventType);
					switch (eventType) {
						case 'Liquidate':
							draft.loans.splice(
								draft.loans.findIndex(
									(loans) => loans.nugg.toRawIdNum() === nuggId,
								),
								1,
							);
							draft.loans = [...draft.loans];
							draft.nuggs = draft.nuggs.map((nugg) => {
								if (nugg.tokenId.toRawIdNum() === nuggId) {
									nugg.activeLoan = null;
								}
								return nugg;
							});
							break;
						case 'Loan':
							draft.loans = [
								{
									nugg: nuggId.toNuggId(),
									eth: new EthInt(eth),
									startingEpoch,
									endingEpoch: startingEpoch + LOAN_EPOCH_LENGTH,
								},
								...draft.loans,
							];
							draft.nuggs = draft.nuggs.map((nugg) => {
								if (nugg.tokenId.toRawIdNum() === nuggId) {
									nugg.activeLoan = true;
								}
								return nugg;
							});
							break;
						case 'Rebalance':
							draft.loans = draft.loans.map((loan) => {
								if (loan.nugg.toRawIdNum() === nuggId) {
									loan = {
										nugg: nuggId.toNuggId(),
										eth: new EthInt(eth),
										startingEpoch,
										endingEpoch: startingEpoch + LOAN_EPOCH_LENGTH,
									};
								}
								return loan;
							});
							break;
						default:
							break;
					}

					return { ...draft };
				});
			};

			return { fetch, wipe, handleIncomingOffers, updateNuggs };
		},
	),
);

export const useUserUpdater = () => {
	const address = web3.hook.usePriorityAccount();
	const provider = web3.hook.usePriorityProvider();

	const _epoch = epoch.active.useId();

	const fetch = store((draft) => draft.fetch);
	const wipe = store((draft) => draft.wipe);
	const handleIncomingOffers = store((draft) => draft.handleIncomingOffers);
	const nuggft = useNuggftV1(provider);
	const callback = React.useCallback(() => {
		if (address && _epoch) {
			void fetch(address as AddressString, apolloClient, nuggft, _epoch);
		}
	}, [fetch, address, nuggft, _epoch]);

	const cb = React.useCallback(
		(data: EmitEvents) => {
			if (address && data.type === EmitEventNames.Offer) {
				handleIncomingOffers(data.data as OfferData, address);
			}
		},
		[address, handleIncomingOffers],
	);

	emitter.useOn(EmitEventNames.Offer, cb);

	React.useEffect(() => {
		void wipe();
		if (address && _epoch) {
			void fetch(address as AddressString, apolloClient, nuggft, _epoch);
		}
	}, [address, fetch, wipe, nuggft, _epoch]);

	epoch.useCallbackOnEpochChange(callback);
};

const useUnclaimedOffersFilteredByEpoch = () => {
	const _epoch = epoch.active.useId();
	return store(
		(state) =>
			state.unclaimedOffers
				.flat()
				.filter(
					(x) =>
						x.endingEpoch !== null && _epoch && x.endingEpoch < _epoch && !x.isNugg(),
				)
				.sort((a, b) => ((a.endingEpoch ?? 0) > (b.endingEpoch ?? 0) ? -1 : 1)),
		shallow,
	);
};
const useActiveOffers = () => {
	const _epoch = epoch.active.useId();
	return store(
		(state) =>
			state.unclaimedOffers
				.flat()
				.filter((x) => x.endingEpoch !== null && _epoch && x.endingEpoch >= _epoch)
				.sort((a, b) => ((a.endingEpoch ?? 0) > (b.endingEpoch ?? 0) ? -1 : 1)),
		shallow,
	);
};

export default {
	useNuggs: () => store((draft) => draft.nuggs),
	useNugg: (nuggId?: NuggId) =>
		store(
			React.useCallback(
				(state) =>
					nuggId !== undefined
						? state.nuggs.find((x) => x.tokenId === nuggId) ?? undefined
						: undefined,
				[nuggId],
			),
			// shallow removed
		),

	useUnclaimedOffers: () => store((draft) => draft.unclaimedOffers),
	useLoans: () => store((draft) => draft.loans),
	useFetch: () => store((draft) => draft.fetch),
	useUpdateNuggs: () => store((draft) => draft.updateNuggs),
	useUnclaimedOffersFilteredByEpoch,
	useActiveOffers,
	...store,
};
