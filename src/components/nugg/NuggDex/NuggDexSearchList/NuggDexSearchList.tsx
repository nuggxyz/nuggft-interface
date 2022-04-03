import React, {
    FunctionComponent,
    SetStateAction,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { animated, useSpring } from '@react-spring/web';

import constants from '@src/lib/constants';
import web3 from '@src/web3';
import client from '@src/client';
import { ListData, SearchView, ListDataTypes } from '@src/client/interfaces';
import {
    GetAllNuggsQueryResult,
    OrderDirection,
    GetAllNuggsDocument,
    GetAllItemsQueryResult,
    GetAllItemsDocument,
} from '@src/gql/types.generated';
import { executeQuery3c } from '@src/graphql/helpers';
import { createItemId } from '@src/lib/index';
import AppState from '@src/state/app';

import NuggList, { NuggListOnScrollEndProps } from './components/NuggList';
import NuggLink from './components/NuggLink';
import styles from './NuggDexSearchList.styles';

type Props = Record<string, never>;

const NuggDexSearchList: FunctionComponent<Props> = () => {
    const epoch__id = client.live.epoch.id();
    const target = client.live.searchFilter.target();
    const sort = client.live.searchFilter.sort();
    const searchValue = client.live.searchFilter.searchValue();
    const viewing = client.live.searchFilter.viewing();
    const chainId = web3.hook.usePriorityChainId();
    const activeNuggs = client.live.activeSwaps();
    const potentialNuggs = client.live.potentialSwaps();

    const updateSearchFilterTarget = client.mutate.updateSearchFilterTarget();
    const updateSearchFilterSort = client.mutate.updateSearchFilterSort();
    const activeItems = client.live.activeItems();
    const potentialItems = client.live.potentialItems();

    const [allNuggs, setAllNuggs] = useState<ListData[]>([]);
    const [allNuggsPreview, setAllNuggsPreview] = useState<ListData[]>([]);
    const [allItems, setAllItems] = useState<ListData[]>([]);
    const [allItemsPreview, setAllItemsPreview] = useState<ListData[]>([]);
    const recentNuggs = client.live.recentSwaps();
    const recentItems = client.live.recentItems();

    const graph = client.live.graph();

    const [sortAsc, setSortAsc] = useState<{ [key in SearchView]: boolean }>({
        Recents: false,
        AllNuggs: false,
        OnSale: false,
        AllItems: false,
        Home: false,
        MyNuggs: false,
    });
    const _sortAsc = useRef(sortAsc);

    useEffect(() => {
        _sortAsc.current = sortAsc;
    });

    useEffect(() => {
        if (viewing) {
            updateSearchFilterTarget(viewing);
            updateSearchFilterSort({
                direction: _sortAsc.current[viewing] ? 'asc' : 'desc',
            });
        }
    }, [viewing, setSortAsc]);

    useEffect(() => {
        if (target) {
            setSortAsc((_sort) => {
                return {
                    ..._sort,
                    ...(target && sort ? { [target]: sort === 'asc' } : {}),
                };
            });
        }
    }, [sort, target]);

    useEffect(() => {
        if (allNuggs.length >= constants.NUGGDEX_ALLNUGGS_PREVIEW_COUNT) {
            setAllNuggsPreview(allNuggs.first(constants.NUGGDEX_ALLNUGGS_PREVIEW_COUNT));
        }
    }, [allNuggs]);

    useEffect(() => {
        if (allItems.length >= constants.NUGGDEX_ALLNUGGS_PREVIEW_COUNT) {
            setAllItemsPreview(allItems.first(constants.NUGGDEX_ALLNUGGS_PREVIEW_COUNT));
        }
    }, [allItems]);

    const liveActiveNuggs = useMemo(
        () =>
            [...activeNuggs, ...potentialNuggs].reduce((acc: ListData[], nugg) => {
                let tmp = acc;
                if (epoch__id && +nugg.id <= +epoch__id) {
                    if (searchValue === '' || searchValue === nugg.id) {
                        if (sortAsc[SearchView.OnSale]) {
                            tmp = [...acc, nugg];
                        } else {
                            tmp = [nugg, ...acc];
                        }
                    }
                }
                return tmp;
            }, []),
        [epoch__id, activeNuggs, searchValue, potentialNuggs, sortAsc],
    );

    const liveActiveItems = useMemo(
        () =>
            [...activeItems, ...potentialItems].reduce((acc: ListData[], item) => {
                let tmp = acc;
                // if (searchValue && searchValue === item.id) {
                if (sortAsc[SearchView.OnSale]) {
                    tmp = [...acc, item];
                } else {
                    tmp = [item, ...acc];
                }
                // }
                return tmp;
            }, []),
        [searchValue, sortAsc, potentialItems, activeItems],
    );

    const liveActiveEverything = useMemo(() => {
        return [...liveActiveNuggs, ...liveActiveItems];
    }, [liveActiveNuggs, liveActiveItems]);

    const recentEverything = useMemo(() => {
        return [...recentNuggs, ...recentItems];
    }, [recentNuggs, recentItems]);

    const animatedStyle = useSpring({
        ...styles.nuggLinksContainer,
        transform: viewing !== SearchView.Home ? 'scale(0.9)' : 'scale(1)',
        delay: constants.ANIMATION_DELAY,
    });

    const handleGetAll = useCallback(
        async (
            setResults: React.Dispatch<React.SetStateAction<ListData[]>>,
            startFrom: number,
            // eslint-disable-next-line  @typescript-eslint/default-param-last
            // eslint-disable-next-line @typescript-eslint/no-inferrable-types
            addToResult: boolean = false,
            _sort: 'asc' | 'desc' = 'asc',
            _searchValue?: string,
            setLoading?: React.Dispatch<SetStateAction<boolean>>,
            desiredSize?: number,
        ) => {
            if (chainId && graph) {
                if (setLoading) setLoading(true);

                const result = await executeQuery3c<GetAllNuggsQueryResult>(
                    graph,
                    GetAllNuggsDocument,
                    {
                        orderDirection:
                            !_sort || _sort === 'asc' ? OrderDirection.Asc : OrderDirection.Desc,
                        where: {
                            ...(_searchValue && _searchValue !== '' ? { id: _searchValue } : {}),
                        },
                        first: desiredSize || 25,
                        skip: startFrom,
                        orderBy: 'idnum',
                    },
                );

                if (result && setLoading) setLoading(false);
                if (result) {
                    const update = result.nuggs.map((x) => ({
                        id: x.id,
                        listDataType: ListDataTypes.Basic as const,
                    }));
                    setResults((res) => {
                        if (addToResult) res = [...res, ...update];
                        else res = update;
                        return res;
                    });
                }
            }
        },
        [chainId, graph],
    );

    const handleGetAllItems = useCallback(
        async (
            setResults: React.Dispatch<React.SetStateAction<ListData[]>>,
            startFrom: number,
            // eslint-disable-next-line  @typescript-eslint/default-param-last
            // eslint-disable-next-line @typescript-eslint/no-inferrable-types
            addToResult: boolean = false,
            _sort?: 'asc' | 'desc',
            _searchValue?: string,
            setLoading?: React.Dispatch<SetStateAction<boolean>>,
            desiredSize?: number,
        ) => {
            if (chainId && graph) {
                if (setLoading) setLoading(true);

                const result = await executeQuery3c<GetAllItemsQueryResult>(
                    graph,
                    GetAllItemsDocument,
                    {
                        orderDirection:
                            !_sort || _sort === 'asc' ? OrderDirection.Desc : OrderDirection.Asc,
                        where: {
                            ...(_searchValue && _searchValue !== '' ? { id: _searchValue } : {}),
                        },
                        first: desiredSize || 25,
                        skip: startFrom,
                        orderBy: 'idnum',
                    },
                );

                if (result && setLoading) setLoading(false);
                if (result) {
                    const update = result.items.map((x) => ({
                        id: createItemId(x.id),
                        listDataType: ListDataTypes.Basic as const,
                    }));
                    setResults((res) => {
                        if (addToResult) return [...res, ...update];
                        return [...update];
                    });
                }
            }
        },
        [chainId, graph],
    );
    const screenType = AppState.select.screenType();

    return (
        <div
            style={{
                ...styles.searchListContainer,
                ...(screenType === 'phone' && { width: '100%' }),
            }}
        >
            <animated.div style={animatedStyle}>
                <NuggLink
                    type={SearchView.Recents}
                    previewNuggs={recentEverything}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                    }}
                >
                    <NuggList
                        animationToggle={viewing === SearchView.Recents}
                        style={styles.nuggListEnter}
                        values={recentEverything}
                        type={SearchView.Recents}
                    />
                </NuggLink>
                <NuggLink
                    type={SearchView.OnSale}
                    previewNuggs={liveActiveEverything}
                    style={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                    }}
                >
                    <NuggList
                        animationToggle={viewing === SearchView.OnSale}
                        style={styles.nuggListEnter}
                        values={liveActiveEverything}
                        type={SearchView.OnSale}
                    />
                </NuggLink>

                <NuggLink
                    style={{
                        // width: '100%',
                        position: 'absolute',
                        right: 0,
                        bottom: 0,
                    }}
                    type={SearchView.AllItems}
                    previewNuggs={allItemsPreview}
                    // limit={constants.NUGGDEX_ALLNUGGS_PREVIEW_COUNT}
                >
                    <NuggList
                        animationToggle={viewing === SearchView.AllItems}
                        style={styles.nuggListEnter}
                        values={allItems}
                        type={SearchView.AllItems}
                        onScrollEnd={({
                            setLoading,
                            searchValue: _searchValue,
                            sort: _sort,
                            addToList,
                            desiredSize,
                        }: NuggListOnScrollEndProps) =>
                            handleGetAllItems(
                                setAllItems,
                                addToList ? allItems.length : 0,
                                addToList,
                                _sort,
                                _searchValue,
                                setLoading,
                                desiredSize,
                            )
                        }
                    />
                </NuggLink>
                <NuggLink
                    style={{
                        // width: '100%',
                        position: 'absolute',
                        left: 0,
                        bottom: 0,
                    }}
                    type={SearchView.AllNuggs}
                    previewNuggs={allNuggsPreview}
                    // limit={constants.NUGGDEX_ALLNUGGS_PREVIEW_COUNT}
                >
                    <NuggList
                        animationToggle={viewing === SearchView.AllNuggs}
                        style={styles.nuggListEnter}
                        values={allNuggs}
                        type={SearchView.AllNuggs}
                        onScrollEnd={({
                            setLoading,
                            searchValue: _searchValue,
                            sort: _sort,
                            addToList,
                            desiredSize,
                        }) =>
                            handleGetAll(
                                setAllNuggs,
                                addToList ? allNuggs.length : 0,
                                addToList,
                                _sort,
                                _searchValue,
                                setLoading,
                                desiredSize,
                            )
                        }
                    />
                </NuggLink>
            </animated.div>
        </div>
    );
};

export default React.memo(NuggDexSearchList);
