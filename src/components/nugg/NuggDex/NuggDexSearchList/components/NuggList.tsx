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
import Colors from '../../../../../lib/colors';
import usePrevious from '../../../../../hooks/usePrevious';

import NuggListRenderItem from './NuggListRenderItem';
import styles from './NuggDexComponents.styles';

type Props = {
    style: CSSProperties | UseSpringProps;
    values: string[];
    setLocalViewing: Dispatch<SetStateAction<NL.Redux.NuggDex.SearchViews>>;
    localViewing: NL.Redux.NuggDex.SearchViews;
    onScrollEnd?: ({
        setLoading,
        filters,
        addToList,
    }: {
        setLoading?: React.Dispatch<SetStateAction<boolean>>;
        filters: NL.Redux.NuggDex.Filters;
        addToList?: boolean;
    }) => Promise<void> | (() => void);
};

const NuggList: FunctionComponent<Props> = ({
    style,
    values,
    setLocalViewing,
    localViewing,
    onScrollEnd,
}) => {
    const filters = NuggDexState.select.searchFilters();
    const prevFilters = usePrevious(filters);
    const recents = NuggDexState.select.recents();
    const epoch = ProtocolState.select.epoch();
    const web3address = Web3State.select.web3address();

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (
            localViewing === 'home' &&
            !isUndefinedOrNullOrStringEmpty(filters.searchValue)
        ) {
            setLocalViewing('all nuggs');
        }
    }, [filters.searchValue, setLocalViewing]);

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

    useEffect(() => {
        onScrollEnd &&
            ((prevFilters && prevFilters.searchValue !== filters.searchValue) ||
                filters.searchValue !== '') &&
            onScrollEnd({ setLoading, filters, addToList: false });
    }, [filters]);

    useEffect(
        () => () => {
            onScrollEnd &&
                onScrollEnd({
                    setLoading,
                    filters: { searchValue: '', sort: { by: 'id', asc: true } },
                    addToList: false,
                });
        },
        [],
    );

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
                                // color: Colors.nuggBlueText
                            }}
                            text={ucFirst(localViewing)}
                            transitionText="Go back"
                            onClick={() => {
                                NuggDexState.dispatch.setSearchFilters({
                                    searchValue: '',
                                    sort: {
                                        asc: true,
                                        by: 'id',
                                    },
                                });
                                setLocalViewing('home');
                            }}
                        />
                    </div>
                )}
                <List
                    style={{
                        padding: '1.7rem 1rem',
                        zIndex: 0,
                        position: 'absolute',
                    }}
                    data={values}
                    RenderItem={NuggListRenderItem}
                    loading={loading}
                    onScrollEnd={() => {
                        onScrollEnd({ setLoading, filters, addToList: true });
                    }}
                    action={onClick}
                />
            </animated.div>
        </div>
    );
};

export default React.memo(NuggList);
