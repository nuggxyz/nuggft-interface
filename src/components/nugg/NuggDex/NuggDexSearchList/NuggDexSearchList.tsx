import React, { FunctionComponent, useEffect, useMemo, useRef, useState } from 'react';
import { animated, useSpring } from '@react-spring/web';

import constants from '@src/lib/constants';
import client from '@src/client';
import { ListData, SearchView } from '@src/client/interfaces';
import {
    GetAllItemsSearchQuery,
    GetAllNuggsSearchQuery,
    Item_OrderBy,
    Nugg_OrderBy,
    useGetAllItemsSearchQuery,
    useGetAllNuggsSearchQuery,
} from '@src/gql/types.generated';
import AppState from '@src/state/app';

import NuggList from './components/NuggList';
import NuggLink from './components/NuggLink';
import styles from './NuggDexSearchList.styles';

type Props = Record<string, never>;

const INFINITE_INTERVAL = 25;

const NuggDexSearchList: FunctionComponent<Props> = () => {
    const epoch__id = client.live.epoch.id();
    const target = client.live.searchFilter.target();
    const sort = client.live.searchFilter.sort();
    const viewing = client.live.searchFilter.viewing();
    const activeNuggs = client.live.activeSwaps();
    const potentialNuggs = client.live.potentialSwaps();

    const updateSearchFilterTarget = client.mutate.updateSearchFilterTarget();
    const updateSearchFilterSort = client.mutate.updateSearchFilterSort();
    const activeItems = client.live.activeItems();
    const potentialItems = client.live.potentialItems();

    const recentNuggs = client.live.recentSwaps();
    const recentItems = client.live.recentItems();

    const [sortAsc, setSortAsc] = useState<{ [key in SearchView]: boolean }>({
        Recents: false,
        AllNuggs: false,
        OnSale: false,
        AllItems: false,
        Home: false,
        MyNuggs: false,
        Search: false,
    });
    const _sortAsc = useRef(sortAsc);

    const [allNuggsData, setAllNuggsData] = React.useState<GetAllNuggsSearchQuery['nuggs']>();
    const [allItemsData, setAllItemsData] = React.useState<GetAllItemsSearchQuery['items']>();

    const { fetchMore: fetchMoreNuggs } = useGetAllNuggsSearchQuery({
        fetchPolicy: 'cache-first',
        variables: {
            skip: 0,
            first: INFINITE_INTERVAL,
            orderBy: Nugg_OrderBy.Idnum,
        },
        onCompleted: (x) => {
            setAllNuggsData(x.nuggs);
        },
    });

    const loadMoreNuggs = React.useCallback(() => {
        void fetchMoreNuggs({
            variables: {
                first: INFINITE_INTERVAL,
                skip: allNuggsData?.length || 0,
            },
        }).then((x) => {
            setAllNuggsData((a) => [...(a || []), ...x.data.nuggs]);
        });
    }, [allNuggsData, fetchMoreNuggs, setAllNuggsData]);

    const { fetchMore: fetchMoreItems } = useGetAllItemsSearchQuery({
        fetchPolicy: 'cache-first',
        variables: {
            skip: 0,
            first: INFINITE_INTERVAL,
            orderBy: Item_OrderBy.Idnum,
        },
        onCompleted: (x) => {
            setAllItemsData(x.items);
        },
    });

    const loadMoreItems = React.useCallback(() => {
        void fetchMoreItems({
            variables: {
                first: INFINITE_INTERVAL,
                skip: allItemsData?.length || 0,
            },
        }).then((x) => {
            setAllItemsData((a) => [...(a || []), ...x.data.items]);
        });
    }, [allItemsData, fetchMoreItems, setAllItemsData]);

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

    const liveActiveNuggs = useMemo(
        () =>
            [...activeNuggs, ...potentialNuggs].reduce((acc: ListData[], nugg) => {
                let tmp = acc;
                if (epoch__id && +nugg.id <= +epoch__id) {
                    if (sortAsc[SearchView.OnSale]) {
                        tmp = [...acc, nugg];
                    } else {
                        tmp = [nugg, ...acc];
                    }
                }
                return tmp;
            }, []),
        [epoch__id, activeNuggs, potentialNuggs, sortAsc],
    );

    const liveActiveItems = useMemo(
        () =>
            [...activeItems, ...potentialItems].reduce((acc: ListData[], item) => {
                let tmp = acc;
                if (sortAsc[SearchView.OnSale]) {
                    tmp = [...acc, item];
                } else {
                    tmp = [item, ...acc];
                }
                return tmp;
            }, []),
        [sortAsc, potentialItems, activeItems],
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

    const screenType = AppState.select.screenType();

    const activeSearch = client.live.activeSearch();

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
                        interval={INFINITE_INTERVAL}
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
                        interval={INFINITE_INTERVAL}
                        animationToggle={viewing === SearchView.OnSale}
                        style={styles.nuggListEnter}
                        values={liveActiveEverything}
                        type={SearchView.OnSale}
                    />
                </NuggLink>

                <NuggLink type={SearchView.Search} disablePreview>
                    <NuggList
                        interval={INFINITE_INTERVAL}
                        animationToggle={viewing === SearchView.Search}
                        style={styles.nuggListEnter}
                        values={activeSearch}
                        type={SearchView.Search}
                        onScrollEnd={({ horribleMFingHack }) => {
                            if (horribleMFingHack) horribleMFingHack();
                        }}
                    />
                </NuggLink>

                <NuggLink
                    style={{
                        position: 'absolute',
                        right: 0,
                        bottom: 0,
                    }}
                    type={SearchView.AllItems}
                    previewNuggs={
                        allItemsData?.first(constants.NUGGDEX_ALLNUGGS_PREVIEW_COUNT).map((x) => ({
                            id: `item-${x.id}`,
                            listDataType: 'basic' as const,
                        })) || []
                    }
                >
                    <NuggList
                        animationToggle={viewing === SearchView.AllItems}
                        style={styles.nuggListEnter}
                        values={
                            allItemsData?.map((x) => ({
                                id: `item-${x.id}`,
                                listDataType: 'basic' as const,
                            })) || []
                        }
                        interval={INFINITE_INTERVAL}
                        type={SearchView.AllItems}
                        onScrollEnd={loadMoreItems}
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
                    previewNuggs={
                        allNuggsData?.first(constants.NUGGDEX_ALLNUGGS_PREVIEW_COUNT).map((x) => ({
                            id: x.id,
                            listDataType: 'basic' as const,
                        })) || []
                    }
                >
                    <NuggList
                        animationToggle={viewing === SearchView.AllNuggs}
                        style={styles.nuggListEnter}
                        values={
                            allNuggsData?.map((x) => ({
                                id: x.id,
                                listDataType: 'basic' as const,
                            })) || []
                        }
                        interval={INFINITE_INTERVAL}
                        type={SearchView.AllNuggs}
                        onScrollEnd={loadMoreNuggs}
                    />
                </NuggLink>
            </animated.div>
        </div>
    );
};

export default React.memo(NuggDexSearchList);
