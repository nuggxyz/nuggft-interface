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

import NuggDexState from '@src/state/nuggdex';
import constants from '@src/lib/constants';
import allNuggsQuery from '@src/state/nuggdex/queries/allNuggsQuery';
import web3 from '@src/web3';
import client from '@src/client';
import { SwapData } from '@src/client/core';

import NuggList from './components/NuggList';
import NuggLink from './components/NuggLink';
import styles from './NuggDexSearchList.styles';

type Props = {};
const NuggDexSearchList: FunctionComponent<Props> = () => {
    const epoch = client.live.epoch();
    const filters = NuggDexState.select.searchFilters();
    const [sortAsc, setSortAsc] = useState<{ [key in NL.Redux.NuggDex.SearchViews]: boolean }>({
        'recently viewed': false,
        'all nuggs': false,
        'on sale': false,
        'items on sale': false,
        home: false,
        'my nuggs': false,
    });
    const _sortAsc = useRef(sortAsc);
    useEffect(() => {
        _sortAsc.current = sortAsc;
    });
    const viewing = NuggDexState.select.viewing();
    const chainId = web3.hook.usePriorityChainId();
    const _liveActiveNuggs = client.live.activeSwaps();

    const liveActiveNuggs = useMemo(
        () =>
            _liveActiveNuggs.reduce((acc: SwapData[], nugg) => {
                let tmp = acc;
                if (epoch && +nugg.id <= +epoch.id) {
                    if (filters.searchValue === '' || filters.searchValue === nugg.id) {
                        if (sortAsc['on sale']) {
                            tmp = [...acc, nugg];
                        } else {
                            tmp = [nugg, ...acc];
                        }
                    }
                }
                return tmp;
            }, []),
        [epoch, _liveActiveNuggs, filters, sortAsc],
    );

    const _liveActiveItems = client.live.activeItems();
    const liveActiveItems = useMemo(
        () =>
            _liveActiveItems.reduce((acc: SwapData[], item) => {
                let tmp = acc;
                if (filters.searchValue === '' || filters.searchValue === item.id) {
                    if (sortAsc['items on sale']) {
                        tmp = [...acc, item];
                    } else {
                        tmp = [item, ...acc];
                    }
                }
                return tmp;
            }, []),
        [filters, sortAsc, _liveActiveItems],
    );
    useEffect(() => {
        NuggDexState.dispatch.setSearchFilters({
            target: viewing,
            sort: {
                asc: _sortAsc.current[viewing],
            },
        });
    }, [viewing, setSortAsc]);
    useEffect(() => {
        if (filters.target) {
            setSortAsc((sort) => {
                return {
                    ...sort,
                    ...(filters.target && filters.sort
                        ? { [filters.target]: filters.sort.asc }
                        : {}),
                };
            });
        }
    }, [filters]);
    const [allNuggs, setAllNuggs] = useState<NL.GraphQL.Fragments.Nugg.ListItem[]>([]);
    const [allNuggsPreview, setAllNuggsPreview] = useState<NL.GraphQL.Fragments.Nugg.ListItem[]>(
        [],
    );
    const recents = NuggDexState.select.recents();

    useEffect(() => {
        if (allNuggs.length >= constants.NUGGDEX_ALLNUGGS_PREVIEW_COUNT) {
            setAllNuggsPreview(allNuggs.first(constants.NUGGDEX_ALLNUGGS_PREVIEW_COUNT));
        }
    }, [allNuggs]);

    const animatedStyle = useSpring({
        ...styles.nuggLinksContainer,
        transform: viewing !== 'home' ? 'scale(0.9)' : 'scale(1)',
        delay: constants.ANIMATION_DELAY,
    });

    const handleGetAll = useCallback(
        async (
            setResults: React.Dispatch<React.SetStateAction<NL.GraphQL.Fragments.Nugg.ListItem[]>>,
            startFrom: number,
            addToResult: boolean = false,
            filters: NL.Redux.NuggDex.Filters,
            setLoading?: React.Dispatch<SetStateAction<boolean>>,
            desiredSize?: number,
        ) => {
            if (chainId && epoch) {
                setLoading && setLoading(true);
                const allNuggs = await allNuggsQuery(
                    chainId,
                    filters.sort && filters.sort.by ? filters.sort.by : 'eth',
                    filters.sort && filters.sort.asc ? 'asc' : 'desc',
                    filters.searchValue ? filters.searchValue : '',
                    desiredSize ? desiredSize : constants.NUGGDEX_SEARCH_LIST_CHUNK,
                    startFrom,
                    +epoch.id,
                );
                setResults((res) => (addToResult ? [...res, ...allNuggs] : allNuggs));
                setLoading && setLoading(false);
            }
        },
        [chainId, epoch],
    );

    return (
        <div style={styles.searchListContainer}>
            <animated.div style={animatedStyle}>
                <NuggLink
                    type="recently viewed"
                    previewNuggs={recents}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                    }}
                >
                    <NuggList
                        animationToggle={viewing === 'recently viewed'}
                        style={styles.nuggListEnter}
                        values={recents}
                        type="recently viewed"
                    />
                </NuggLink>
                <NuggLink
                    type="on sale"
                    previewNuggs={liveActiveNuggs}
                    style={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                    }}
                >
                    <NuggList
                        animationToggle={viewing === 'on sale'}
                        style={styles.nuggListEnter}
                        values={liveActiveNuggs}
                        type="on sale"
                    />
                </NuggLink>
                <NuggLink
                    type="items on sale"
                    previewNuggs={liveActiveItems}
                    style={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                    }}
                >
                    <NuggList
                        animationToggle={viewing === 'items on sale'}
                        style={styles.nuggListEnter}
                        values={liveActiveItems}
                        type="on sale"
                    />
                </NuggLink>
                <NuggLink
                    style={{
                        // width: '100%',
                        position: 'absolute',
                        left: 0,
                        bottom: 0,
                    }}
                    type="all nuggs"
                    previewNuggs={allNuggsPreview}
                    // limit={constants.NUGGDEX_ALLNUGGS_PREVIEW_COUNT}
                >
                    <NuggList
                        animationToggle={viewing === 'all nuggs'}
                        style={styles.nuggListEnter}
                        values={allNuggs}
                        type="all nuggs"
                        onScrollEnd={({ setLoading, filters, addToList, desiredSize }) =>
                            handleGetAll(
                                setAllNuggs,
                                addToList ? allNuggs.length : 0,
                                addToList,
                                filters,
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
