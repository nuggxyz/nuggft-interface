/* eslint-disable no-param-reassign */
import create from 'zustand';
import { combine } from 'zustand/middleware';
import React from 'react';
import { QueryResult } from '@apollo/client';
import { BigNumber } from '@ethersproject/bignumber';
import shallow from 'zustand/shallow';
import { Log } from '@ethersproject/abstract-provider';

import {
	GetV2ActiveQuery,
	useGetV2ActiveLazyQuery,
	V2EpochFragment,
} from '@src/gql/types.generated';
import { buildTokenIdFactory } from '@src/prototypes';
import emitter from '@src/emitter';
import web3 from '@src/web3';
import { useNuggftV1, useXNuggftV1 } from '@src/contracts/useContract';
import lib from '@src/lib/index';
import useThrottle from '@src/hooks/useThrottle';
import usePrevious from '@src/hooks/usePrevious';

import { OfferData } from './interfaces';
import health from './health';
import stake from './stake';
import block from './block';
import v3, { V3RpcInput } from './v3';
import epoch from './epoch';

interface SwapDataBase extends TokenIdFactoryBase {
	leader: unknown;
	swapId: number | null;
	top: BigNumber;
	commitBlock: number;
	tokenId: TokenId;
	updatedAtBlock: number;
	endingEpoch: number;
	numOffers: number | null;
	owner: unknown;
	updatedAtIndex: number | null;
	isPotential?: never;
	isV2: true;
	leaderTxHash?: Hash;
}

interface SwapDataBase__Nugg {
	leader: AddressString;
	owner: AddressString | null;
}

interface SwapDataBase__Item {
	leader: NuggId;
	owner: NuggId;
}

export type SwapData = TokenIdFactoryCreator<SwapDataBase, SwapDataBase__Nugg, SwapDataBase__Item>;

const formatter = (
	input: V2EpochFragment,
	hits: TokenIdDictionary<SwapData>,
	blk: number,
): TokenId[] => {
	const res: SwapData[] = [];
	input.itemSwaps.forEach((a) => {
		const splt = a.id.split('-');
		const tokenId = Number(splt[0]).toItemId();
		if (hits[tokenId]) {
			if (hits[tokenId].updatedAtBlock > blk) {
				res.push(hits[tokenId]);

				return;
			}
		}
		const val = buildTokenIdFactory({
			leader: a.leader!.id.toNuggId(),
			swapId: Number(splt[1]),
			top: BigNumber.from(a.top),
			commitBlock: Number(a.commitBlock),
			tokenId,
			updatedAtBlock: blk,
			endingEpoch: Number(input.id),
			numOffers: a.numOffers,
			owner: a.owner!.id.toNuggId(),
			updatedAtIndex: null,
			isV2: true as const,
		});
		res.push(val);
		hits[tokenId] = val;
	});

	input.swaps.forEach((a) => {
		const splt = a.id.split('-');
		const tokenId = Number(splt[0]).toNuggId();
		if (hits[tokenId]) {
			if (hits[tokenId].updatedAtBlock > blk) {
				res.push(hits[tokenId]);
				return;
			}
		}
		const val = buildTokenIdFactory({
			leader: a.leader!.id as AddressString,
			swapId: Number(splt[1]),
			top: BigNumber.from(a.top),
			// nuggs that are about to be mining will have
			commitBlock: Number(a.commitBlock),
			tokenId,
			updatedAtBlock: blk,
			endingEpoch: Number(input.id),
			numOffers: a.numOffers,
			owner: a.owner!.id as AddressString,
			updatedAtIndex: null,
			isV2: true as const,
		});
		res.push(val);
		hits[tokenId] = val;
	});

	return res.sort((a, b) => (a.top.lt(b.top) ? -1 : 1)).map((a) => a.tokenId);
};

const rpcFormatter = (input: string, hits: TokenIdDictionary<SwapData>, blk: number) => {
	const res: SwapData[] = [];
	const v: V3RpcInput[] = [];

	const chunked = lib.parse.sloop(input);

	const _epoch = web3.config.calculateEpochId(blk);

	for (let index = 0; index < chunked.length; index++) {
		const { itemId, nuggId, agency } = chunked[index];

		if (itemId.toRawIdNum() === 0) {
			// we got outselves a nugg

			const val = buildTokenIdFactory({
				leader: agency.address,
				swapId: Number(0),
				top: agency.eth,
				commitBlock: web3.config.calculateEndBlock(agency.epoch - 2) + 1,
				tokenId: nuggId,
				updatedAtBlock: blk,
				updatedAtIndex: null,
				endingEpoch: agency.epoch,
				numOffers: null,
				owner: null,
				isV2: true as const,
			});
			if (agency.epoch === 0) {
				v.push({ owner: agency.address, top: val.top.toString(), tokenId: nuggId });
			} else {
				res.push(val);
				hits[nuggId] = val;
			}
		} else {
			// eslint-disable-next-line no-continue
			if (itemId.toRawIdNum() < 1000) continue;
			const val = buildTokenIdFactory({
				leader: agency.addressAsBigNumber.toNumber().toNuggId(),
				swapId: Number(0),
				top: agency.eth,
				commitBlock: web3.config.calculateEndBlock(agency.epoch - 2) + 1,
				tokenId: itemId,
				updatedAtBlock: blk,
				updatedAtIndex: null,
				endingEpoch: agency.epoch,
				numOffers: null,
				owner: nuggId,
				isV2: true as const,
			});
			if (agency.epoch === 0) {
				v.push({ owner: nuggId, top: val.top.toString(), tokenId: itemId });
			} else {
				res.push(val);
				hits[itemId] = val;
			}
		}
	}

	const rec = res.sort((a, b) => (a.top.lt(b.top) ? -1 : 1));

	const curr = rec.filter((a) => a.endingEpoch === _epoch).map((x) => x.tokenId);
	const next = rec.filter((a) => a.endingEpoch === _epoch + 1).map((x) => x.tokenId);

	return [curr, next, v] as const;
};

