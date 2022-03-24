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
import { ListData, SearchView } from '@src/client/interfaces';

import NuggList from './components/NuggList';
import NuggLink from './components/NuggLink';
import styles from './NuggDexSearchList.styles';

type Props = Record<string, never>;

const NuggDexSearchList: FunctionComponent<Props> = () => {
    const epoch__id = client.live.epoch.id();
    const filters = NuggDexState.select.searchFilters();
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
                    if (filters.searchValue === '' || filters.searchValue === nugg.id) {
                        if (sortAsc[SearchView.OnSale]) {
                            tmp = [...acc, nugg];
                        } else {
                            tmp = [nugg, ...acc];
                        }
                    }
                }
                return tmp;
            }, []),
        [epoch__id, _liveActiveNuggs, filters, sortAsc],
    );
    const updateSearchFilterTarget = client.mutate.updateSearchFilterTarget();
    const updateSearchFilterSort = client.mutate.updateSearchFilterSort();
    const rawLiveActiveItems = client.live.activeItems();
    const liveActiveItems = useMemo(
        () =>
            rawLiveActiveItems.reduce((acc: ListData[], item) => {
                let tmp = acc;
                if (filters.searchValue && filters.searchValue === item.id) {
                    if (sortAsc[SearchView.AllItems]) {
                        tmp = [...acc, item];
                    } else {
                        tmp = [item, ...acc];
                    }
                }
                return tmp;
            }, []),
        [filters, sortAsc, rawLiveActiveItems],
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
        if (filters?.target) {
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

    const handleGetAll = useCallback(
        async (
            setResults: React.Dispatch<React.SetStateAction<ListData[]>>,
            startFrom: number,
            // eslint-disable-next-line  @typescript-eslint/default-param-last
            addToResult = false,
            sort?: 'asc' | 'desc',
            searchValue?: string,
            setLoading?: React.Dispatch<SetStateAction<boolean>>,
            desiredSize?: number,
        ) => {
            if (chainId) {
                if (setLoading) setLoading(true);
                const _allNuggs = await allNuggsQuery(
                    chainId,
                    // filters.sort && filters.sort.by ? filters.sort.by : 'eth',
                    sort ?? 'asc',
                    searchValue ?? '',
                    desiredSize || 25, // @danny7even when this is "10" it doesnt work
                    startFrom,
                );
                setResults((res) => (addToResult ? [...res, ..._allNuggs] : _allNuggs));
                if (setLoading) setLoading(false);
            }
        },
        [chainId],
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
                        onScrollEnd={({ setLoading, searchValue, sort, addToList, desiredSize }) =>
                            handleGetAll(
                                setAllNuggs,
                                addToList ? allNuggs.length : 0,
                                addToList,
                                sort,
                                searchValue,
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
