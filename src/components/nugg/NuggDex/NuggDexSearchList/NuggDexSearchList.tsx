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
import { ListData, SearchView } from '@src/client/interfaces';
import {
    GetAllNuggsQueryResult,
    OrderDirection,
    GetAllNuggsDocument,
} from '@src/gql/types.generated';
import { executeQuery3c } from '@src/graphql/helpers';

import NuggList from './components/NuggList';
import NuggLink from './components/NuggLink';
import styles from './NuggDexSearchList.styles';

type Props = Record<string, never>;

const NuggDexSearchList: FunctionComponent<Props> = () => {
    const epoch__id = client.live.epoch.id();
    const target = client.live.searchFilter.target();
    const sort = client.live.searchFilter.sort();
    const searchValue = client.live.searchFilter.searchValue();
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
    const viewing = client.live.searchFilter.viewing();
    const chainId = web3.hook.usePriorityChainId();
    const _liveActiveNuggs = client.live.activeSwaps();

    const liveActiveNuggs = useMemo(
        () =>
            _liveActiveNuggs.reduce((acc: ListData[], nugg) => {
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
        [epoch__id, _liveActiveNuggs, searchValue, sortAsc],
    );
    const updateSearchFilterTarget = client.mutate.updateSearchFilterTarget();
    const updateSearchFilterSort = client.mutate.updateSearchFilterSort();
    const rawLiveActiveItems = client.live.activeItems();
    const liveActiveItems = useMemo(
        () =>
            rawLiveActiveItems.reduce((acc: ListData[], item) => {
                let tmp = acc;
                // if (searchValue && searchValue === item.id) {
                if (sortAsc[SearchView.AllItems]) {
                    tmp = [...acc, item];
                } else {
                    tmp = [item, ...acc];
                }
                // }
                return tmp;
            }, []),
        [searchValue, sortAsc, rawLiveActiveItems],
    );
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
    const [allNuggs, setAllNuggs] = useState<ListData[]>([]);
    const [allNuggsPreview, setAllNuggsPreview] = useState<ListData[]>([]);
    const recents = client.live.myRecents();

    useEffect(() => {
        if (allNuggs.length >= constants.NUGGDEX_ALLNUGGS_PREVIEW_COUNT) {
            setAllNuggsPreview(allNuggs.first(constants.NUGGDEX_ALLNUGGS_PREVIEW_COUNT));
        }
    }, [allNuggs]);

    const animatedStyle = useSpring({
        ...styles.nuggLinksContainer,
        transform: viewing !== SearchView.Home ? 'scale(0.9)' : 'scale(1)',
        delay: constants.ANIMATION_DELAY,
    });
    const graph = client.live.graph();
    const handleGetAll = useCallback(
        async (
            setResults: React.Dispatch<React.SetStateAction<ListData[]>>,
            startFrom: number,
            // eslint-disable-next-line  @typescript-eslint/default-param-last
            addToResult = false,
            _sort?: 'asc' | 'desc',
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

                console.log(result);
                if (result && setLoading) setLoading(false);
                if (result) {
                    setResults((res) => {
                        if (addToResult) res = [...res, ...result.nuggs];
                        else res = result.nuggs;
                        return res;
                    });
                }
            }
        },
        [chainId, graph],
    );

    return (
        <div style={styles.searchListContainer}>
            <animated.div style={animatedStyle}>
                <NuggLink
                    type={SearchView.Recents}
                    previewNuggs={recents}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                    }}
                >
                    <NuggList
                        animationToggle={viewing === SearchView.Recents}
                        style={styles.nuggListEnter}
                        values={recents}
                        type={SearchView.Recents}
                    />
                </NuggLink>
                <NuggLink
                    type={SearchView.OnSale}
                    previewNuggs={liveActiveNuggs}
                    style={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                    }}
                >
                    <NuggList
                        animationToggle={viewing === SearchView.OnSale}
                        style={styles.nuggListEnter}
                        values={liveActiveNuggs}
                        type={SearchView.OnSale}
                    />
                </NuggLink>
                <NuggLink
                    type={SearchView.AllItems}
                    previewNuggs={liveActiveItems}
                    style={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                    }}
                >
                    <NuggList
                        animationToggle={viewing === SearchView.AllItems}
                        style={styles.nuggListEnter}
                        values={liveActiveItems}
                        type={SearchView.AllItems}
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
