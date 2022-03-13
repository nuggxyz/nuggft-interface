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

import { isUndefinedOrNullOrNotFunction, ucFirst } from '@src/lib';
import TransitionText from '@src/components/general/Texts/TransitionText/TransitionText';
import NuggDexState from '@src/state/nuggdex';
import AppState from '@src/state/app';
import usePrevious from '@src/hooks/usePrevious';
import InfiniteList from '@src/components/general/List/InfiniteList';
import client from '@src/client';

import NuggListRenderItem from './NuggListRenderItem';
import styles from './NuggDexComponents.styles';

type Props = {
    type?: NuggDexSearchViews;
    style: CSSProperties | UseSpringProps;
    values: NL.GraphQL.Fragments.Nugg.ListItem[];
    animationToggle?: boolean;
    onScrollEnd?: ({
        setLoading,
        filters,
        addToList,
        desiredSize,
    }: {
        setLoading?: React.Dispatch<SetStateAction<boolean>>;
        filters: NuggDexFilters;
        addToList?: boolean;
        desiredSize?: number;
    }) => Promise<void> | (() => void);
};

const NuggList: FunctionComponent<Props> = ({
    style,
    values,
    onScrollEnd,
    animationToggle,
    type,
}) => {
    const filters = NuggDexState.select.searchFilters();

    const prevFilters = usePrevious(filters);
    const screenType = AppState.select.screenType();
    const viewing = NuggDexState.select.viewing();

    const [loading, setLoading] = useState(false);

    const onClick = useCallback((item: typeof values[0]) => {
        batch(() => {
            client.actions.routeTo(item?.id, true);
            // @ts-ignore
            NuggDexState.dispatch.addToRecents({ ...item, eth: undefined });
        });
    }, []);

    const _onScrollEnd = useCallback(
        ({ addToList, desiredSize }: { addToList: boolean; desiredSize?: number }) => {
            if (onScrollEnd) void onScrollEnd({ setLoading, filters, addToList, desiredSize });
        },
        [filters, onScrollEnd],
    );

    useEffect(() => {
        if (
            !isUndefinedOrNullOrNotFunction(onScrollEnd) &&
            (!type || filters.target === type) &&
            ((prevFilters && prevFilters.searchValue !== filters.searchValue) ||
                filters.searchValue !== '' ||
                ((prevFilters && prevFilters.sort && prevFilters?.sort.asc) !==
                    (filters && filters.sort && filters?.sort.asc) &&
                    prevFilters?.target === filters.target))
        ) {
            if (onScrollEnd)
                void onScrollEnd({
                    setLoading,
                    filters,
                    addToList: false,
                    desiredSize: values.length,
                });
        }
    }, [filters, prevFilters, values]);

    useEffect(() => {
        if (onScrollEnd)
            void onScrollEnd({
                setLoading,
                filters,
                addToList: false,
            });
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
                    <TransitionText
                        Icon={
                            <div style={{ marginTop: '.25rem' }}>
                                <ChevronLeft />
                            </div>
                        }
                        style={styles.nuggListTitle}
                        text={ucFirst(viewing)}
                        transitionText="Go back"
                        onClick={() => {
                            NuggDexState.dispatch.setSearchFilters({
                                target: undefined,
                                searchValue: '',
                                sort: {
                                    asc: true,
                                    by: 'id',
                                },
                            });
                            NuggDexState.dispatch.setViewing('home');
                        }}
                    />
                )}
                <InfiniteList
                    style={{ zIndex: 0, overflow: 'hidden', position: 'relative' }}
                    data={values}
                    RenderItem={NuggListRenderItem}
                    loading={loading}
                    onScrollEnd={_onScrollEnd}
                    action={onClick}
                    extraData={undefined}
                    itemHeight={210}
                    animationToggle={animationToggle}
                />
            </animated.div>
        </div>
    );
};

export default React.memo(NuggList);
