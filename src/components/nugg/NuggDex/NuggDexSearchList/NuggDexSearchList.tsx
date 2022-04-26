import React, { FunctionComponent, useEffect, useMemo, useRef, useState } from 'react';
import { animated, useSpring } from '@react-spring/web';

import constants from '@src/lib/constants';
import client from '@src/client';
import { SearchView } from '@src/client/interfaces';
import {
    GetAllItemsSearchQuery,
    GetAllNuggsSearchQuery,
    Item_OrderBy,
    Nugg_OrderBy,
    useGetAllItemsSearchQuery,
    useGetAllNuggsSearchQuery,
} from '@src/gql/types.generated';
import useDimentions from '@src/client/hooks/useDimentions';
import useSortedSwapList from '@src/client/hooks/useSortedSwapList';

import NuggLink from './components/NuggLink';
import styles from './NuggDexSearchList.styles';
import NuggList from './components/NuggList';

type Props = Record<string, never>;

const INFINITE_INTERVAL = 25;
const START_INTERVAL = 3;

// const NuggList = React.lazy(() => import('./components/NuggList'));

const NuggDexSearchList: FunctionComponent<Props> = () => {
    const epoch__id = client.live.epoch.id();
    const target = client.live.searchFilter.target();
    const sort = client.live.searchFilter.sort();
    const viewing = client.live.searchFilter.viewing();

    const { screen: screenType, isPhone } = useDimentions();

    const updateSearchFilterTarget = client.mutate.updateSearchFilterTarget();
    const updateSearchFilterSort = client.mutate.updateSearchFilterSort();

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
            first: START_INTERVAL,
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
            first: START_INTERVAL,
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

    const all = useSortedSwapList();

    const liveActiveEverything = useMemo(
        () =>
            [...all.current, ...all.next, ...all.potential].reduce((acc: TokenId[], curr) => {
                let tmp: TokenId[] = acc;
                if (epoch__id && +curr.toRawId() <= +epoch__id) {
                    if (sortAsc[SearchView.OnSale]) {
                        tmp = [...acc, curr];
                    } else {
                        tmp = [curr, ...acc];
                    }
                }
                return tmp;
            }, []),
        [epoch__id, all, sortAsc],
    );

    const recentEverything = useMemo(() => {
        return [...all.recent];
    }, [all.recent]);

    const animatedStyle = useSpring({
        ...styles.nuggLinksContainer,
        transform: viewing !== SearchView.Home ? 'scale(0.9)' : 'scale(1)',
        delay: constants.ANIMATION_DELAY,
    });

    const activeSearch = client.live.activeSearch();

    return (
        <div
            style={{
                ...styles.searchListContainer,
                ...(screenType === 'phone' && {
                    width: '100%',
                    height: '90%',
                    marginTop: '2rem',
                    alignItems: 'flex-start',
                }),
            }}
        >
            <animated.div
                style={{
                    ...animatedStyle,
                    ...(screenType === 'phone' &&
                        {
                            // width: '100%',
                            // height: '90%',
                            // marginTop: '2rem',
                            // alignItems: 'flex-start',
                        }),
                }}
            >
                <NuggLink type={SearchView.Search} disablePreview>
                    <NuggList
                        interval={INFINITE_INTERVAL}
                        animationToggle={viewing === SearchView.Search}
                        style={styles.nuggListEnter}
                        tokenIds={activeSearch.map((x) => x.tokenId)}
                        type={SearchView.Search}
                        onScrollEnd={({ horribleMFingHack }) => {
                            if (horribleMFingHack) horribleMFingHack();
                        }}
                        cardType="all"
                    />
                </NuggLink>
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
                        tokenIds={recentEverything}
                        type={SearchView.Recents}
                        cardType="recent"
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
                        tokenIds={liveActiveEverything}
                        type={SearchView.OnSale}
                        cardType="swap"
                    />
                </NuggLink>

                <NuggLink
                    style={{
                        position: 'absolute',
                        right: 0,
                        bottom: isPhone ? 45 : 0,
                    }}
                    type={SearchView.AllItems}
                    previewNuggs={
                        allItemsData
                            ?.first(constants.NUGGDEX_ALLNUGGS_PREVIEW_COUNT)
                            .map((x) => x.id.toItemId()) || []
                    }
                >
                    <NuggList
                        animationToggle={viewing === SearchView.AllItems}
                        style={styles.nuggListEnter}
                        tokenIds={allItemsData?.map((x) => x.id.toItemId()) || []}
                        interval={INFINITE_INTERVAL}
                        type={SearchView.AllItems}
                        onScrollEnd={loadMoreItems}
                        cardType="all"
                    />
                </NuggLink>
                <NuggLink
                    style={{
                        // width: '100%',
                        position: 'absolute',
                        left: 0,
                        bottom: isPhone ? 45 : 0,
                    }}
                    type={SearchView.AllNuggs}
                    previewNuggs={
                        allNuggsData
                            ?.first(constants.NUGGDEX_ALLNUGGS_PREVIEW_COUNT)
                            .map((x) => x.id.toNuggId()) || []
                    }
                >
                    <NuggList
                        animationToggle={viewing === SearchView.AllNuggs}
                        style={styles.nuggListEnter}
                        tokenIds={allNuggsData?.map((x) => x.id.toNuggId()) || []}
                        cardType="all"
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
