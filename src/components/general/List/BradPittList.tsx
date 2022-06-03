import React, { CSSProperties, LegacyRef } from 'react';
import { IoGridOutline, IoLogoInstagram } from 'react-icons/io5';

import useSquishedListData from '@src/client/hooks/useSquishedListData';
import GodList from '@src/components/general/List/GodList';
import lib from '@src/lib';
import Loader from '@src/components/general/Loader/Loader';
import DualToggler from '@src/components/general/Buttons/DualToggler/DualToggler';

export interface GodListRenderItemProps<T, B, A> {
    item?: T | [T | undefined, T | undefined];
    visible?: boolean;
    extraData?: B;
    action?: (arg: A) => void;
    onScrollEnd?: ({ addToList }: { addToList: boolean }) => void;
    index?: number;
    rootRef?: LegacyRef<HTMLDivElement>;
    selected?: boolean;
    style?: CSSProperties;
}

export interface GodListRenderItemBig<T, B, A> extends GodListRenderItemProps<T, B, A> {
    item?: T;
}

export interface GodListRenderItemSmall<T, B, A> extends GodListRenderItemProps<T, B, A> {
    item?: [T | undefined, T | undefined];
}

interface Props<T, B, A> {
    id?: string;
    data: T[];
    defaultActiveIndex?: 0 | 1;

    RenderItemSmall: React.FunctionComponent<GodListRenderItemSmall<T, B, A>>;
    RenderItemBig: React.FunctionComponent<GodListRenderItemBig<T, B, A>>;
    itemHeightBig: number;
    itemHeightSmall: number;
    disableScroll: boolean;
    Title?: React.FunctionComponent;
    loading?: boolean;
    extraData: B;
    action?: (arg: A) => void;
    onScrollEnd?: ({ addToList }: { addToList: boolean }) => void;
    label?: string;
    border?: boolean;
    horizontal?: boolean;
    style?: React.CSSProperties;
    onScroll?: () => void;
    listEmptyText?: string;
    labelStyle?: React.CSSProperties;
    listEmptyStyle?: React.CSSProperties;
    loaderColor?: string;
    listStyle?: React.CSSProperties;
    interval?: number;
    startGap?: number;
    endGap?: number;
    headerStyle?: React.CSSProperties;
    floaterWrapperStyle?: React.CSSProperties;

    floaterColor?: string;
    useBradRef?: boolean;

    externalScrollTop?: number;
    scrollTopOffset?: number;
    screenHeight?: number;
    coreRef?: React.RefObject<HTMLDivElement> | null;
    offsetListRef?: boolean;
    LIST_PADDING?: number;
    mobileFluid?: boolean;
    faded?: boolean;
}

// interface CustomGodListProps<T, B, A> extends GodListProps<T, B, A> {
//     RenderItem:
//         | React.FunctionComponent<GodListRenderItemSmall<T, B, A>>
//         | React.FunctionComponent<GodListRenderItemBig<T, B, A>>;
// }

const BradPittList = <T, B, A>({
    id = 'NEEDS_AN_ID',
    data,
    RenderItemSmall,
    RenderItemBig,
    itemHeightBig,
    itemHeightSmall,
    defaultActiveIndex = 0,
    disableScroll,
    listStyle,
    style,
    Title,
    headerStyle,
    offsetListRef = true,
    coreRef,
    useBradRef = false,
    floaterWrapperStyle,
    floaterColor = lib.colors.transparentWhite,
    startGap,
    endGap,
    ...props
}: Props<T, B, A>) => {
    const squishedData = useSquishedListData(data);

    const [activeIndex, setActiveIndex] = React.useState<0 | 1 | undefined>(defaultActiveIndex);
    const [preActiveIndex, setPreActiveIndex] = React.useState<0 | 1>(defaultActiveIndex);

    const [, startTansition] = React.useTransition();

    const brad = React.useRef<HTMLDivElement>(null);

    const toggleActiveIndex = React.useCallback(
        (to: 0 | 1) => {
            setPreActiveIndex(to);
            setActiveIndex(undefined);
            setTimeout(() => {
                startTansition(() => {
                    setActiveIndex(to);
                    setPreActiveIndex(to);
                });
            }, 500);
            return undefined;
        },
        [startTansition, setActiveIndex, setPreActiveIndex],
    );
    return (
        <div
            style={{ ...style, ...(useBradRef && { overflow: 'scroll' }) }}
            id={`${id}B-R-A-D`}
            ref={brad}
        >
            <div
                style={{
                    ...headerStyle,
                    display: 'flex',
                    justifyContent: 'space-between',
                    justifySelf: 'center',
                }}
            >
                {Title && <Title />}

                <DualToggler
                    LeftIcon={IoLogoInstagram}
                    RightIcon={IoGridOutline}
                    toggleActiveIndex={toggleActiveIndex}
                    activeIndex={preActiveIndex}
                    floaterStyle={{ background: floaterColor }}
                    containerStyle={floaterWrapperStyle}
                />
            </div>
            {squishedData.length > 0 && activeIndex !== undefined ? (
                activeIndex === 0 ? (
                    <GodList
                        {...props}
                        startGap={startGap}
                        id={`nugg-list1${id}`}
                        style={listStyle}
                        data={data}
                        RenderItem={RenderItemBig}
                        extraData={undefined}
                        loading={false}
                        action={undefined}
                        itemHeight={itemHeightBig}
                        animationToggle={false}
                        disableScroll={disableScroll}
                        coreRef={useBradRef ? brad : coreRef}
                        offsetListRef={offsetListRef && !!(useBradRef ? brad : coreRef)}
                        endGap={endGap}
                    />
                ) : (
                    <GodList
                        {...props}
                        startGap={startGap}
                        id={`nugg-list2${id}`}
                        style={listStyle}
                        data={squishedData}
                        RenderItem={RenderItemSmall}
                        loading={false}
                        extraData={undefined}
                        action={undefined}
                        itemHeight={itemHeightSmall}
                        animationToggle={false}
                        disableScroll={disableScroll}
                        squishFactor={0.5}
                        offsetListRef={offsetListRef && !!(useBradRef ? brad : coreRef)}
                        coreRef={useBradRef ? brad : coreRef}
                        endGap={endGap}
                    />
                )
            ) : (
                <div
                    style={{
                        height: '300px',
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    <Loader color={lib.colors.transparentWhite} />
                </div>
            )}
        </div>
    );
};

export default React.memo(BradPittList) as typeof BradPittList;
