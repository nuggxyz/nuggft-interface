/* eslint-disable react/jsx-no-bind */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { animated } from '@react-spring/web';

import { range } from '@src/lib';
import usePrevious from '@src/hooks/usePrevious';
import Text from '@src/components/general/Texts/Text/Text';
import Loader from '@src/components/general/Loader/Loader';

import styles from './List.styles';
import { GodListProps } from './GodList';

const GodListHorizontal = <T, B, A>({
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

    skipSelectedCheck,
    itemHeight: itemWidth = 10,
    animationToggle,

    startGap = 0,
    endGap,
    disableScroll = false,
    coreRef = null,
    faded = false,
    squishFactor = 1,
    offsetListRef = false,
    screenHeight: screenWidth = 0,
    mobileFluid = false,
    onReset,
    TitleButton,
    titleLoading,
    label,
    labelStyle,
    loaderColor,
}: GodListProps<T, B, A>) => {
    const interval = 7;

    const windowRef = useRef<HTMLDivElement>(null);

    const [windowWidth, setWindowWidth] = useState(0);

    useEffect(() => {
        if (coreRef?.current) {
            let check = coreRef.current.scrollWidth;
            if (offsetListRef && windowRef?.current) check -= windowRef.current.offsetWidth;
            setWindowWidth(check);
        } else if (windowRef.current) {
            setWindowWidth(windowRef.current.scrollWidth);
        }
    }, [coreRef, windowRef, animationToggle, offsetListRef]);

    const [trueScrollTop, setTrueScrollTop] = useState(0);
    const [scrollLeftOffset, setScrollTopOffset] = useState(0);

    const scrollLeft = useMemo(
        () =>
            scrollLeftOffset === 0
                ? trueScrollTop + screenWidth - (startGap || 0)
                : trueScrollTop - scrollLeftOffset - (startGap || 0),
        [trueScrollTop, scrollLeftOffset, startGap, screenWidth],
    );

    const innerWidth = useMemo(
        () => data.length * itemWidth * squishFactor,
        [data.length, itemWidth, squishFactor],
    );

    const startIndex = useMemo(() => {
        return Math.max(Math.floor(scrollLeft / itemWidth), 0);
    }, [scrollLeft, itemWidth]);

    const endIndex = useMemo(() => {
        const check = Math.min(startIndex + interval, Math.max(0, data.length - 1));
        if (!mobileFluid) return check;
        return Math.min(
            check,
            scrollLeft + windowWidth === 0 ? 0 : Math.ceil((scrollLeft + windowWidth) / itemWidth),
        );
    }, [scrollLeft, data, windowWidth, itemWidth, startIndex, interval, mobileFluid]);

    const [selected, setSelected] = React.useState<null | number>(null);

    const prevEnd = usePrevious(endIndex);

    const items = React.useMemo(() => range(startIndex, endIndex), [startIndex, endIndex]);

    const [lastGrabValue, setLastGrabValue] = React.useState<number>(0);

    const lastGrab = React.useCallback(
        (end: number) => {
            if (onScrollEnd) {
                const floor = Math.floor(end / (interval - 1));
                if (
                    Object.values(items).length !== 0 &&
                    Object.values(items).length * itemWidth + scrollLeft >= innerWidth &&
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
            scrollLeft,
            items,
            innerWidth,
            onScrollEnd,
            prevEnd,
            loading,
            itemWidth,
            interval,
            lastGrabValue,
        ],
    );

    useEffect(() => {
        lastGrab(endIndex);
    }, [lastGrab, endIndex]);

    const selector = React.useMemo(() => {
        return (ind: typeof selected, ...act: Parameters<NonNullable<typeof action>>) => {
            if (!skipSelectedCheck) setSelected(ind);
            if (action) action(...act);
        };
    }, [action, skipSelectedCheck]);

    const [uno, uno_i, uno_v, uno_s, uno_a] = React.useMemo(() => {
        const yeh = items.find((x) => x % 7 === 0) as number;
        const checker = items.indexOf(yeh);
        const visible = (checker >= 3 && checker < 6 && checker !== -1) || yeh < 3;
        return [data[yeh], yeh, visible, selected === yeh, selector.bind(undefined, yeh)];
    }, [data, items, selected, selector]);

    const [dos, dos_i, dos_v, dos_s, dos_a] = React.useMemo(() => {
        const yeh = items.find((x) => x % 7 === 1) as number;
        const checker = items.indexOf(yeh);
        const visible = (checker >= 3 && checker < 6 && checker !== -1) || yeh < 3;
        return [data[yeh], yeh, visible, selected === yeh, selector.bind(undefined, yeh)];
    }, [data, items, selected, selector]);

    const [tres, tres_i, tres_v, tres_s, tres_a] = React.useMemo(() => {
        const yeh = items.find((x) => x % 7 === 2) as number;
        const checker = items.indexOf(yeh);
        const visible = (checker >= 3 && checker < 6 && checker !== -1) || yeh < 3;
        return [data[yeh], yeh, visible, selected === yeh, selector.bind(undefined, yeh)];
    }, [data, items, selected, selector]);

    const [qu, qu_i, qu_v, qu_s, qu_a] = React.useMemo(() => {
        const yeh = items.find((x) => x % 7 === 3) as number;
        const checker = items.indexOf(yeh);
        const visible = checker >= 3 && checker < 6 && checker !== -1;
        return [data[yeh], yeh, visible, selected === yeh, selector.bind(undefined, yeh)];
    }, [data, items, selected, selector]);

    const [cin, cin_i, cin_v, cin_s, cin_a] = React.useMemo(() => {
        const yeh = items.find((x) => x % 7 === 4) as number;
        const checker = items.indexOf(yeh);
        const visible = checker >= 3 && checker < 6 && checker !== -1;
        return [data[yeh], yeh, visible, selected === yeh, selector.bind(undefined, yeh)];
    }, [data, items, selected, selector]);

    const [sei, sei_i, sei_v, sei_s, sei_a] = React.useMemo(() => {
        const yeh = items.find((x) => x % 7 === 5) as number;
        const checker = items.indexOf(yeh);
        const visible = checker >= 3 && checker < 6 && checker !== -1;
        return [data[yeh], yeh, visible, selected === yeh, selector.bind(undefined, yeh)];
    }, [data, items, selected, selector]);

    const [ses, ses_i, ses_v, ses_s, ses_a] = React.useMemo(() => {
        const yeh = items.find((x) => x % 7 === 6) as number;
        const checker = items.indexOf(yeh);
        const visible = checker >= 3 && checker < 6 && checker !== -1;
        return [data[yeh], yeh, visible, selected === yeh, selector.bind(undefined, yeh)];
    }, [data, items, selected, selector]);

    const genid = React.useId();

    const reset = React.useCallback(() => {
        if (coreRef && coreRef.current) {
            // @ts-ignore
            coreRef.current?.scrollTo({ left: 0, behavior: 'smooth' });
        } else if (windowRef && windowRef.current) {
            // @ts-ignore
            windowRef.current?.scrollTo({ left: 0, behavior: 'smooth' });
        }
        if (onReset) onReset();
        setSelected(null);
    }, [coreRef, windowRef, onReset]);

    const prevData = usePrevious(data);

    const checkReset = React.useCallback(
        (_innerWidth: number) => {
            if (scrollLeft > _innerWidth || JSON.stringify(prevData) !== JSON.stringify(data)) {
                reset();
            }
        },
        [reset, scrollLeft, prevData, data],
    );

    const _onScroll = useCallback(
        (ev: React.UIEvent<HTMLDivElement, UIEvent>) => {
            const st = ev.currentTarget.scrollLeft;
            if (offsetListRef) {
                setScrollTopOffset(ev.currentTarget.offsetWidth || 0);
            }
            const up = scrollLeft < st;

            setTrueScrollTop(st);

            if (onScroll) onScroll(ev, up);

            if (st > innerWidth) {
                reset();
            }
        },
        [
            onScroll,
            offsetListRef,
            setScrollTopOffset,
            setTrueScrollTop,
            scrollLeft,
            innerWidth,
            reset,
        ],
    );

    // console.log({ items, data });
    useEffect(() => {
        if (coreRef && coreRef.current) {
            // @ts-ignore
            coreRef.current.onscroll = _onScroll;
        } else if (windowRef && windowRef.current) {
            // @ts-ignore
            windowRef.current.onscroll = _onScroll;
        }
    }, [coreRef, _onScroll]);

    useEffect(() => {
        // passed as arg here bc:
        // we only want to check for reset when innerWidth changes
        checkReset(innerWidth);
    }, [checkReset, innerWidth]);

    const Label = useCallback(
        () =>
            label ? (
                <div style={{ ...styles.labelContainer, display: style?.display }}>
                    <div style={styles.title}>
                        <Text textStyle={{ ...styles.label, ...labelStyle }}>{label}</Text>
                        <div
                            style={{
                                marginLeft: '.5rem',
                                position: 'relative',
                            }}
                        >
                            {titleLoading && <Loader color={loaderColor || 'black'} />}
                        </div>
                    </div>
                    <div style={{ marginTop: '-2px' }}>{TitleButton && <TitleButton />}</div>
                </div>
            ) : null,
        [label, labelStyle, TitleButton, titleLoading, loaderColor, style],
    );

    return (
        <>
            <Label />
            <div
                id={`${genid}wrapper`}
                ref={windowRef}
                style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                    ...(border && styles.border),
                    ...(horizontal && styles.horizontal),
                    ...(!disableScroll
                        ? { overflowX: 'scroll', overflowY: 'hidden' }
                        : { overflowX: undefined, overflowY: 'hidden' }),
                    justifySelf: 'flex-start',
                    ...(faded && {
                        WebkitMaskImage: 'linear-gradient(0deg, #000 95%, transparent)',
                    }),
                    position: 'relative',
                    width: `${innerWidth}px`,
                    height: '100%',
                    '--i': itemWidth,
                    ...style,
                }}
                onScroll={_onScroll}
            >
                {!!(startGap && startGap !== 0) && (
                    <div style={{ height: '100%', marginLeft: startGap }} />
                )}

                <animated.div
                    id={`${genid}1`}
                    style={{
                        transform: `translate(${uno_i * itemWidth + startGap}px, 0px)`,
                        width: `var(--i)`,
                        opacity: uno ? 1 : 0,
                        pointerEvents: uno ? 'auto' : 'none',
                        justifyContent: 'center',
                        alignItems: 'center',
                        display: 'flex',
                        position: 'absolute',
                        height: '100%',
                    }}
                >
                    <RenderItem
                        visible={uno_v}
                        item={uno}
                        index={uno_i}
                        extraData={extraData}
                        action={uno_a}
                        selected={uno_s}
                    />
                </animated.div>
                <animated.div
                    id={`${genid}2`}
                    style={{
                        transform: `translate(${dos_i * itemWidth + startGap}px, 0px)`,
                        width: `var(--i)`,
                        opacity: dos ? 1 : 0,
                        pointerEvents: dos ? 'auto' : 'none',
                        justifyContent: 'center',
                        alignItems: 'center',
                        display: 'flex',
                        position: 'absolute',
                        height: '100%',
                    }}
                >
                    <RenderItem
                        visible={dos_v}
                        item={dos}
                        index={dos_i}
                        extraData={extraData}
                        action={dos_a}
                        selected={dos_s}
                    />
                </animated.div>
                <animated.div
                    id={`${genid}3`}
                    style={{
                        transform: `translate(${tres_i * itemWidth + startGap}px, 0px)`,
                        opacity: tres ? 1 : 0,
                        pointerEvents: tres ? 'auto' : 'none',
                        justifyContent: 'center',
                        alignItems: 'center',
                        display: 'flex',
                        position: 'absolute',
                        height: '100%',
                        width: `var(--i)`,
                        WebkitScrollSnapType: 'y mandatory',
                    }}
                >
                    <RenderItem
                        visible={tres_v}
                        item={tres}
                        index={tres_i}
                        extraData={extraData}
                        action={tres_a}
                        selected={tres_s}
                    />
                </animated.div>
                <animated.div
                    id={`${genid}4`}
                    style={{
                        transform: `translate(${qu_i * itemWidth + startGap}px, 0px)`,
                        opacity: qu ? 1 : 0,
                        pointerEvents: qu ? 'auto' : 'none',
                        justifyContent: 'center',
                        alignItems: 'center',
                        display: 'flex',
                        position: 'absolute',
                        height: '100%',
                        width: `var(--i)`,
                        // ...cheeeeck(qu_v, qu_i),
                    }}
                >
                    <RenderItem
                        visible={qu_v}
                        item={qu}
                        index={qu_i}
                        extraData={extraData}
                        action={qu_a}
                        selected={qu_s}
                    />
                </animated.div>
                <animated.div
                    id={`${genid}5`}
                    style={{
                        transform: `translate(${cin_i * itemWidth + startGap}px, 0px)`,
                        opacity: cin ? 1 : 0,
                        pointerEvents: cin ? 'auto' : 'none',
                        justifyContent: 'center',
                        alignItems: 'center',
                        display: 'flex',
                        position: 'absolute',
                        height: '100%',
                        width: `var(--i)`,
                        // ...cheeeeck(cin_v, cin_i),
                    }}
                >
                    <RenderItem
                        visible={cin_v}
                        item={cin}
                        index={cin_i}
                        extraData={extraData}
                        action={cin_a}
                        selected={cin_s}
                    />
                </animated.div>
                <animated.div
                    id={`${genid}6`}
                    style={{
                        opacity: sei ? 1 : 0,
                        pointerEvents: sei ? 'auto' : 'none',
                        justifyContent: 'center',
                        alignItems: 'center',
                        display: 'flex',
                        position: 'absolute',
                        transform: `translate(${sei_i * itemWidth + startGap}px, 0px)`,
                        height: '100%',
                        width: `var(--i)`,
                        // ...cheeeeck(sei_v, sei_i),
                    }}
                >
                    <RenderItem
                        visible={sei_v}
                        item={sei}
                        index={sei_i}
                        extraData={extraData}
                        action={sei_a}
                        selected={sei_s}
                    />
                </animated.div>
                <animated.div
                    id={`${genid}7`}
                    style={{
                        transform: `translate(${ses_i * itemWidth + startGap}px, 0px)`,
                        opacity: ses ? 1 : 0,
                        pointerEvents: ses ? 'auto' : 'none',
                        justifyContent: 'center',
                        alignItems: 'center',
                        display: 'flex',
                        position: 'absolute',
                        height: '100%',
                        width: `var(--i)`,
                    }}
                >
                    <RenderItem
                        visible={ses_v}
                        item={ses}
                        index={ses_i}
                        extraData={extraData}
                        action={ses_a}
                        selected={ses_s}
                    />
                </animated.div>
                {/* {loading && <Loading />} */}

                {endGap && endGap !== 0 && <div style={{ width: '100%', marginTop: endGap }} />}
            </div>
        </>
    );
};

export default React.memo(GodListHorizontal) as typeof GodListHorizontal;
