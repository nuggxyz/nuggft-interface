import React, {
    CSSProperties,
    Dispatch,
    FunctionComponent,
    SetStateAction,
    useCallback,
    useEffect,
    useLayoutEffect,
    useMemo,
    useState,
} from 'react';
import { animated, UseSpringProps } from 'react-spring';
import { ChevronLeft } from 'react-feather';
import { batch } from 'react-redux';

import {
    isUndefinedOrNullOrArrayEmpty,
    isUndefinedOrNullOrObjectEmpty,
    isUndefinedOrNullOrStringEmpty,
    ucFirst,
} from '../../../../../lib';
import List from '../../../../general/List/List';
import TransitionText from '../../../../general/Texts/TransitionText/TransitionText';
import globalStyles from '../../../../../lib/globalStyles';
import NuggDexState from '../../../../../state/nuggdex';
import TokenState from '../../../../../state/token';
import activeNuggsQuery from '../../../../../state/nuggdex/queries/activeNuggsQuery';
import constants from '../../../../../lib/constants';
import ProtocolState from '../../../../../state/protocol';
import allNuggsQuery from '../../../../../state/nuggdex/queries/allNuggsQuery';
import myNuggsQuery from '../../../../../state/wallet/queries/myNuggsQuery';
import Web3State from '../../../../../state/web3';
import AppState from '../../../../../state/app';

import NuggListRenderItem from './NuggListRenderItem';
import styles from './NuggDexComponents.styles';

type Props = {
    style: CSSProperties | UseSpringProps;
    values: string[];
    setLocalViewing: Dispatch<SetStateAction<NL.Redux.NuggDex.SearchViews>>;
    localViewing: NL.Redux.NuggDex.SearchViews;
};

const NuggList: FunctionComponent<Props> = ({
    style,
    values,
    setLocalViewing,
    localViewing,
}) => {
    const filters = NuggDexState.select.searchFilters();
    const recents = NuggDexState.select.recents();
    const epoch = ProtocolState.select.epoch();
    const web3address = Web3State.select.web3address();

    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState([]);

    useEffect(() => {
        if (
            localViewing === 'home' &&
            !isUndefinedOrNullOrArrayEmpty(results)
        ) {
            setResults([]);
        }
    }, [localViewing, results]);

    useEffect(() => {
        if (
            localViewing === 'home' &&
            !isUndefinedOrNullOrStringEmpty(filters.searchValue)
        ) {
            setLocalViewing('all nuggs');
        }
    }, [filters.searchValue, setLocalViewing]);

    const listData = useMemo(
        () => (!isUndefinedOrNullOrArrayEmpty(results) ? results : values),
        [values, results],
    );

    const onClick = useCallback((item) => {
        batch(() => {
            TokenState.dispatch.setTokenFromId(item);
            NuggDexState.dispatch.addToRecents({
                _localStorageValue: item,
                _localStorageTarget: 'recents',
                _localStorageExpectedType: 'array',
            });
        });
    }, []);

    const searchTokens = useCallback(
        async (addToResult: boolean) => {
            setLoading(true);
            if (localViewing === 'recently viewed') {
                const recentsCopy = Object.assign([], recents);

                recentsCopy
                    .sort((a, b) => (+a > +b && filters.sort.asc ? 1 : -1))
                    .filter(
                        (id) =>
                            isUndefinedOrNullOrStringEmpty(
                                filters.searchValue,
                            ) || id.includes(filters.searchValue),
                    );
                setResults(recentsCopy);
            } else {
                const startFrom = addToResult ? results.length : 0;
                if (localViewing === 'on sale') {
                    const currentEpoch = epoch.id;
                    const activeNuggs = await activeNuggsQuery(
                        filters.sort.by,
                        filters.sort.asc ? 'asc' : 'desc',
                        filters.searchValue,
                        currentEpoch,
                        constants.NUGGDEX_SEARCH_LIST_CHUNK,
                        startFrom,
                    );

                    if (!isUndefinedOrNullOrArrayEmpty(activeNuggs)) {
                        const ids = activeNuggs.map((active) => active.nugg.id);
                        setResults((res) =>
                            addToResult ? [...res, ...ids] : ids,
                        );
                    }
                } else if (localViewing === 'all nuggs') {
                    const allNuggs = (
                        await allNuggsQuery(
                            filters.sort.by,
                            filters.sort.asc ? 'asc' : 'desc',
                            filters.searchValue,
                            constants.NUGGDEX_SEARCH_LIST_CHUNK,
                            startFrom,
                        )
                    ).reduce((map, all) => {
                        map[all.nugg.id] = all.nugg.id;
                        return map;
                        //@ts-ignore
                    }, {});
                    const ids = Object.keys(allNuggs);
                    setResults((res) => (addToResult ? [...res, ...ids] : ids));
                } else if (localViewing === 'my nuggs') {
                    const myNuggs = await myNuggsQuery(
                        web3address,
                        filters.sort.asc ? 'asc' : 'desc',
                        filters.searchValue,
                        constants.NUGGDEX_SEARCH_LIST_CHUNK,
                        startFrom,
                    );

                    if (!isUndefinedOrNullOrArrayEmpty(myNuggs)) {
                        const ids = myNuggs.map((my) => my.id);
                        setResults((res) =>
                            addToResult ? [...res, ...ids] : ids,
                        );
                    }
                }
            }
            setLoading(false);
        },
        [results, localViewing, filters, epoch, recents, web3address],
    );

    useEffect(() => {
        if (
            !isUndefinedOrNullOrStringEmpty(filters.searchValue) ||
            AppState.isMobile
        ) {
            searchTokens(false);
        }
    }, [filters, localViewing]);

    return (
        <div
            style={{
                ...styles.nuggListContainer,
                ...(AppState.isMobile && { position: 'relative' }),
            }}>
            <animated.div
                style={{
                    ...styles.nuggListDefault,
                    ...style,
                }}>
                {!AppState.isMobile && (
                    <div
                        style={{
                            display: 'flex',
                            ...styles.nuggListTitle,
                            ...globalStyles.backdropFilter,
                            zIndex: 10,
                        }}>
                        <TransitionText
                            Icon={ChevronLeft}
                            style={{
                                marginTop: '.12rem',
                            }}
                            text={ucFirst(localViewing)}
                            transitionText="Go back"
                            onClick={() => {
                                setLocalViewing('home');
                            }}
                        />
                    </div>
                )}
                <List
                    style={{
                        padding: '1.6rem 1rem',
                        zIndex: 0,
                    }}
                    data={listData}
                    RenderItem={NuggListRenderItem}
                    loading={loading}
                    onScrollEnd={() => searchTokens(true)}
                    action={onClick}
                />
            </animated.div>
        </div>
    );
};

export default React.memo(NuggList);