const useStore = create(
	combine(
		{
			main: {
				hits: {} as TokenIdDictionary<SwapData>,
				current: [] as TokenId[],
				next: [] as TokenId[],
				all: [] as TokenId[],
			},
			backup: {
				hits: {} as TokenIdDictionary<SwapData>,

				current: [] as TokenId[],
				next: [] as TokenId[],
				all: [] as TokenId[],
			},
			point: 'main' as 'main' | 'backup',
			rpcCalled: false,
		},
		(set, get) => {
			function handleV2(
				input: QueryResult<
					GetV2ActiveQuery,
					Exact<{
						[key: string]: never;
					}>
				>,
				blk: number,
			) {
				const dat = input.data?.protocol;
				const { hits } = get().main;
				if (dat) {
					const current = formatter(dat.epoch, hits, blk);
					const next = formatter(dat.nextEpoch, hits, blk);

					set(() => ({
						main: {
							current,
							next,
							all: [...current, ...next],
							hits,
						},
					}));
				}
			}

			const pointAt = (point: 'main' | 'backup') => {
				if (point === 'main') return;

				set(() => ({
					point,
				}));
			};

			const removeAllSwapsFromAnEpoch = (_epoch: number) => {
				const { point } = get();

				const { hits } = get()[point];

				const checks: TokenId[] = [];
				// eslint-disable-next-line no-restricted-syntax
				for (const key in hits) {
					if (key.isNuggId() || key.isItemId()) {
						if (hits[key].endingEpoch === _epoch) {
							checks.push(hits[key as TokenId].tokenId);
						}
					}
				}

				console.warn(`CLEARING ${checks.length} SWAPS FROM EPOCH:${_epoch} - `);

				// @ts-ignore
				set((draft) => {
					for (let i = 0; i < checks.length; i++) {
						delete draft[point].hits[checks[i]];
					}
					draft[point].current = draft[point].next;
					draft[point].all = draft[point].next;

					draft[point].next = [];
				});
			};

			function handleV2Rpc(input: string, blk: number) {
				if (input.length > 2) {
					set(() => ({
						rpcCalled: true,
					}));
				}
				const { hits } = get().backup;
				const [current, next, v] = rpcFormatter(input, hits, blk);

				set(() => ({
					backup: {
						current,
						next,
						all: [...current, ...next],
						hits,
					},
				}));

				return v;
			}

			function handleRpcHit(data: OfferData, log: Log) {
				// @ts-ignore
				set((draft) => {
					const nower = draft.main.hits[data.tokenId];
					if (nower) {
						if (nower.updatedAtBlock > log.blockNumber) {
							return;
						}
						if (nower.updatedAtBlock === log.blockNumber) {
							if (
								nower.updatedAtIndex === null ||
								nower.updatedAtIndex > log.transactionIndex
							) {
								return;
							}
						}
					}

					if (data.isItem()) {
						if (nower) {
							if (nower.isNugg()) return;
							if (data.sellingTokenId !== nower.owner) {
								return;
							}
						}

						const hola = buildTokenIdFactory({
							leader: data.account,
							swapId: nower?.swapId || null,
							top: data.eth,
							commitBlock: nower?.commitBlock ?? log.blockNumber,
							tokenId: data.tokenId,
							updatedAtBlock: log.blockNumber,
							updatedAtIndex: log.transactionIndex,
							endingEpoch:
								nower?.endingEpoch ??
								web3.config.calculateEpochId(log.blockNumber) + 1,
							numOffers: (nower?.numOffers ?? 0) + 1,
							owner: data.sellingTokenId,
							isV2: true as const,
							leaderTxHash: log.transactionHash as Hash,
						});
						draft.backup.hits[data.tokenId] = hola;
						draft.main.hits[data.tokenId] = hola;
					} else {
						if (nower) {
							if (nower.isItem()) return;
						}
						const hola = buildTokenIdFactory({
							leader: data.account,
							swapId: nower?.swapId || null,
							top: data.eth,
							commitBlock: nower?.commitBlock ?? log.blockNumber,
							tokenId: data.tokenId,
							updatedAtBlock: log.blockNumber,
							updatedAtIndex: log.transactionIndex,
							endingEpoch:
								nower?.endingEpoch ??
								web3.config.calculateEpochId(log.blockNumber) + 1,
							numOffers: (nower?.numOffers ?? 0) + 1,
							owner: nower?.owner ?? null,
							isV2: true as const,
							leaderTxHash: log.transactionHash as Hash,
						});
						draft.backup.hits[data.tokenId] = hola;
						draft.main.hits[data.tokenId] = hola;
					}
				});
			}

			return { handleV2, handleRpcHit, handleV2Rpc, pointAt, removeAllSwapsFromAnEpoch };
		},
	),
);

