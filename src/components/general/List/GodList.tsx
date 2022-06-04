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
import { animated } from '@react-spring/web';

import Loader from '@src/components/general/Loader/Loader';
import { range } from '@src/lib';
import usePrevious from '@src/hooks/usePrevious';

import styles from './List.styles';

export interface GodListRenderItemProps<T, B, A> {
    item?: T;
    visible?: boolean;
    extraData?: B;
    action?: (arg?: A) => void;
    onScrollEnd?: ({ addToList }: { addToList: boolean }) => void;
    index?: number;
    rootRef?: LegacyRef<HTMLDivElement>;
    selected?: boolean;
    style?: CSSProperties;
}

// const fast = { tension: 1200, friction: 40 };
// const slow = { mass: 10, tension: 200, friction: 200 };
// const trans = (x: number, y: number) => `translate3d(${x}px,${y}px,0)`;

export interface GodListProps<T, B, A> {
    id?: string;
    data: T[];
    RenderItem: FunctionComponent<GodListRenderItemProps<T, B, A>>;
    loading?: boolean;
    extraData: B;
    action?: (arg?: A) => void;
    onScrollEnd?: ({ addToList }: { addToList: boolean }) => void;
    label?: string;
    border?: boolean;
    horizontal?: boolean;
    style?: CSSProperties;
    onScroll?: (e: React.UIEvent<HTMLDivElement, UIEvent>, direction: boolean) => any;
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
    mobileFluid?: boolean;
    faded?: boolean;
    displacement?: number;
    dadRef?: React.RefObject<HTMLDivElement> | null;
    noOverflow?: boolean;
}

