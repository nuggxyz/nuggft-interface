/* eslint-disable no-param-reassign */
import create from 'zustand';
import { combine } from 'zustand/middleware';
import React from 'react';
import { QueryResult } from '@apollo/client';
import { BigNumber } from '@ethersproject/bignumber';
import shallow from 'zustand/shallow';
import { debounce, groupBy } from 'lodash';

import { GetV2PotentialQuery, useGetV2PotentialLazyQuery } from '@src/gql/types.generated';
import { buildTokenIdFactory } from '@src/prototypes';
import { MIN_SALE_PRICE } from '@src/web3/constants';

import health from './health';
import { LiveToken } from './interfaces';

interface PotentialDataBase extends TokenIdFactoryBase {
	tokenId: TokenId;
	owner: AddressString | NuggId | null;
	isPotential: true;
	isV2?: never;
}

interface PotentialDataBase__Nugg {
	owner: AddressString;
	min: { eth: BigNumber; useMsp: boolean };
}

export interface PotentialDataBase__ItemPreTryout {
	owner: NuggId;
	top: BigNumber;
	swapId: number;
}

interface PotentialDataBase__Item {
	owner: null;
	count: number;
	min: { nugg: NuggId; eth: BigNumber; useMsp: boolean } | null;
	max: { nugg: NuggId; eth: BigNumber; useMsp: boolean } | null;
	swaps: { nugg: NuggId; eth: BigNumber; useMsp: boolean }[];
}

export type PotentialData = TokenIdFactoryCreator<
	PotentialDataBase,
	PotentialDataBase__Nugg,
	PotentialDataBase__Item
>;

export const v3FormatLiveToken = <
	A extends TokenId,
	T extends SmartPickFromTokenId<A, LiveToken>,
	Z extends SmartPickFromTokenId<A, PotentialData>,
>(
	token: T,
): Z | undefined => {
	if (token.tokenId.isItemId() && token.isItem()) {
		const tryouts: PotentialDataBase__ItemPreTryout[] = [];

		token.swaps.forEach((b) => {
			const val = buildTokenIdFactory({
				owner: b.owner,
				swapId: Number(token.activeSwap?.num),
				top: b.eth.eq(0) ? MIN_SALE_PRICE : BigNumber.from(b.eth),
				tokenId: token.tokenId,
				isPotential: true as const,
			});

			tryouts.push(val);
		});

		const res = formatTryout(token.tokenId, tryouts);

		// @ts-ignore
		return res;
	}

	if (token.activeSwap?.isNugg() && token.isNugg()) {
		const val: IsolateNuggIdFactory<PotentialData> = buildTokenIdFactory({
			owner: token.activeSwap?.owner,
			swapId: Number(token.activeSwap.num),
			min: {
				eth: token.activeSwap.eth,
				useMsp: !token.activeSwap.eth || token.activeSwap.eth.eq(0),
			},
			tokenId: token.tokenId,
			isPotential: true as const,
		});

		// @ts-ignore
		return val;
	}

	return undefined;
};

export const formatTryout = (tokenId: ItemId, input: PotentialDataBase__ItemPreTryout[]) => {
	const res = input.reduce(
		(
			prev: {
				count: number;
				min: { nugg: NuggId; eth: BigNumber; useMsp: boolean } | null;
				max: { nugg: NuggId; eth: BigNumber; useMsp: boolean } | null;
				swaps: { nugg: NuggId; eth: BigNumber; useMsp: boolean }[];
			},
			curr,
		) => {
			const swap = {
				nugg: curr.owner as NuggId,
				eth: curr.top,
				useMsp: false,
			};

			if (!prev) {
				return {
					min: swap,
					max: swap,
					count: 1,
					swaps: [swap],
				};
			}

			return {
				min: !prev.min || prev.min.eth.gt(curr.top) ? swap : prev.min,
				max: !prev.max || prev.max.eth.lt(curr.top) ? swap : prev.max,
				count: prev.count + 1,
				swaps: [swap, ...prev.swaps].sort((a, b) => (a.eth.gt(b.eth) ? 1 : -1)),
			};
		},
		{ count: 0, min: null, max: null, swaps: [] },
	);
	return buildTokenIdFactory({
		tokenId,
		owner: null,
		...res,
		isPotential: true as const,
	});
};

const formatter = (
	input: Remap<QueryResult<GetV2PotentialQuery, unknown>['data']>,
	hits: TokenIdDictionary<PotentialData>,
	// block: number,
): [TokenId[]] => {
	const res: PotentialData[] = [];
	input?.items.forEach((a) => {
		const splt = a.id.split('-');
		const tokenId = Number(splt[0]).toItemId();

		const tryouts: PotentialDataBase__ItemPreTryout[] = [];
		a?.swaps.forEach((b) => {
			const val = buildTokenIdFactory({
				owner: b.owner!.id.toNuggId(),
				swapId: Number(splt[1]),
				top: b.top === '0' ? MIN_SALE_PRICE : BigNumber.from(b.top),
				tokenId,
				isPotential: true as const,
			});

			tryouts.push(val);
		});
		const val = formatTryout(a.id.toItemId(), tryouts);
		if (val.count > 0) {
			res.push(val);
			hits[tokenId] = val;
		}
	});

	input?.nuggs.forEach((a) => {
		const splt = a.id.split('-');
		const tokenId = Number(splt[0]).toNuggId();

		const val = buildTokenIdFactory({
			owner: a.activeSwap?.owner!.id as AddressString,
			swapId: Number(splt[1]),
			min: {
				eth: BigNumber.from(a.activeSwap?.top),
				useMsp: !a.activeSwap?.top || a.activeSwap.top === '0',
			},
			tokenId,
			isPotential: true as const,
		});

		res.push(val);
		hits[tokenId] = val;
	});

	return [res.sort((a, b) => (a?.min?.eth.lt(b?.min?.eth || 0) ? -1 : 1)).map((a) => a.tokenId)];
};

