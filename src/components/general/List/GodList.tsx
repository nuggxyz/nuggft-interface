import React, {
    CSSProperties,
    FunctionComponent,
    LegacyRef,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';

import Loader from '@src/components/general/Loader/Loader';
import { range } from '@src/lib';
import usePrevious from '@src/hooks/usePrevious';

import styles from './List.styles';

export interface GodListRenderItemProps<T, B, A> {
    item: T;
    visible?: boolean;
    extraData: B;
    action?: (arg: A) => void;
    onScrollEnd?: ({ addToList }: { addToList: boolean }) => void;
    index: number;
    rootRef?: LegacyRef<HTMLDivElement>;
    selected?: boolean;
    style?: CSSProperties;
}

export interface GodListProps<T, B, A> {
    id?: string;
    data: T[];
    RenderItem: FunctionComponent<GodListRenderItemProps<T, B, A>>;
    loading?: boolean;
    extraData: B;
    action?: (arg: A) => void;
    onScrollEnd?: ({ addToList }: { addToList: boolean }) => void;
    label?: string;
    border?: boolean;
    horizontal?: boolean;
    style?: CSSProperties;
    onScroll?: () => void;
    selected?: unknown;
    listEmptyText?: string;
    labelStyle?: CSSProperties;
    listEmptyStyle?: CSSProperties;
    loaderColor?: string;
    itemHeight: number;
    animationToggle?: boolean;
    TitleButton?: FunctionComponent;
    titleLoading?: boolean;
    interval?: number;
    startGap?: number;
    endGap?: number;
    deep?: boolean;
    skipSelectedCheck?: boolean;
    disableScroll?: boolean;
    squishFactor?: number;
    initialIndex?: number;

    externalScrollTop?: number;
    scrollTopOffset?: number;
    screenHeight?: number;
    coreRef?: React.RefObject<HTMLDivElement> | null;
    offsetListRef?: boolean;
    LIST_PADDING?: number;
}

const GodList = <T, B, A>({
    id,
    data,
    RenderItem,
    loading = false,
    extraData,
    action,
    onScrollEnd,
    border = false,
    horizontal = false,
    style,
    onScroll,

    loaderColor,
    itemHeight = 10,
    animationToggle,

    startGap,
    endGap,
    disableScroll = false,
    coreRef = null,

    squishFactor = 1,
    offsetListRef = false,
    screenHeight = 0,
}: GodListProps<T, B, A>) => {
    const interval = 7;

    const windowRef = useRef<HTMLDivElement>(null);

    const [windowHeight, setWindowHeight] = useState(0);

    useEffect(() => {
        if (coreRef?.current) {
            let check = coreRef.current.scrollHeight;
            if (offsetListRef && windowRef?.current) check -= windowRef.current.offsetHeight;
            setWindowHeight(check);
        } else if (windowRef.current) {
            setWindowHeight(windowRef.current.scrollHeight);
        }
    }, [coreRef, windowRef, animationToggle, offsetListRef]);

    const [trueScrollTop, setTrueScrollTop] = useState(0);
    const [scrollTopOffset, setScrollTopOffset] = useState(0);

    const scrollTop = useMemo(
        () =>
            scrollTopOffset === 0
                ? trueScrollTop + screenHeight - (startGap || 0)
                : trueScrollTop - scrollTopOffset - (startGap || 0),
        [trueScrollTop, scrollTopOffset, startGap, screenHeight],
    );

    const innerHeight = useMemo(
        () => data.length * itemHeight * squishFactor,
        [data, itemHeight, squishFactor],
    );

    const startIndex = useMemo(() => {
        return Math.max(Math.floor(scrollTop / itemHeight), 0);
    }, [scrollTop, itemHeight]);

    const endIndex = useMemo(() => {
        const check = Math.min(
            Math.min(startIndex + interval, Math.max(0, data.length - 1)),
            scrollTop + windowHeight === 0 ? 0 : Math.ceil((scrollTop + windowHeight) / itemHeight),
        );
        return check;
    }, [scrollTop, data, windowHeight, itemHeight, startIndex, interval]);

    // const prevStart = usePrevious(startIndex);
    const prevEnd = usePrevious(endIndex);
    // const prevData = usePrevious(data);

    const items = React.useMemo(() => range(startIndex, endIndex), [startIndex, endIndex]);

    // React.useEffect(() => {
    //     if (items[0] !== data[0])
    // }, [])

    // console.log({ interval, endIndex, startIndex, scrollTop, items, data });

    const [lastGrabValue, setLastGrabValue] = React.useState<number>(0);

    const lastGrab = React.useCallback(
        (end: number) => {
            if (onScrollEnd) {
                const floor = Math.floor(end / (interval - 1));
                if (
                    Object.values(items).length !== 0 &&
                    Object.values(items).length * itemHeight + scrollTop >= innerHeight &&
                    prevEnd !== end &&
                    (lastGrabValue === 0 || floor !== lastGrabValue) &&
                    !loading
                ) {
                    setLastGrabValue(floor);
                    void onScrollEnd({ addToList: true });
                }
            }
        },
        [
            scrollTop,
            items,
            innerHeight,
            onScrollEnd,
            prevEnd,
            loading,
            itemHeight,
            interval,
            lastGrabValue,
        ],
    );

    useEffect(() => {
        lastGrab(endIndex);
    }, [lastGrab, endIndex]);

    const _onScroll = useCallback(
        (ev: React.UIEvent<HTMLDivElement, UIEvent>) => {
            const st = ev.currentTarget.scrollTop;
            if (offsetListRef) {
                // st = windowRef.current.offsetTop - st;
                setScrollTopOffset(ev.currentTarget.offsetHeight || 0);
            }

            setTrueScrollTop(st);
            if (onScroll) onScroll();
        },
        [onScroll, offsetListRef, setScrollTopOffset, setTrueScrollTop],
    );

    useEffect(() => {
        if (coreRef && coreRef.current) {
            // @ts-ignore
            coreRef.current.onscroll = _onScroll;
            // coreRef.current.scrollTo({ top: 0 });
        } else if (windowRef && windowRef.current) {
            // @ts-ignore
            windowRef.current.onscroll = _onScroll;
        }
    }, [coreRef, _onScroll]);

    const containerStyle = useMemo(() => {
        return {
            ...styles.container,
            ...(border && styles.border),
            ...(horizontal && styles.horizontal),
            ...style,
        };
    }, [border, horizontal, style]);

    const Loading = useCallback(
        () =>
            loading ? (
                <div
                    style={{
                        marginTop: '1rem',
                        position: 'absolute',
                        top: `${(endIndex + 1) * itemHeight}px`,
                        width: '100%',
                        height: `${itemHeight}px`,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    <Loader color={loaderColor || 'black'} />
                </div>
            ) : (
                <div />
            ),
        [loading, loaderColor, itemHeight, endIndex],
    );

    const [uno, uno_i, uno_v] = React.useMemo(() => {
        const yeh = items.find((x) => x % 7 === 0) as number;
        const checker = items.indexOf(yeh);
        const visible = checker < 4 && checker !== -1;
        return [data[yeh], yeh, visible];
    }, [data, items]);

    const [dos, dos_i, dos_v] = React.useMemo(() => {
        const yeh = items.find((x) => x % 7 === 1) as number;
        const checker = items.indexOf(yeh);
        const visible = checker < 4 && checker !== -1;
        return [data[yeh], yeh, visible];
    }, [data, items]);

    const [tres, tres_i, tres_v] = React.useMemo(() => {
        const yeh = items.find((x) => x % 7 === 2) as number;
        const checker = items.indexOf(yeh);
        const visible = checker < 4 && checker !== -1;
        return [data[yeh], yeh, visible];
    }, [data, items]);

    const [qu, qu_i, qu_v] = React.useMemo(() => {
        const yeh = items.find((x) => x % 7 === 3) as number;
        const checker = items.indexOf(yeh);
        const visible = checker < 4 && checker !== -1;
        return [data[yeh], yeh, visible];
    }, [data, items]);

    const [cin, cin_i, cin_v] = React.useMemo(() => {
        const yeh = items.find((x) => x % 7 === 4) as number;
        const checker = items.indexOf(yeh);
        const visible = checker < 4 && checker !== -1;
        return [data[yeh], yeh, visible];
    }, [data, items]);

    const [sei, sei_i, sei_v] = React.useMemo(() => {
        const yeh = items.find((x) => x % 7 === 5) as number;
        const checker = items.indexOf(yeh);
        const visible = checker < 4 && checker !== -1;
        return [data[yeh], yeh, visible];
    }, [data, items]);

    const [ses, ses_i, ses_v] = React.useMemo(() => {
        const yeh = items.find((x) => x % 7 === 6) as number;
        const checker = items.indexOf(yeh);
        const visible = checker < 3 && checker !== -1;
        return [data[yeh], yeh, visible];
    }, [data, items]);

    return (
        <>
            <div
                id={`${id || 0}God`}
                ref={windowRef}
                style={{
                    ...containerStyle,
                    ...(!disableScroll ? { overflow: 'scroll' } : { overflow: undefined }),
                    justifySelf: 'flex-start',
                }}
                onScroll={_onScroll}
            >
                {startGap && startGap !== 0 && (
                    <div style={{ width: '100%', marginTop: startGap }} />
                )}

                <div
                    style={{
                        position: 'relative',
                        height: `${innerHeight}px`,
                        width: '100%',
                    }}
                >
                    <div
                        // key={key(0)}
                        style={{
                            opacity: uno ? 1 : 0,

                            position: 'absolute',
                            transform: `translate(0px,${uno_i * itemHeight}px)`,
                            width: '100%',
                            height: `${itemHeight}px`,
                        }}
                    >
                        <RenderItem
                            visible={uno_v}
                            item={uno}
                            index={uno_i}
                            extraData={extraData}
                            action={action}
                            selected={false}
                        />
                    </div>
                    <div
                        // key={key(1)}
                        style={{
                            opacity: dos ? 1 : 0,
                            position: 'absolute',
                            transform: `translate(0px,${dos_i * itemHeight}px)`,
                            width: '100%',
                            height: `${itemHeight}px`,
                        }}
                    >
                        <RenderItem
                            visible={dos_v}
                            item={dos}
                            index={dos_i}
                            extraData={extraData}
                            action={action}
                            selected={false}
                        />
                    </div>
                    <div
                        // key={key(2)}
                        style={{
                            opacity: tres ? 1 : 0,

                            position: 'absolute',
                            transform: `translate(0px,${tres_i * itemHeight}px)`,
                            width: '100%',
                            height: `${itemHeight}px`,
                        }}
                    >
                        <RenderItem
                            visible={tres_v}
                            item={tres}
                            index={tres_i}
                            extraData={extraData}
                            action={action}
                            selected={false}
                        />
                    </div>
                    <div
                        // key={key(2)}
                        style={{
                            opacity: qu ? 1 : 0,

                            position: 'absolute',
                            transform: `translate(0px,${qu_i * itemHeight}px)`,
                            width: '100%',
                            height: `${itemHeight}px`,
                        }}
                    >
                        <RenderItem
                            visible={qu_v}
                            item={qu}
                            index={qu_i}
                            extraData={extraData}
                            action={action}
                            selected={false}
                        />
                    </div>
                    <div
                        // key={key(2)}
                        style={{
                            opacity: cin ? 1 : 0,
                            position: 'absolute',
                            transform: `translate(0px,${cin_i * itemHeight}px)`,
                            width: '100%',
                            height: `${itemHeight}px`,
                        }}
                    >
                        <RenderItem
                            visible={cin_v}
                            item={cin}
                            index={cin_i}
                            extraData={extraData}
                            action={action}
                            selected={false}
                        />
                    </div>
                    <div
                        // key={key(2)}
                        style={{
                            opacity: sei ? 1 : 0,

                            position: 'absolute',
                            transform: `translate(0px,${sei_i * itemHeight}px)`,
                            width: '100%',
                            height: `${itemHeight}px`,
                        }}
                    >
                        <RenderItem
                            visible={sei_v}
                            item={sei}
                            index={sei_i}
                            extraData={extraData}
                            action={action}
                            selected={false}
                        />
                    </div>
                    <div
                        // key={key(2)}
                        style={{
                            opacity: ses ? 1 : 0,
                            position: 'absolute',
                            transform: `translate(0px,${ses_i * itemHeight}px)`,
                            width: '100%',
                            height: `${itemHeight}px`,
                        }}
                    >
                        <RenderItem
                            visible={ses_v}
                            item={ses}
                            index={ses_i}
                            extraData={extraData}
                            action={action}
                            selected={false}
                        />
                    </div>
                </div>
                <Loading />

                {endGap && endGap !== 0 && <div style={{ width: '100%', marginTop: endGap }} />}
            </div>
        </>
    );
};

export default React.memo(GodList) as typeof GodList;
