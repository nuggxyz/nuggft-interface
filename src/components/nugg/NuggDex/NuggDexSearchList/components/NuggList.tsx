import React, { CSSProperties, FunctionComponent, SetStateAction, useCallback } from 'react';
import { Promise } from 'bluebird';
import { animated, UseSpringProps } from '@react-spring/web';
import { ChevronLeft } from 'react-feather';
import { t } from '@lingui/macro';

import TransitionText from '@src/components/general/Texts/TransitionText/TransitionText';
import useDimentions from '@src/client/hooks/useDimentions';
import client from '@src/client';
import { SearchView } from '@src/client/interfaces';
import formatSearchFilter from '@src/client/formatters/formatSearchFilter';
import useViewingNugg from '@src/client/hooks/useViewingNugg';
import InfiniteList from '@src/components/general/List/InfiniteList';
import useMobileViewingNugg from '@src/client/hooks/useMobileViewingNugg';

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
    tokenIds: TokenId[];
    cardType: 'recent' | 'all' | 'swap';
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
    tokenIds,
    onScrollEnd,
    animationToggle,
    interval = 25,
    cardType,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    type,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    horribleMFingHack2 = false,
}) => {
    const { screen: screenType, isPhone } = useDimentions();

    const viewing = client.live.searchFilter.viewing();

    const { gotoViewingNugg } = useViewingNugg();
    const { goto } = useMobileViewingNugg();

    const onClick = useCallback(
        (item: TokenId) => {
            if (isPhone) goto(item);
            else gotoViewingNugg(item);
        },
        [gotoViewingNugg, goto, isPhone],
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
                    data={tokenIds}
                    RenderItem={NuggListRenderItem}
                    loading={false}
                    interval={interval}
                    onScrollEnd={_onScrollEnd}
                    action={onClick}
                    extraData={{ cardType }}
                    itemHeight={210}
                    animationToggle={animationToggle}
                />
            </animated.div>
        </div>
    );
};

export default React.memo(NuggList);
