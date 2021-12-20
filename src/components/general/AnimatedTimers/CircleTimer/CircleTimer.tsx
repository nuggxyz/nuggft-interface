import React, {
    CSSProperties,
    FunctionComponent,
    ReactChild,
    useEffect,
    useMemo,
    useState,
} from 'react';
import { animated, config, useSpring } from 'react-spring';

import {
    isUndefinedOrNullOrNotNumber,
    isUndefinedOrNullOrNumberZero,
    isUndefinedOrNullOrStringEmpty,
} from '../../../../lib';
import Colors from '../../../../lib/colors';
import AppState from '../../../../state/app';

import styles from './CircleTimer.styles';

type Props = {
    children?: ReactChild | ReactChild[];
    duration: number;
    remaining: number;
    blocktime: number;
    staticColor: string;
    style?: CSSProperties;
    width: number;
};
const TWOPI = Math.PI * 2;

const CircleTimer: FunctionComponent<Props> = ({
    children,
    duration,
    remaining,
    blocktime,
    staticColor,
    style,
    width,
}) => {
    const timerCircleRadius = useMemo(() => width / 6.5, [width]);
    const circumference = useMemo(
        () => timerCircleRadius * TWOPI,
        [timerCircleRadius],
    );
    const jumpThreshold = useMemo(
        () => ((timerCircleRadius * TWOPI) / duration) * 1.5,
        [timerCircleRadius, duration],
    );
    const [stateRemaining, setStateRemaining] = useState(remaining);

    useEffect(() => {
        setStateRemaining(
            !isUndefinedOrNullOrStringEmpty(staticColor) ? duration : remaining,
        );
    }, [remaining, duration, staticColor]);

    const to = useMemo(() => {
        return !isUndefinedOrNullOrNotNumber(stateRemaining) &&
            !isUndefinedOrNullOrNumberZero(duration)
            ? timerCircleRadius * (TWOPI - (stateRemaining / duration) * TWOPI)
            : 0;
    }, [stateRemaining, duration, timerCircleRadius]);

    const [previousTo, setPreviousTo] = useState(to);

    const customConfig = useMemo(
        () =>
            !isUndefinedOrNullOrStringEmpty(staticColor) ||
            isUndefinedOrNullOrNotNumber(previousTo) ||
            to < previousTo ||
            Math.abs(previousTo - to) > jumpThreshold
                ? config.molasses
                : { duration: blocktime },
        [to, previousTo, blocktime, jumpThreshold, staticColor],
    );

    const { x } = useSpring({
        to: {
            x: to,
        },
        from: {
            x: previousTo,
        },
        onRest: () => {
            if (isUndefinedOrNullOrStringEmpty(staticColor)) {
                setPreviousTo(to);
                const val = stateRemaining - 1 > 0 ? stateRemaining - 1 : 0;
                setStateRemaining(val);
            }
        },
        config: customConfig,
    });

    const shadowColor = useMemo(() => {
        const percent = remaining / duration;
        if (!isUndefinedOrNullOrStringEmpty(staticColor)) {
            return staticColor;
        }
        if (percent <= 0.1) {
            return Colors.nuggRedText;
        } else if (percent <= 0.25) {
            return Colors.nuggGold;
        }
        return Colors.nuggBlueText;
    }, [remaining, duration, staticColor]);

    return (
        <div style={{ ...style, ...styles.container }}>
            <div style={styles.childrenContainer}>{children}</div>
            <div
                style={{
                    filter: `drop-shadow(0px 6px 15px ${shadowColor}`,
                    width: '100%',
                    height: '100%',
                }}>
                <animated.svg
                    height="100%"
                    width="100%"
                    style={styles.svgTransition}>
                    <animated.circle
                        style={styles.circleConfig}
                        cx="50%"
                        cy="50%"
                        height="100%"
                        width="100%"
                        r={timerCircleRadius}
                        stroke={'white'}
                        strokeDashoffset={x}
                        strokeWidth={20}
                        fill="none"
                        strokeDasharray={`${circumference} ${circumference}`}
                        strokeLinecap="round"
                    />
                </animated.svg>
            </div>
        </div>
    );
};

export default CircleTimer;