export type V3RpcInput = { owner: AddressString | NuggId; top: string; tokenId: TokenId };

const rpcFormatter = (
	input: V3RpcInput[],
	hits: TokenIdDictionary<PotentialData>,
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	block: number,
): TokenId[][] => {
	const res: PotentialData[] = [];

	const items = Object.entries(groupBy(input, 'tokenId'));

	for (let index = 0; index < items.length; index++) {
		const [tokenId, a] = items[index];
		if (tokenId.isItemId()) {
			const tryouts: PotentialDataBase__ItemPreTryout[] = [];
			a.forEach((b) => {
				const val = buildTokenIdFactory({
					owner: b.owner as NuggId,
					swapId: Number(1),
					top: b.top === '0' ? MIN_SALE_PRICE : BigNumber.from(b.top),
					tokenId,
				});

				tryouts.push(val);
			});
			const val = formatTryout(tokenId, tryouts);
			if (val.count > 0) {
				res.push(val);
				hits[tokenId] = val;
			}
		} else if (tokenId.isNuggId()) {
			const val = buildTokenIdFactory({
				owner: a[0].owner as AddressString,
				swapId: Number(0),
				min: {
					eth: BigNumber.from(a[0]?.top),
					useMsp: !a[0]?.top || a[0].top === '0',
				},
				tokenId,
				isPotential: true as const,
			});

			res.push(val);
			hits[tokenId] = val;
		}
	}

	const output = [
		res.sort((a, b) => (a?.min?.eth.gt(b?.min?.eth || 0) ? -1 : 1)).map((a) => a.tokenId),
	];

	return output;
};

const useStore = create(
	combine(
		{
			main: {
				hits: {} as TokenIdDictionary<PotentialData>,
				all: [] as TokenId[],
				nextAmount: 0,
			},
			backup: {
				hits: {} as TokenIdDictionary<PotentialData>,
				all: [] as TokenId[],
			},
			point: 'main' as 'main' | 'backup',
		},
		(set, get) => {
			const pointAt = (point: 'main' | 'backup') => {
				if (point === 'main') return;
				set(() => ({
					point,
				}));
			};
			function handleV3(input: QueryResult<GetV2PotentialQuery, any>, nextAmounter: number) {
				const dat = input.data;
				const { hits, all, nextAmount } = get().main;

				if (dat && nextAmount !== nextAmounter) {
					const [all2] = formatter(dat, hits);
					all2.shuffle();
					set(() => ({
						main: {
							all: [...all, ...all2],
							hits,
							nextAmount: nextAmounter,
						},
					}));
				}
			}

			// const handleLiveToken = (dat: LiveToken) => {
			// 	if (dat) {
			// 		const all2 = formatLiveToken(dat);

			// 		if (all2) {
			// 			const { all, hits } = get().main;

			// 			all.push(all2.tokenId);

			// 			// @ts-ignore
			// 			hits[all2.tokenId] = all2;

			// 			set(() => ({
			// 				main: {
			// 					all,
			// 					hits,
			// 					nextAmount: all.length,
			// 				},
			// 			}));
			// 		}
			// 	}
			// };

			function handleV3Rpc(input: V3RpcInput[], block: number) {
				const { hits } = get().backup;

				const [all2] = rpcFormatter(input, hits, block);
				set(() => ({
					backup: {
						all: [...all2],
						hits,
						nextAmount: all2.length,
					},
				}));
			}

			return { handleV3, handleV3Rpc, pointAt };
		},
	),
);

export const useV3Updater = () => {
	const pointAt = useStore((dat) => dat.pointAt);
	const graphProblem = health.useHealth();

	React.useEffect(() => {
		pointAt(graphProblem ? 'backup' : 'main');
	}, [graphProblem, pointAt]);
};

export const usePollV3 = () => {
	const handleV3 = useStore((dat) => dat.handleV3);

	const len = useStore((dat) => dat.main.nextAmount);

	const [lazy] = useGetV2PotentialLazyQuery();

	const callback = React.useCallback(() => {
		const amt = len;
		void lazy({ variables: { skip: amt } }).then((x) => handleV3(x, amt + 100));
	}, [lazy, handleV3, len]);

	const debounced = React.useMemo(() => debounce(callback, 300), [callback]);

	return debounced;
};

export default {
	useStore,
	usePollV3,
	useHandleV3Rpc: () => useStore((dat) => dat.handleV3Rpc),
	useSwap: <A extends TokenId>(tokenId: A | undefined) => {
		return useStore(
			React.useCallback(
				(state) => (tokenId !== undefined ? state[state.point].hits[tokenId] : undefined),
				[tokenId],
			),
			shallow,
		);
	},
	useSwapList: () => {
		return useStore((s) => {
			return s[s.point].all;
		});
	},
};
