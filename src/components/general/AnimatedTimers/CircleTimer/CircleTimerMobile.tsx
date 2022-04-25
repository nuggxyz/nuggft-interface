import React, { CSSProperties, FunctionComponent, ReactChild, useMemo } from 'react';
import { animated, config, useSpring } from '@react-spring/web';

import { isUndefinedOrNullOrStringEmpty } from '@src/lib';
import Colors from '@src/lib/colors';

import styles from './CircleTimer.styles';

type Props = {
    children?: ReactChild | ReactChild[];
    duration: number;
    remaining: number;
    blocktime: number;
    staticColor: string;
    style?: CSSProperties;
    childrenContainerStyle?: CSSProperties;
    width: number;
    strokeWidth?: number;
    defaultColor: string;
};
const TWOPI = Math.PI * 2;
const HALFPI = Math.PI / 2;

const CircleTimerMobile: FunctionComponent<Props> = (props) => {
    if (props.staticColor || props.remaining / props.duration >= 1) return Basic(props);

    return Normal(props);
};

const Basic: FunctionComponent<Props> = ({
    children,

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    blocktime,
    staticColor,
    style,
    width,
    strokeWidth = 20,
    childrenContainerStyle,
    defaultColor,
}) => {
    return (
        <div style={{ ...styles.container, ...style }}>
            <div style={{ ...styles.childrenContainer, ...childrenContainerStyle }}>{children}</div>
            <svg
                height="100%"
                width="100%"
                filter={`drop-shadow(-10px 0px 15px ${staticColor || defaultColor})`}
                style={styles.svgTransition}
            >
                <animated.circle
                    cx="50%"
                    cy="50%"
                    r={width / 6.5 + 50}
                    strokeDashoffset={0}
                    fill="none"
                />
                <animated.circle
                    cx="50%"
                    cy="50%"
                    r={width / 6.5}
                    stroke={
                        (staticColor || defaultColor) === 'transparent' ? 'transparent' : 'white'
                    }
                    strokeDashoffset={0}
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeDasharray={`${(width / 6.5) * TWOPI} ${(width / 6.5) * TWOPI}`}
                    strokeLinecap="round"
                />
            </svg>
        </div>
    );
};

const Normal: FunctionComponent<Props> = ({
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
    const to = useMemo(() => {
        return duration
            ? Math.abs(
                  (width / 6.5) *
                      (TWOPI - ((staticColor ? duration : remaining) / duration) * TWOPI) +
                      HALFPI,
              )
            : 0;
    }, [duration, width, staticColor, remaining]);

    const todef = React.useDeferredValue(to);

    const [{ x }] = useSpring(
        {
            to: {
                x: todef,
            },

            config: config.molasses,
        },
        [todef],
    );

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
                    r={width / 6.5 + 50}
                    strokeDashoffset={x}
                    fill="none"
                />
                <animated.circle
                    cx="50%"
                    cy="50%"
                    r={width / 6.5}
                    stroke={shadowColor === 'transparent' ? 'transparent' : 'white'}
                    strokeDashoffset={x}
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeDasharray={`${(width / 6.5) * TWOPI} ${(width / 6.5) * TWOPI}`}
                    strokeLinecap="round"
                />
            </svg>
        </div>
    );
};

export default CircleTimerMobile;
