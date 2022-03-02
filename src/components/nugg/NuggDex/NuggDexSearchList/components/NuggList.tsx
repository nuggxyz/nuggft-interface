import React, {
    CSSProperties,
    Dispatch,
    FunctionComponent,
    SetStateAction,
    useCallback,
    useEffect,
    useState,
} from 'react';
import { Promise } from 'bluebird';
import { animated, UseSpringProps } from '@react-spring/web';
import { ChevronLeft } from 'react-feather';
import { batch } from 'react-redux';

import { isUndefinedOrNullOrNotFunction, isUndefinedOrNullOrStringEmpty, ucFirst } from '@src/lib';
import TransitionText from '@src/components/general/Texts/TransitionText/TransitionText';
import globalStyles from '@src/lib/globalStyles';
import NuggDexState from '@src/state/nuggdex';
import TokenState from '@src/state/token';
import AppState from '@src/state/app';
import usePrevious from '@src/hooks/usePrevious';
import InfiniteList from '@src/components/general/List/InfiniteList';
import Loader from '@src/components/general/Loader/Loader';

import NuggListRenderItem from './NuggListRenderItem';
import styles from './NuggDexComponents.styles';

type Props = {
    style: CSSProperties | UseSpringProps;
    values: NL.GraphQL.Fragments.Nugg.ListItem[];
    animationToggle?: boolean;
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

const NuggList: FunctionComponent<Props> = ({ style, values, onScrollEnd, animationToggle }) => {
    const filters = NuggDexState.select.searchFilters();
    const prevFilters = usePrevious(filters);
    const screenType = AppState.select.screenType();
    const viewing = NuggDexState.select.viewing();

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (viewing === 'home' && !isUndefinedOrNullOrStringEmpty(filters.searchValue)) {
            NuggDexState.dispatch.setViewing('all nuggs');
        }
    }, [filters.searchValue]);

    const onClick = useCallback((item) => {
        batch(() => {
            TokenState.dispatch.setNugg(item);
            NuggDexState.dispatch.addToRecents(item);
        });
    }, []);

    const _onScrollEnd = useCallback(() => {
        if (!isUndefinedOrNullOrNotFunction(onScrollEnd)) {
            onScrollEnd({ setLoading, filters, addToList: true });
        }
    }, [filters, onScrollEnd]);

    useEffect(() => {
        if (
            !isUndefinedOrNullOrNotFunction(onScrollEnd) &&
            ((prevFilters && prevFilters.searchValue !== filters.searchValue) ||
                filters.searchValue !== '' ||
                prevFilters?.sort.asc !== filters?.sort.asc)
        ) {
            onScrollEnd({ setLoading, filters, addToList: false });
        }
    }, [filters]);

    useEffect(() => {
        if (!isUndefinedOrNullOrNotFunction(onScrollEnd)) {
            onScrollEnd({
                setLoading,
                filters: { searchValue: '', sort: { by: 'id', asc: true } },
                addToList: false,
            });
        }
    }, []);

    return (
        <div
            style={{
                ...styles.nuggListContainer,
                ...(screenType === 'phone' && { position: 'relative' }),
            }}
        >
            <animated.div
                style={{
                    ...styles.nuggListDefault,
                    ...style,
                }}
            >
                {screenType !== 'phone' && (
                    <div style={styles.nuggListTitle}>
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                width: '100%',
                                padding: '.5rem',
                                height: '100%',
                                ...globalStyles.backdropFilter,
                            }}
                        >
                            <TransitionText
                                Icon={<ChevronLeft />}
                                style={{ marginTop: '.12rem' }}
                                text={ucFirst(viewing)}
                                transitionText="Go back"
                                onClick={() => {
                                    NuggDexState.dispatch.setSearchFilters({
                                        searchValue: '',
                                        sort: {
                                            asc: true,
                                            by: 'id',
                                        },
                                    });
                                    NuggDexState.dispatch.setViewing('home');
                                }}
                            />
                            {loading && <Loader color="black" />}
                        </div>
                    </div>
                )}
                <InfiniteList
                    style={{ zIndex: 0, paddingTop: '2.5rem' }}
                    data={values}
                    RenderItem={NuggListRenderItem}
                    loading={loading}
                    onScrollEnd={_onScrollEnd}
                    action={onClick}
                    itemHeight={210}
                    animationToggle={animationToggle}
                />
            </animated.div>
        </div>
    );
};

export default React.memo(NuggList);