const GodList = <T, B, A>({
    // id,
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
    faded = false,
    squishFactor = 1,
    offsetListRef = false,
    displacement = 0,
    screenHeight = 0,
    mobileFluid = false,
    noOverflow = false,
}: // dadRef = null,
GodListProps<T, B, A>) => {
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
        return Math.max(Math.floor(scrollTop / itemHeight) - displacement, 0);
    }, [scrollTop, itemHeight, displacement]);

    const endIndex = useMemo(() => {
        const check = Math.min(startIndex + interval, Math.max(0, data.length - 1));
        if (!mobileFluid) return check;
        return Math.min(
            check,
            scrollTop + windowHeight === 0 ? 0 : Math.ceil((scrollTop + windowHeight) / itemHeight),
        );
    }, [scrollTop, data, windowHeight, itemHeight, startIndex, interval, mobileFluid]);

    const prevEnd = usePrevious(endIndex);

    const items = React.useMemo(() => range(startIndex, endIndex), [startIndex, endIndex]);

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
    // console.log({ items, data, startIndex, endIndex });

    const [uno, uno_i, uno_v] = React.useMemo(() => {
        const yeh = items.find((x) => x % 7 === 0) as number;
        const checker = items.indexOf(yeh);
        const visible = (checker >= 3 && checker < 6 && checker !== -1) || yeh < 3;
        return [data[yeh], yeh, visible];
    }, [data, items]);

    const [dos, dos_i, dos_v] = React.useMemo(() => {
        const yeh = items.find((x) => x % 7 === 1) as number;
        const checker = items.indexOf(yeh);
        const visible = (checker >= 3 && checker < 6 && checker !== -1) || yeh < 3;
        return [data[yeh], yeh, visible];
    }, [data, items]);

    const [tres, tres_i, tres_v] = React.useMemo(() => {
        const yeh = items.find((x) => x % 7 === 2) as number;
        const checker = items.indexOf(yeh);
        const visible = (checker >= 3 && checker < 6 && checker !== -1) || yeh < 3;
        return [data[yeh], yeh, visible];
    }, [data, items]);

    const [qu, qu_i, qu_v] = React.useMemo(() => {
        const yeh = items.find((x) => x % 7 === 3) as number;
        const checker = items.indexOf(yeh);
        const visible = checker >= 3 && checker < 6 && checker !== -1;
        return [data[yeh], yeh, visible];
    }, [data, items]);

    const [cin, cin_i, cin_v] = React.useMemo(() => {
        const yeh = items.find((x) => x % 7 === 4) as number;
        const checker = items.indexOf(yeh);
        const visible = checker >= 3 && checker < 6 && checker !== -1;
        return [data[yeh], yeh, visible];
    }, [data, items]);

    const [sei, sei_i, sei_v] = React.useMemo(() => {
        const yeh = items.find((x) => x % 7 === 5) as number;
        const checker = items.indexOf(yeh);
        const visible = checker >= 3 && checker < 6 && checker !== -1;
        return [data[yeh], yeh, visible];
    }, [data, items]);

    const [ses, ses_i, ses_v] = React.useMemo(() => {
        const yeh = items.find((x) => x % 7 === 6) as number;
        const checker = items.indexOf(yeh);
        const visible = checker >= 3 && checker < 6 && checker !== -1;
        return [data[yeh], yeh, visible];
    }, [data, items]);

    const genid = React.useId();

    const _onScroll = useCallback(
        (ev: React.UIEvent<HTMLDivElement, UIEvent>) => {
            // const elementOffset = $('#my-element').offset().top;
            // const distance = ;
            const st = ev.currentTarget.scrollTop;

            if (offsetListRef) {
                // console.log({ ...ev.currentTarget });
                const ofs = windowRef?.current?.offsetTop || 0;
                const offset = ofs;

                setScrollTopOffset(offset);
            }

            const up = scrollTop < st;

            setTrueScrollTop(st);

            if (onScroll) onScroll(ev, up);
        },
        [onScroll, offsetListRef, setScrollTopOffset, setTrueScrollTop, scrollTop],
    );

    // console.log({ scrollTop, scrollTopOffset });

    // const prevScrollTop = usePrevious(scrollTop);

    // const [trail, api] = useTrail(8, () => ({
    //     from: {
    //         y: 0,
    //     },
    //     // config: i === 0 ? packages.spring.config.molasses : packages.spring.config.default,
    //     config: { tension: 5000, mass: 10, friction: 100 },
    //     // config: {
    //     //     mass: 100,
    //     //     friction: 50,
    //     // },
    // }));

    // console.log(trail, dos_i);

    // const [force, setForce] = React.useState(0);

    // const prevForce = usePrevious(force);

    // useEffect(() => {
    //     if (prevForce !== force) {
    //         api.start(() => {
    //             const abc = {
    //                 y: force,
    //             };
    //             return abc;
    //         });
    //     }
    // }, [force, api, prevForce]);

    // useEffect(() => {
    //     if (prevScrollTop !== undefined) {
    //         setForce(
    //             Math.floor(
    //                 scrollTop > prevScrollTop
    //                     ? Math.min(scrollTop - prevScrollTop, 120) * 5
    //                     : Math.max(scrollTop - prevScrollTop, -120) * 5,
    //             ) * -1,
    //         );
    //     }
    // }, [prevScrollTop, scrollTop, api, force]);

    useEffect(() => {
        if (coreRef && coreRef.current) {
            // @ts-ignore
            coreRef.current.onscroll = _onScroll;
            // console.log('yo', { ...coreRef }, coreRef.current.onscroll);
        } else if (windowRef && windowRef.current) {
            // @ts-ignore
            windowRef.current.onscroll = _onScroll;
        }
    }, [coreRef, _onScroll]);

    // const cheeeeck = React.useCallback(
    //     (visible: boolean, index: number) => {
    //         return {
    //             '--a': visible
    //                 ? trail[(items.indexOf(index) || 2) - 2].y.to((y) => `${y}px`)
    //                 : `0px`,
    //             '--b': visible
    //                 ? trail[(items.indexOf(index) || 1) - 1].y.to((y) => `${y}px`)
    //                 : `0px`,
    //         };
    //     },
    //     [trail, items],
    // );

    return (
        <>
            <div
                id={`${genid}wrapper-horiz`}
                ref={windowRef}
                style={{
                    ...styles.container,
                    ...(border && styles.border),
                    ...(horizontal && styles.horizontal),
                    marginTop: startGap,
                    marginBottom: startGap,
                    ...style,
                    ...(!disableScroll
                        ? { overflow: 'scroll' }
                        : { overflow: noOverflow ? undefined : 'visible' }),
                    justifySelf: 'flex-start',
                    ...(faded && {
                        WebkitMaskImage: 'linear-gradient(0deg, #000 95%, transparent)',
                    }),
                    position: 'relative',
                    height: `${innerHeight}px`,
                    width: '100%',

                    '--i': itemHeight,
                }}
                onScroll={_onScroll}
            >
                {/* {startGap && startGap !== 0 && (
                    <div style={{ width: '100%', marginTop: startGap }} />
                )} */}

                {/* {dadRef && dadRef.current && (
                    <div style={{ width: '100%', marginTop: dadRef.current.offsetTop - 300 }} />
                )} */}

                <animated.div
                    id={`${genid}1`}
                    style={{
                        transform: `translate(0px, ${uno_i * itemHeight}px)`,
                        height: `var(--i)`,
                        opacity: uno ? 1 : 0,
                        position: 'absolute',
                        width: '100%',
                        pointerEvents: uno ? 'auto' : 'none',
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
                </animated.div>
                <animated.div
                    id={`${genid}2`}
                    style={{
                        transform: `translate(0px, ${dos_i * itemHeight}px)`,
                        height: `var(--i)`,
                        opacity: dos ? 1 : 0,
                        position: 'absolute',
                        width: '100%',
                        pointerEvents: dos ? 'auto' : 'none',
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
                </animated.div>
                <animated.div
                    id={`${genid}3`}
                    style={{
                        transform: `translate(0px, ${tres_i * itemHeight}px)`,
                        opacity: tres ? 1 : 0,
                        position: 'absolute',
                        width: '100%',
                        height: `var(--i)`,
                        WebkitScrollSnapType: 'y mandatory',
                        pointerEvents: tres ? 'auto' : 'none',
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
                </animated.div>
                <animated.div
                    id={`${genid}4`}
                    style={{
                        transform: `translate(0px, ${qu_i * itemHeight}px)`,
                        opacity: qu ? 1 : 0,
                        position: 'absolute',
                        width: '100%',
                        height: `var(--i)`,
                        pointerEvents: qu ? 'auto' : 'none',

                        // ...cheeeeck(qu_v, qu_i),
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
                </animated.div>
                <animated.div
                    id={`${genid}5`}
                    style={{
                        transform: `translate(0px, ${cin_i * itemHeight}px)`,
                        opacity: cin ? 1 : 0,
                        position: 'absolute',
                        width: '100%',
                        height: `var(--i)`,
                        pointerEvents: cin ? 'auto' : 'none',

                        // ...cheeeeck(cin_v, cin_i),
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
                </animated.div>
                <animated.div
                    id={`${genid}6`}
                    style={{
                        opacity: sei ? 1 : 0,
                        position: 'absolute',
                        transform: `translate(0px, ${sei_i * itemHeight}px)`,
                        width: '100%',
                        height: `var(--i)`,
                        pointerEvents: sei ? 'auto' : 'none',

                        // ...cheeeeck(sei_v, sei_i),
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
                </animated.div>
                <animated.div
                    id={`${genid}7`}
                    style={{
                        transform: `translate(0px, ${ses_i * itemHeight}px)`,
                        opacity: ses ? 1 : 0,
                        position: 'absolute',
                        width: '100%',
                        height: `var(--i)`,
                        pointerEvents: ses ? 'auto' : 'none',

                        // ...cheeeeck(ses_v, ses_i),
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
                </animated.div>
                {loading && <Loading />}

                {endGap && endGap !== 0 && <div style={{ width: '100%', marginTop: endGap }} />}
            </div>
        </>
    );
};

export default React.memo(GodList) as typeof GodList;
