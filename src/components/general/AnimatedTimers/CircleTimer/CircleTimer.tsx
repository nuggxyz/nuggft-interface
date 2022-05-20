import React, { CSSProperties, FunctionComponent, useEffect, useMemo, useState } from 'react';
import { animated, useSpring } from '@react-spring/web';

import {
    isUndefinedOrNullOrNotNumber,
    isUndefinedOrNullOrNumberZero,
    isUndefinedOrNullOrStringEmpty,
} from '@src/lib';
import Colors from '@src/lib/colors';

import styles from './CircleTimer.styles';

type Props = React.PropsWithChildren<{
    duration: number;
    remaining: number;
    blocktime: number;
    staticColor: string;
    style?: CSSProperties;
    childrenContainerStyle?: CSSProperties;
    width: number;
    strokeWidth?: number;
    defaultColor: string;
    tokenId?: TokenId;
}>;
const TWOPI = Math.PI * 2;
const HALFPI = Math.PI / 2;

const CircleTimer: FunctionComponent<Props> = ({
    children,
    duration,
    remaining,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    blocktime,

    staticColor,
    style,
    width,
    strokeWidth = 20,
    childrenContainerStyle,
    defaultColor,
}) => {
    // blocktime;
    // const dimensions = AppState.select.dimensions();
    const timerCircleRadius = useMemo(() => width / 6.5, [width]);
    const circumference = useMemo(() => timerCircleRadius * TWOPI, [timerCircleRadius]);
    // const jumpThreshold = useMemo(
    //     () => ((timerCircleRadius * TWOPI) / duration) * 1.5,
    //     [timerCircleRadius, duration],
    // );
    const [stateRemaining, setStateRemaining] = useState(duration);

    useEffect(() => {
        setStateRemaining(!isUndefinedOrNullOrStringEmpty(staticColor) ? duration : remaining);
    }, [remaining, duration, staticColor]);

    const to = useMemo(() => {
        return !isUndefinedOrNullOrNotNumber(stateRemaining) &&
            !isUndefinedOrNullOrNumberZero(duration)
            ? Math.abs(timerCircleRadius * (TWOPI - (stateRemaining / duration) * TWOPI) + HALFPI)
            : 0;
    }, [stateRemaining, duration, timerCircleRadius]);

    // const [previousTo, setPreviousTo] = useState(to);

    // const customConfig = useMemo(
    //     () =>
    //         !isUndefinedOrNullOrStringEmpty(staticColor) ||
    //         isUndefinedOrNullOrNotNumber(previousTo) ||
    //         to < previousTo ||
    //         Math.abs(previousTo - to) > jumpThreshold
    //             ? config.molasses
    //             : { duration: blocktime },
    //     [to, previousTo, blocktime, jumpThreshold, staticColor],
    // );

    const { x } = useSpring({
        to: {
            x: to,
        },
        delay: 200,
        // from: {
        //     x: previousTo,
        // },
        // onRest: () => {
        //     if (isUndefinedOrNullOrStringEmpty(staticColor)) {
        //         setPreviousTo(to);
        //         const val = stateRemaining - 1 > 0 ? stateRemaining - 1 : 0;
        //         setStateRemaining(val);
        //     }
        // },
        config: {
            // ...springConfig.slow,
            tension: 250,
            friction: 180,
            // easing: (r) => r * 50,
        },
    });

    const shadowColor = useMemo(() => {
        const percent = remaining / duration;
        if (percent > 1 && !isUndefinedOrNullOrStringEmpty(staticColor)) {
            return staticColor;
        }
        if (percent <= 0.1) {
            return Colors.nuggRedText;
        }
        if (percent <= 0.25) {
            return Colors.nuggGold;
        }
        return defaultColor;
    }, [remaining, duration, staticColor, defaultColor]);

    return (
        <div style={{ ...styles.container, ...style }}>
            <div style={{ ...styles.childrenContainer, ...childrenContainerStyle }}>{children}</div>
            <svg
                height="100%"
                width="100%"
                filter={`drop-shadow(-10px 0px 15px ${shadowColor})`}
                style={styles.svgTransition}
            >
                <animated.circle
                    cx="50%"
                    cy="50%"
                    r={timerCircleRadius + 50}
                    strokeDashoffset={x}
                    fill="none"
                />
                <animated.circle
                    cx="50%"
                    cy="50%"
                    r={timerCircleRadius}
                    stroke={shadowColor === 'transparent' ? 'transparent' : 'white'}
                    strokeDashoffset={x}
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeDasharray={`${circumference} ${circumference}`}
                    strokeLinecap="round"
                />
            </svg>
        </div>
    );
};

export default React.memo(
    CircleTimer,
    (a, b) => a.remaining === b.remaining && a.tokenId === b.tokenId,
);
