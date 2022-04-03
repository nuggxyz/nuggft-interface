import React, {
    CSSProperties,
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
import { t } from '@lingui/macro';

import TransitionText from '@src/components/general/Texts/TransitionText/TransitionText';
import AppState from '@src/state/app';
import InfiniteList from '@src/components/general/List/InfiniteList';
import client from '@src/client';
import { ListData, SearchView } from '@src/client/interfaces';
import formatSearchFilter from '@src/client/formatters/formatSearchFilter';
import { isUndefinedOrNullOrNotFunction } from '@src/lib';
import usePrevious from '@src/hooks/usePrevious';

import NuggListRenderItem from './NuggListRenderItem';
import styles from './NuggDexComponents.styles';

export type NuggListOnScrollEndProps = {
    setLoading?: React.Dispatch<SetStateAction<boolean>>;
    sort?: 'asc' | 'desc';
    searchValue?: string;
    addToList?: boolean;
    desiredSize?: number;
};

export type NuggListProps = {
    type?: SearchView;
    style: CSSProperties | UseSpringProps;
    values: ListData[];
    animationToggle?: boolean;
    onScrollEnd?: ({
        setLoading,
        sort,
        searchValue,
        addToList,
        desiredSize,
    }: NuggListOnScrollEndProps) => Promise<void> | (() => void);
};

const NuggList: FunctionComponent<NuggListProps> = ({
    style,
    values,
    onScrollEnd,
    animationToggle,
    type,
}) => {
    const target = client.live.searchFilter.target();
    const sort = client.live.searchFilter.sort();
    const searchValue = client.live.searchFilter.searchValue();

    const prevTarget = usePrevious(target);
    const prevSort = usePrevious(sort);
    const prevSearchValue = usePrevious(searchValue);

    const screenType = AppState.select.screenType();
    const viewing = client.live.searchFilter.viewing();

    const [loading, setLoading] = useState(false);
    const routeTo = client.mutate.routeTo();

    const onClick = useCallback((item: typeof values[0]) => {
        batch(() => {
            routeTo(item?.id, true);
        });
    }, []);

    const _onScrollEnd = useCallback(
        ({ addToList, desiredSize }: { addToList: boolean; desiredSize?: number }) => {
            if (onScrollEnd)
                void onScrollEnd({
                    setLoading,
                    searchValue,
                    sort: sort?.direction,
                    addToList,
                    desiredSize,
                });
        },
        [searchValue, sort, values],
    );

    useEffect(() => {
        if (
            !isUndefinedOrNullOrNotFunction(onScrollEnd) &&
            (!type || target === type) &&
            (prevSearchValue !== searchValue ||
                searchValue !== '' ||
                ((prevSort && prevSort.direction === 'asc') !==
                    (sort && sort.direction === 'asc') &&
                    prevTarget === target))
        ) {
            // @danny7even i think i screwed up the logic above... have to have this commented out or the
            // whole app crashes when you try to scroll on all nuggs
            // if (onScrollEnd)
            //     void onScrollEnd({
            //         setLoading,
            //         sort: sort?.direction === 'asc' ? 'asc' : 'desc',
            //         searchValue,
            //         addToList: false,
            //         desiredSize: values.length,
            //     });
        }
    }, [target, prevTarget, type, sort, searchValue, prevSort, prevSearchValue, values]);

    useEffect(() => {
        if (onScrollEnd)
            void onScrollEnd({
                setLoading,
                sort: sort?.direction === 'asc' ? 'asc' : 'desc',
                searchValue,
                addToList: false,
            });
    }, []);

    const updateSearchFilterTarget = client.mutate.updateSearchFilterTarget();
    const updateSearchFilterViewing = client.mutate.updateSearchFilterViewing();
    const updateSearchFilterSort = client.mutate.updateSearchFilterSort();
    const updateSearchFilterSearchValue = client.mutate.updateSearchFilterSearchValue();

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
                {/* {screenType !== 'phone' && ( */}
                <TransitionText
                    Icon={
                        <div style={{ marginTop: '.25rem' }}>
                            <ChevronLeft />
                        </div>
                    }
                    style={styles.nuggListTitle}
                    text={formatSearchFilter(viewing)}
                    transitionText={t`Go back`}
                    onClick={() => {
                        updateSearchFilterTarget(undefined);
                        updateSearchFilterViewing(SearchView.Home);
                        updateSearchFilterSort(undefined);
                        updateSearchFilterSearchValue(undefined);
                    }}
                />
                {/* )} */}
                <InfiniteList
                    id="nugg-list"
                    style={{
                        zIndex: 0,
                        overflow: 'hidden',
                        position: 'relative',
                        ...(screenType === 'phone' && { width: '100%' }),
                    }}
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
