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
import { useNuggftV1 } from '@src/contracts/useContract';
import lib from '@src/lib/index';

import { OfferData } from './interfaces';
import health from './health';
import stake from './stake';
import block from './block';
import v3 from './v3';

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
        });
        res.push(val);
        hits[tokenId] = val;
    });

    return res.sort((a, b) => (a.top.lt(b.top) ? -1 : 1)).map((a) => a.tokenId);
};

const rpcFormatter = (input: string, hits: TokenIdDictionary<SwapData>, blk: number) => {
    const res: SwapData[] = [];
    const v: SwapData[] = [];

    const chunked = lib.parse.chunkString(input, 74);

    const epoch = web3.config.calculateEpochId(blk);
    console.log(chunked);
    if (!chunked) return [];

    for (let index = 0; index < chunked.length; index++) {
        const chunk = chunked[index];

        const strAgency = chunk.slice(0, 64);

        const agency = lib.parse.agency(`0x${strAgency}`);

        const itemId = Number(`0x${strAgency.slice(64, 4)}`).toItemId();
        const nuggId = Number(`0x${strAgency.slice(68)}`).toNuggId();

        if (itemId.toRawIdNum() === 0) {
            // we got outselves a nugg

            const val = buildTokenIdFactory({
                leader: agency.address,
                swapId: Number(0),
                top: agency.eth.bignumber,
                commitBlock: web3.config.calculateEndBlock(epoch - 2) + 1,
                tokenId: nuggId,
                updatedAtBlock: blk,
                updatedAtIndex: null,
                endingEpoch: epoch,
                numOffers: null,
                owner: null,
            });

            if (agency.epoch === 0) v.push(val);
            else {
                res.push(val);
                hits[nuggId] = val;
            }
        } else {
            const val = buildTokenIdFactory({
                leader: agency.addressAsBigNumber.toNumber().toNuggId(),
                swapId: Number(0),
                top: agency.eth.bignumber,
                commitBlock: web3.config.calculateEndBlock(epoch - 2) + 1,
                tokenId: itemId,
                updatedAtBlock: blk,
                updatedAtIndex: null,
                endingEpoch: epoch,
                numOffers: null,
                owner: nuggId,
            });
            if (agency.epoch === 0) v.push(val);
            else {
                res.push(val);
                hits[itemId] = val;
            }
        }
    }

    const rec = res.sort((a, b) => (a.top.lt(b.top) ? -1 : 1));

    const curr = rec.filter((a) => a.endingEpoch === epoch).map((x) => x.tokenId);
    const next = rec.filter((a) => a.endingEpoch === epoch + 1).map((x) => x.tokenId);

    return [curr, next, v] as const;
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
                blk: number,
            ) {
                const dat = input.data?.protocol;
                const { hits } = get().v2;
                if (dat) {
                    const current = formatter(dat.epoch, hits, blk);
                    const next = formatter(dat.nextEpoch, hits, blk);

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

            function handleV2Rpc(input: string, blk: number) {
                const { hits } = get().v2;
                const [current, next, v] = rpcFormatter(input, hits, blk);

                console.log('v2rpc', current, next, v);

                set(() => ({
                    v2: {
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

            return { handleV2, handleRpcHit, handleV2Rpc };
        },
    ),
);

const useV2Query = () => {
    const handleV2 = useStore((dat) => dat.handleV2);
    const handleV2Rpc = useStore((dat) => dat.handleV2Rpc);
    const handleV3Rpc = v3.useHandleV3Rpc();
    const updateStake = stake.useHandleActiveV2();

    const [lazy] = useGetV2ActiveLazyQuery();

    const provider = web3.hook.usePriorityProvider();

    const nuggft = useNuggftV1(provider);

    const graph = React.useCallback(
        async (graphBlock: number) => {
            const res = await lazy({ fetchPolicy: 'no-cache' });
            handleV2(res, graphBlock);
            updateStake(res);
        },
        [lazy, handleV2, updateStake],
    );

    const rpc = React.useCallback(
        async (blk: number) => {
            const res = await nuggft.loop();

            handleV3Rpc(handleV2Rpc(res, blk));
        },
        [nuggft, handleV2Rpc, handleV3Rpc],
    );

    return [graph, rpc] as const;
};

export const usePollV2 = () => {
    const handleRpcHit = useStore((dat) => dat.handleRpcHit);
    const liveHealth = health.useHealth();

    const [graph, rpc] = useV2Query();

    emitter.useOn(
        emitter.events.Offer,
        (arg) => {
            handleRpcHit(arg.data, arg.log);
        },
        [handleRpcHit],
    );

    const graphBlock = health.useLastGraphBlock();

    React.useEffect(() => {
        // if (!liveHealth.graphProblem) {
        //     void graph(graphBlock);
        // }
    }, [liveHealth.graphProblem, graphBlock, graph]);

    const blocknum = block.useBlock();
    React.useEffect(() => {
        // if (true) {
        void rpc(blocknum);
        // }
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
