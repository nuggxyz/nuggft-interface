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
import NuggListRenderItemMobile, {
    NuggListRenderItemMobileBig,
} from '@src/components/mobile/NuggListRenderItemMobile';
import BradPitt from '@src/components/mobile/BradPitt';
import lib from '@src/lib';

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

    // const dat = React.useMemo(() => {
    //     if (!isPhone) return [];
    //     const abc: [TokenId | undefined, TokenId | undefined][] = [];
    //     for (let i = 0; i < tokenIds.length; i += 2) {
    //         const tmp: [TokenId | undefined, TokenId | undefined] = [undefined, undefined];
    //         tmp[0] = tokenIds[i];
    //         if (i + 1 < tokenIds.length) tmp[1] = tokenIds[i + 1];
    //         abc.push(tmp);
    //     }
    //     return abc;
    // }, [tokenIds, isPhone]);

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

    const fullRef = React.useRef(null);

    const ider = React.useId();

    return (
        <div
            style={{
                ...styles.nuggListContainer,
                ...(screenType === 'phone' && { position: 'relative', overflow: undefined }),
            }}
        >
            <animated.div
                ref={fullRef}
                style={{
                    ...styles.nuggListDefault,
                    ...style,
                    ...(screenType === 'phone' && { overflow: 'auto' }),
                }}
            >
                {/* {screenType !== 'phone' && ( */}
                <TransitionText
                    Icon={
                        <div style={{ marginTop: '.25rem' }}>
                            <ChevronLeft />
                        </div>
                    }
                    style={{
                        ...styles.nuggListTitle,
                        ...(isPhone && { top: 63 }),
                        ...(isPhone && { WebkitBackdropFilter: 'blur(30px)' }),
                        ...(isPhone && { background: lib.colors.transparentWhite }),
                    }}
                    text={isPhone ? 'Go back' : formatSearchFilter(viewing)}
                    transitionText={t`Go back`}
                    onClick={() => {
                        updateSearchFilterTarget(undefined);
                        updateSearchFilterViewing(SearchView.Home);
                        updateSearchFilterSort(undefined);
                        updateSearchFilterSearchValue(undefined);
                    }}
                />

                {!isPhone ? (
                    <InfiniteList
                        id={`${ider}infinite`}
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
                        action={isPhone ? undefined : onClick}
                        extraData={{ cardType }}
                        itemHeight={210}
                        animationToggle={animationToggle}
                    />
                ) : (
                    <BradPitt
                        id={`${ider}brad`}
                        listStyle={{
                            overflow: undefined,
                            position: 'relative',
                            justifyContent: 'flex-start',
                            ...(screenType === 'phone' && { width: '100%' }),
                        }}
                        style={{
                            width: '100%',
                            // padding: '0 1rem 1rem 1.5rem',
                        }}
                        Title={React.memo(() => (
                            <div />
                        ))}
                        data={tokenIds}
                        RenderItemSmall={NuggListRenderItemMobile}
                        RenderItemBig={NuggListRenderItemMobileBig}
                        interval={interval}
                        disableScroll
                        coreRef={fullRef}
                        onScrollEnd={_onScrollEnd}
                        extraData={{ cardType }}
                        itemHeightBig={340}
                        itemHeightSmall={160}
                        startGap={110}
                        floaterWrapperStyle={{
                            position: 'absolute',
                            top: 63,
                            right: '1rem',
                        }}
                        floaterColor={lib.colors.transparentWhite}
                    />
                )}
            </animated.div>
        </div>
    );
};

export default React.memo(NuggList);