const useV2Query = () => {
	const handleV2 = useStore((dat) => dat.handleV2);
	const handleV2Rpc = useStore((dat) => dat.handleV2Rpc);
	const handleV3Rpc = v3.useHandleV3Rpc();
	const updateStake = stake.useUpdate();
	const updateStakeBackup = stake.useUpdateBackup();

	const [lazy] = useGetV2ActiveLazyQuery();

	const provider = web3.hook.usePriorityProvider();

	const xnuggft = useXNuggftV1(provider);
	const nuggft = useNuggftV1(provider);

	const graph = React.useCallback(
		async (graphBlock: number, rpcBlock: number) => {
			const res = await lazy({ fetchPolicy: 'no-cache' });

			if (res.error) {
				await rpc(rpcBlock);
				return;
			}

			if (res.data?.protocol) {
				const { nuggftStakedShares, nuggftStakedEth, featureTotals, totalNuggs } =
					res.data.protocol;

				updateStake(
					BigNumber.from(nuggftStakedShares),
					BigNumber.from(nuggftStakedEth),
					Number(totalNuggs),
					featureTotals as unknown as FixedLengthArray<number, 8>,
				);
			}
			handleV2(res, graphBlock);
		},
		[lazy, handleV2, updateStake],
	);

	const rpc = React.useCallback(
		async (blk: number) => {
			if (provider) {
				const res = await xnuggft.sloop();
				handleV3Rpc(handleV2Rpc(res, blk), blk);
				void updateStakeBackup(nuggft);
			}
		},
		[xnuggft, nuggft, handleV2Rpc, handleV3Rpc, provider],
	);
	const rpcSmallThrottle = useThrottle(rpc, 50000);

	const rpcBigThrottle = useThrottle(rpcSmallThrottle, 60000 * 5);

	return [graph, rpcSmallThrottle, rpcBigThrottle] as const;
};

export const usePollV2 = () => {
	const handleRpcHit = useStore((dat) => dat.handleRpcHit);
	const pointAt = useStore((dat) => dat.pointAt);
	const _epoch = epoch.active.useId();
	const removeAllSwapsFromAnEpoch = useStore((dat) => dat.removeAllSwapsFromAnEpoch);

	const graphProblem = health.useHealth();
	const startblock = epoch.active.useStartBlock();
	const [graph, rpc, throttledRpc] = useV2Query();
	const provider = web3.hook.usePriorityProvider();
	const blocknum = block.useBlock();

	emitter.useOn(
		emitter.events.Offer,
		(arg) => {
			handleRpcHit(arg.data, arg.log);
		},
		[handleRpcHit],
	);

	const graphBlock = health.useLastGraphBlock();
	const prevEpoch = usePrevious(_epoch);

	React.useEffect(() => {
		if (_epoch && prevEpoch !== undefined && prevEpoch !== _epoch)
			removeAllSwapsFromAnEpoch(_epoch);
	}, [_epoch, removeAllSwapsFromAnEpoch, prevEpoch]);

	React.useEffect(() => {
		if (!graphProblem) {
			void graph(graphBlock, blocknum);
		}
	}, [graphProblem, graphBlock, graph, blocknum]);

	React.useEffect(() => {
		if (graphProblem) {
			void throttledRpc(blocknum);
		}
	}, [graphProblem, blocknum, throttledRpc]);

	React.useEffect(() => {
		if (graphProblem && startblock) {
			void rpc(startblock);
		}
	}, [startblock, graphProblem, rpc, provider]);

	React.useEffect(() => {
		pointAt(graphProblem ? 'backup' : 'main');
	}, [graphProblem, pointAt]);

	return null;
};

export default {
	useStore,
	usePollV2,
	useV2Query,
	useSwap: <A extends TokenId>(tokenId: A | undefined) => {
		return useStore(
			React.useCallback(
				(state) => (tokenId !== undefined ? state[state.point].hits[tokenId] : undefined),
				[tokenId],
			),
			shallow,
		);
	},

	useSwapList: () =>
		useStore((s) => {
			return s[s.point].all;
		}),

	useCoreSwapLists: () =>
		useStore((s) => {
			return {
				next: s[s.point].next,
				current: s[s.point].current,
			};
		}),
};
