import React, { CSSProperties, FunctionComponent, SetStateAction, useCallback } from 'react';
import { Promise } from 'bluebird';
import { animated, UseSpringProps } from '@react-spring/web';
import { ChevronLeft } from 'react-feather';
import { batch } from 'react-redux';
import { t } from '@lingui/macro';

import TransitionText from '@src/components/general/Texts/TransitionText/TransitionText';
import useDimentions from '@src/client/hooks/useDimentions';
import InfiniteList from '@src/components/general/List/InfiniteList';
import client from '@src/client';
import { ListData, SearchView } from '@src/client/interfaces';
import formatSearchFilter from '@src/client/formatters/formatSearchFilter';
import useViewingNugg from '@src/client/hooks/useViewingNugg';

import NuggListRenderItem from './NuggListRenderItem';
import styles from './NuggDexComponents.styles';

export type NuggListOnScrollEndProps = {
    setLoading?: React.Dispatch<SetStateAction<boolean>>;
    sort?: 'asc' | 'desc';
    searchValue?: string;
    addToList?: boolean;
    desiredSize?: number;
    horribleMFingHack?: () => void;
};

export type NuggListProps = {
    type?: SearchView;
    style: CSSProperties | UseSpringProps;
    values: ListData[];
    animationToggle?: boolean;
    horribleMFingHack2?: boolean;
    interval: number;

    onScrollEnd?: ({
        setLoading,
        sort,
        searchValue,
        addToList,
        desiredSize,
        horribleMFingHack,
    }: NuggListOnScrollEndProps) => Promise<void> | void;
};

const NuggList: FunctionComponent<NuggListProps> = ({
    style,
    values,
    onScrollEnd,
    animationToggle,
    interval = 25,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    type,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    horribleMFingHack2 = false,
}) => {
    const { screen: screenType } = useDimentions();
    const viewing = client.live.searchFilter.viewing();

    const { gotoViewingNugg } = useViewingNugg();

    const onClick = useCallback(
        (item: typeof values[number]) => {
            batch(() => {
                gotoViewingNugg(item.id);
            });
        },
        [gotoViewingNugg],
    );

    const _onScrollEnd = useCallback(() => {
        if (onScrollEnd) void onScrollEnd({});
    }, [onScrollEnd]);

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
                    loading={false}
                    interval={interval}
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
