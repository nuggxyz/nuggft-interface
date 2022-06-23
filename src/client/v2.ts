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

import { OfferData } from './interfaces';
import health from './health';
import stake from './stake';
import block from './block';

interface SwapDataBase extends TokenIdFactoryBase {
    leader: unknown;
    swapId: number | null;
    top: BigNumber;
    commitBlock: number;
    tokenId: TokenId;
    updatedAtBlock: number;
    endingEpoch: number;
    numOffers: number;
    owner: unknown;
    updatedAtIndex: number | null;
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
    block: number,
): TokenId[] => {
    const res: SwapData[] = [];
    input.itemSwaps.forEach((a) => {
        const splt = a.id.split('-');
        const tokenId = Number(splt[0]).toItemId();
        if (hits[tokenId]) {
            if (hits[tokenId].updatedAtBlock > block) {
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
            updatedAtBlock: block,
            endingEpoch: Number(input.id),
            numOffers: a.numOffers,
            owner: a.owner!.id.toNuggId(),
            updatedAtIndex: null,
        });
        res.push(val);
        hits[tokenId] = val;
    });

    input.swaps.forEach((a) => {
        const splt = a.id.split('-');
        const tokenId = Number(splt[0]).toNuggId();
        if (hits[tokenId]) {
            if (hits[tokenId].updatedAtBlock > block) {
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
            updatedAtBlock: block,
            updatedAtIndex: null,
            endingEpoch: Number(input.id),
            numOffers: a.numOffers,
            owner: a.owner!.id as AddressString,
        });
        res.push(val);
        hits[tokenId] = val;
    });

    return res.sort((a, b) => (a.top.lt(b.top) ? -1 : 1)).map((a) => a.tokenId);
};

const useStore = create(
    combine(
        {
            v2: {
                hits: {} as TokenIdDictionary<SwapData>,
                current: [] as TokenId[],
                next: [] as TokenId[],
                all: [] as TokenId[],
            },
        },
        (set, get) => {
            function handleV2(
                input: QueryResult<
                    GetV2ActiveQuery,
                    Exact<{
                        [key: string]: never;
                    }>
                >,
                block: number,
            ) {
                const dat = input.data?.protocol;
                const { hits } = get().v2;
                if (dat) {
                    const current = formatter(dat.epoch, hits, block);
                    const next = formatter(dat.nextEpoch, hits, block);
                    set(() => ({
                        v2: {
                            current,
                            next,
                            all: [...current, ...next],
                            hits,
                        },
                    }));
                }
            }

            function handleRpcHit(data: OfferData, log: Log) {
                // @ts-ignore
                set((draft) => {
                    const nower = draft.v2.hits[data.tokenId];
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

                        draft.v2.hits[data.tokenId] = buildTokenIdFactory({
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
                        });
                    } else {
                        if (nower) {
                            if (nower.isItem()) return;
                        }
                        draft.v2.hits[data.tokenId] = buildTokenIdFactory({
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
                        });
                    }
                });
            }

            return { handleV2, handleRpcHit };
        },
    ),
);

const useV2Query = () => {
    const handleV2 = useStore((dat) => dat.handleV2);

    const updateStake = stake.useHandleActiveV2();

    const [lazy] = useGetV2ActiveLazyQuery();

    const graph = React.useCallback(
        async (graphBlock: number) => {
            const res = await lazy({ fetchPolicy: 'no-cache' });
            handleV2(res, graphBlock);
            updateStake(res);
        },
        [lazy, handleV2, updateStake],
    );

    return [graph];
};

export const usePollV2 = () => {
    const handleRpcHit = useStore((dat) => dat.handleRpcHit);
    const liveHealth = health.useHealth();

    const [graph] = useV2Query();

    emitter.useOn(
        emitter.events.Offer,
        (arg) => {
            handleRpcHit(arg.data, arg.log);
        },
        [handleRpcHit],
    );

    const graphBlock = health.useLastGraphBlock();

    React.useEffect(() => {
        if (!liveHealth.graphProblem) {
            void graph(graphBlock);
        }
    }, [liveHealth.graphProblem, graphBlock, graph]);

    const blocknum = block.useBlock();
    React.useEffect(() => {
        if (liveHealth.graphProblem) {
            void rpc(_tokenId);
        }
    }, [liveHealth.graphProblem, blocknum]);
};

export default {
    useStore,
    usePollV2,

    useSwap: <A extends TokenId>(tokenId: A | undefined) => {
        return useStore(
            React.useCallback(
                (state) => (tokenId !== undefined ? state.v2.hits[tokenId] : undefined),
                [tokenId],
            ),
            shallow,
        );
    },

    useSwapList: () =>
        useStore((s) => {
            return s.v2.all;
        }),

    useCoreSwapLists: () =>
        useStore((s) => {
            return {
                next: s.v2.next,
                current: s.v2.current,
            };
        }),
};
