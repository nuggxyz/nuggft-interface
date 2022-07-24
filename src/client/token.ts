import React from 'react';
import create from 'zustand';
import { combine } from 'zustand/middleware';

interface OfferDataBase extends TokenIdFactoryBase {
	eth: BigNumber;
	txhash: string | null;
	isBackup: boolean;
	sellingTokenId: null | NuggId;
	account: unknown;
	incrementX64?: BigNumber;
	agencyEpoch: number | null;
}

export type OfferData = TokenIdFactoryCreator<
	OfferDataBase,
	{ sellingTokenId: null; account: AddressString },
	{ sellingTokenId: NuggId; account: NuggId }
>;

export interface ListDataBase extends TokenIdFactoryBase {
	listDataType: 'swap' | 'basic';
	dotnuggRawCache?: Base64EncodedSvg;
}

export interface BasicData extends ListDataBase {
	listDataType: 'basic';
	dotnuggRawCache?: Base64EncodedSvg;
}

interface SwapDataBase extends ListDataBase {
	listDataType: 'swap';
	eth: BigNumber;
	endingEpoch: number | null;
	canceledEpoch: number | null;
	startUnix?: number;
	leader?: unknown;
	owner: unknown;
	num: number | null;
	bottom: BigNumber;
	isBackup: boolean;
	count?: unknown;
	isTryout?: unknown;
	offers: OfferData[];
	isPotential?: never;
	commitBlock: number | null;
	numOffers: number;
	isV2?: never;
}

export type SwapData = TokenIdFactoryCreator<
	SwapDataBase,
	{ leader?: AddressString; owner: AddressString },
	{ leader?: NuggId; owner: NuggId; count: number; isTryout: boolean }
>;

export type ListData = SwapData | BasicData;
export interface Live extends TokenIdFactoryBase {
	activeSwap?: SwapData;
}

export interface LiveNuggItem extends ItemIdFactory<TokenIdFactoryBase> {
	activeSwap: string | undefined;
	feature: number;
	position: number;
	count: number;
	displayed: boolean;
}

export interface LiveNugg extends NuggIdFactory<Live> {
	activeLoan: boolean | null;
	activeSwap?: IsolateNuggIdFactory<SwapData>;
	items: LiveNuggItem[];
	pendingClaim: boolean | null;
	lastTransfer: number | null;
	owner: AddressString;
	swaps: IsolateNuggIdFactory<SwapData>[];
	isBackup: boolean;
}

export type TryoutData = { nugg: NuggId; eth: BigNumber };

export interface LiveItem extends ItemIdFactory<Live> {
	activeSwap?: IsolateItemIdFactory<SwapData>;
	swaps: IsolateItemIdFactory<SwapData>[];
	count: number;
	tryout: {
		count: number;
		swaps: TryoutData[];
		max?: TryoutData;
		min?: TryoutData;
	};
	rarity: Fraction;
	isBackup: boolean;
}

export type LiveToken = LiveItem | LiveNugg;

const useStore = create(
	combine(
		{
			liveTokens: {} as TokenIdDictionary<LiveToken>,
		},

		(set, get) => {
			function updateOffers(tokenId: TokenId, offer: OfferData): void {
				const isNugg = tokenId.isNuggId();

				if (isNugg) {
					const activeSwap = get().liveTokens[tokenId]?.activeSwap;

					if (!activeSwap) {
						return;
					}

					const currentOffers = activeSwap.offers;

					// @ts-ignore
					set((draft) => {
						draft.liveTokens[tokenId].activeSwap!.offers = [
							offer,
							...currentOffers.filter((o) => o.account !== offer.account),
						];
						draft.liveTokens[tokenId].activeSwap!.endingEpoch = offer.agencyEpoch;
						draft.liveTokens[tokenId].activeSwap!.eth = offer.eth;
						draft.liveTokens[tokenId].activeSwap!.leader =
							offer.account as AddressString;
					});

					return;
				}

				const activeSwap = get().liveTokens[tokenId]?.activeSwap;

				if (!activeSwap) {
					const theswap = get().liveTokens[tokenId]?.swaps.find(
						(x) => x.owner === offer.sellingTokenId,
					);
					if (theswap) {
						const filteredSwaps = get().liveTokens[tokenId].swaps.filter(
							(x) => x.owner !== offer.sellingTokenId,
						);

						// @ts-ignore
						set((draft) => {
							draft.liveTokens[tokenId].activeSwap = theswap;
							draft.liveTokens[tokenId].activeSwap!.offers = [
								offer,
								...theswap.offers,
							];
							draft.liveTokens[tokenId].activeSwap!.endingEpoch = offer.agencyEpoch;
							draft.liveTokens[tokenId].activeSwap!.eth = offer.eth;
							draft.liveTokens[tokenId].activeSwap!.leader = offer.account as NuggId;
							draft.liveTokens[tokenId].swaps = filteredSwaps;
						});

						return;
					}
				}

				if (activeSwap && activeSwap.endingEpoch === offer.agencyEpoch) {
					const currentOffers = activeSwap.offers;

					// const currentUserOffer = currentOffers.find((o) => o.account === offer.account);

					// @ts-ignore
					set((draft) => {
						draft.liveTokens[tokenId].activeSwap!.offers = [
							offer,
							...currentOffers.filter((o) => o.account !== offer.account),
						];
						draft.liveTokens[tokenId].activeSwap!.endingEpoch = offer.agencyEpoch;
						draft.liveTokens[tokenId].activeSwap!.eth = offer.eth;
						draft.liveTokens[tokenId].activeSwap!.leader = offer.account as NuggId;
					});
				}
			}

			function updateToken(tokenId: TokenId, data: LiveToken): void {
				const curr = get().liveTokens[tokenId];

				if (!curr) {
					// @ts-ignore
					set((draft) => {
						// @ts-ignore
						draft.liveTokens[tokenId] = data;
					});
					return;
				}

				if (JSON.stringify(data) !== JSON.stringify(curr)) {
					const newOffers = data.activeSwap?.offers;

					const curroffers = curr.activeSwap?.offers;

					if (newOffers && curroffers) {
						if (newOffers.length < curroffers.length) {
							data.activeSwap!.offers = curroffers;
						}
					}

					// @ts-ignore
					set((draft) => {
						// @ts-ignore
						draft.liveTokens[tokenId] = data;
					});
				}
			}

			return {
				updateToken,
				updateOffers,
			};
		},
		// ),
	),
);

export default {
	useUpdateOffers: () => useStore((draft) => draft.updateOffers),
	useUpdateToken: () => useStore((draft) => draft.updateToken),
	useOffers: <A extends TokenId>(tokenId: A | undefined) =>
		useStore(
			React.useCallback(
				(state) => (tokenId ? state.liveTokens[tokenId]?.activeSwap?.offers ?? [] : []),
				[tokenId],
			),
		),
	useToken: <A extends TokenId>(tokenId: A | undefined) =>
		useStore(
			React.useCallback(
				(state) => (tokenId ? state.liveTokens[tokenId] : undefined),
				[tokenId],
			),
		),
};
