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
import { ListData } from '@src/client/interfaces';

import NuggList from './components/NuggList';
import NuggLink from './components/NuggLink';
import styles from './NuggDexSearchList.styles';

type Props = Record<string, never>;

const NuggDexSearchList: FunctionComponent<Props> = () => {
    const epoch__id = client.live.epoch.id();
    const filters = NuggDexState.select.searchFilters();
    const [sortAsc, setSortAsc] = useState<{ [key in NuggDexSearchViews]: boolean }>({
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
            _liveActiveNuggs.reduce((acc: ListData[], nugg) => {
                let tmp = acc;
                if (epoch__id && +nugg.id <= +epoch__id) {
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
        [epoch__id, _liveActiveNuggs, filters, sortAsc],
    );

    const rawLiveActiveItems = client.live.activeItems();
    const liveActiveItems = useMemo(
        () =>
            rawLiveActiveItems.reduce((acc: ListData[], item) => {
                let tmp = acc;
                // @danny7even is this needed?
                // if (filters.searchValue && filters.searchValue === item.id) {
                if (sortAsc['items on sale']) {
                    tmp = [...acc, item];
                } else {
                    tmp = [item, ...acc];
                }
                // }
                return tmp;
            }, []),
        [filters, sortAsc, rawLiveActiveItems],
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
        transform: viewing !== 'home' ? 'scale(0.9)' : 'scale(1)',
        delay: constants.ANIMATION_DELAY,
    });

    const handleGetAll = useCallback(
        async (
            setResults: React.Dispatch<React.SetStateAction<ListData[]>>,
            startFrom: number,
            // eslint-disable-next-line @typescript-eslint/default-param-last
            addToResult,
            _filters: NuggDexFilters,
            setLoading?: React.Dispatch<SetStateAction<boolean>>,
            desiredSize?: number,
        ) => {
            if (chainId) {
                if (setLoading) setLoading(true);
                const _allNuggs = await allNuggsQuery(
                    chainId,
                    // filters.sort && filters.sort.by ? filters.sort.by : 'eth',
                    _filters.sort && _filters.sort.asc ? 'asc' : 'desc',
                    _filters.searchValue ? _filters.searchValue : '',
                    desiredSize || constants.NUGGDEX_SEARCH_LIST_CHUNK,
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
                        onScrollEnd={({ setLoading, filters: _filters, addToList, desiredSize }) =>
                            handleGetAll(
                                setAllNuggs,
                                addToList ? allNuggs.length : 0,
                                addToList,
                                _filters,
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
