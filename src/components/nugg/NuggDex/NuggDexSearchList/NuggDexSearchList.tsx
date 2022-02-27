import React, { FunctionComponent, SetStateAction, useCallback, useEffect, useState } from 'react';
import { animated, useSpring } from '@react-spring/web';

import { isUndefinedOrNullOrArrayEmpty } from '@src/lib';
import NuggDexState from '@src/state/nuggdex';
import activeNuggsQuery from '@src/state/nuggdex/queries/activeNuggsQuery';
import ProtocolState from '@src/state/protocol';
import constants from '@src/lib/constants';
import allNuggsQuery from '@src/state/nuggdex/queries/allNuggsQuery';
import web3 from '@src/web3';

import NuggList from './components/NuggList';
import NuggLink from './components/NuggLink';
import styles from './NuggDexSearchList.styles';

type Props = {};
const NuggDexSearchList: FunctionComponent<Props> = () => {
    const epoch = ProtocolState.select.epoch();
    const filters = NuggDexState.select.searchFilters();
    const viewing = NuggDexState.select.viewing();
    const chainId = web3.hook.usePriorityChainId();

    const [allNuggs, setAllNuggs] = useState<NL.GraphQL.Fragments.Nugg.ListItem[]>([]);
    const [activeNuggs, setActiveNuggs] = useState<NL.GraphQL.Fragments.Nugg.ListItem[]>([]);
    const recents = NuggDexState.select.recents();

    const animatedStyle = useSpring({
        ...styles.nuggLinksContainer,
        transform: viewing !== 'home' ? 'scale(0.9)' : 'scale(1)',
    });

    const handleGetActive = useCallback(
        async (
            setResults: any,
            startFrom: number,
            addToResult: boolean = false,
            filters: NL.Redux.NuggDex.Filters,
            setLoading?: React.Dispatch<SetStateAction<boolean>>,
        ) => {
            setLoading && setLoading(true);
            const activeNuggs = await activeNuggsQuery(
                chainId,
                filters.sort.by,
                filters.sort.asc ? 'asc' : 'desc',
                filters.searchValue,
                epoch.id,
                constants.NUGGDEX_SEARCH_LIST_CHUNK,
                startFrom,
            );
            if (!isUndefinedOrNullOrArrayEmpty(activeNuggs)) {
                setResults((res) => (addToResult ? [...res, ...activeNuggs] : activeNuggs));
            }
            setLoading && setLoading(false);
        },
        [epoch, chainId],
    );

    const handleGetAll = useCallback(
        async (
            setResults: any,
            startFrom: number,
            addToResult: boolean = false,
            filters: NL.Redux.NuggDex.Filters,
            setLoading?: React.Dispatch<SetStateAction<boolean>>,
        ) => {
            setLoading && setLoading(true);
            const allNuggs = await allNuggsQuery(
                chainId,
                filters.sort.by,
                filters.sort.asc ? 'asc' : 'desc',
                filters.searchValue,
                constants.NUGGDEX_SEARCH_LIST_CHUNK,
                startFrom,
            );
            setResults((res) => (addToResult ? [...res, ...allNuggs] : allNuggs));
            setLoading && setLoading(false);
        },
        [chainId],
    );

    useEffect(() => {
        if (epoch) {
            viewing !== 'all nuggs' && handleGetAll(setAllNuggs, 0, false, filters);
            viewing !== 'on sale' && handleGetActive(setActiveNuggs, 0, false, filters);
        }
    }, [epoch]);

    useEffect(() => {
        if (viewing === 'home' && filters.searchValue !== '') {
            NuggDexState.dispatch.setViewing('all nuggs');
        }
    }, [filters, viewing]);

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
                    <NuggList style={styles.nuggListEnter} values={recents} />
                </NuggLink>
                <NuggLink
                    type="on sale"
                    previewNuggs={activeNuggs}
                    style={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                    }}
                >
                    <NuggList
                        style={styles.nuggListEnter}
                        values={activeNuggs}
                        onScrollEnd={({ setLoading, filters, addToList }) =>
                            handleGetActive(
                                setActiveNuggs,
                                addToList ? activeNuggs.length : 0,
                                addToList,
                                filters,
                                setLoading,
                            )
                        }
                    />
                </NuggLink>
                <NuggLink
                    style={{
                        width: '100%',
                        position: 'absolute',
                        bottom: 0,
                    }}
                    type="all nuggs"
                    previewNuggs={allNuggs}
                    limit={7}
                >
                    <NuggList
                        style={styles.nuggListEnter}
                        values={allNuggs}
                        onScrollEnd={({ setLoading, filters, addToList }) =>
                            handleGetAll(
                                setAllNuggs,
                                addToList ? allNuggs.length : 0,
                                addToList,
                                filters,
                                setLoading,
                            )
                        }
                    />
                </NuggLink>
            </animated.div>
        </div>
    );
};

export default React.memo(NuggDexSearchList);
