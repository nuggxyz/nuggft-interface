import React from 'react';
import { IoGridOutline, IoLogoInstagram } from 'react-icons/io5';

import useSquishedListData from '@src/client/hooks/useSquishedListData';
import InfiniteList from '@src/components/general/List/InfiniteList';
import lib from '@src/lib';
import Loader from '@src/components/general/Loader/Loader';
import DualToggler from '@src/components/general/Buttons/DualToggler/DualToggler';

export interface InfiniteListRenderItemProps<T, B, A> {
    item: T | [T | undefined, T | undefined];
    extraData: B;
    action?: (arg: A) => void;
    onScrollEnd?: ({ addToList }: { addToList: boolean }) => void;
    index: number;
    rootRef?: React.LegacyRef<HTMLDivElement>;
    selected?: boolean;
    style?: React.CSSProperties;
}

export interface InfiniteListRenderItemBig<T, B, A> extends InfiniteListRenderItemProps<T, B, A> {
    item: T;
}

export interface InfiniteListRenderItemSmall<T, B, A> extends InfiniteListRenderItemProps<T, B, A> {
    item: [T | undefined, T | undefined];
}

interface Props<T, B, A> {
    id?: string;
    data: T[];
    RenderItemSmall: React.FunctionComponent<InfiniteListRenderItemSmall<T, B, A>>;
    RenderItemBig: React.FunctionComponent<InfiniteListRenderItemBig<T, B, A>>;
    itemHeightBig: number;
    itemHeightSmall: number;
    disableScroll: boolean;
    Title?: React.FunctionComponent;
    defaultActiveIndex?: 0 | 1;
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
    coreRef?: React.RefObject<HTMLDivElement>;
    useBradRef?: boolean;
}

// interface CustomInfiniteListProps<T, B, A> extends InfiniteListProps<T, B, A> {
//     RenderItem:
//         | React.FunctionComponent<InfiniteListRenderItemSmall<T, B, A>>
//         | React.FunctionComponent<InfiniteListRenderItemBig<T, B, A>>;
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
            {/* <div style={{ height: '100%', width: '100%', position: 'relative' }}> */}
            {squishedData.length > 0 && activeIndex !== undefined ? (
                // activeIndex === 1 - 2 &&
                activeIndex === 0 ? (
                    <InfiniteList
                        {...props}
                        startGap={startGap}
                        id={`nugg-list1${id}`}
                        style={listStyle}
                        skipSelectedCheck
                        data={data}
                        RenderItem={RenderItemBig}
                        loading={false}
                        action={undefined}
                        itemHeight={itemHeightBig}
                        animationToggle={false}
                        disableScroll={disableScroll}
                        coreRef={useBradRef ? brad : coreRef}
                        interval={3}
                        endGap={endGap}
                    />
                ) : (
                    <InfiniteList
                        {...props}
                        startGap={startGap}
                        id={`nugg-list2${id}`}
                        style={listStyle}
                        skipSelectedCheck
                        data={squishedData}
                        RenderItem={RenderItemSmall}
                        loading={false}
                        interval={50}
                        action={undefined}
                        itemHeight={itemHeightSmall}
                        animationToggle={false}
                        disableScroll={disableScroll}
                        squishFactor={0.5}
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
