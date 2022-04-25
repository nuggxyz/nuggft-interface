import React, { CSSProperties, FunctionComponent, ReactChild, useMemo } from 'react';

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

const CircleTimerMobileCSS: FunctionComponent<Props> = (props) => {
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
                <circle cx="50%" cy="50%" r={width / 6.5 + 50} strokeDashoffset={0} fill="none" />
                <circle
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
    style,
    width,
    strokeWidth = 20,
    childrenContainerStyle,
    defaultColor,
}) => {
    const to = useMemo(() => {
        return duration
            ? Math.abs((width / 6.5) * (TWOPI - (remaining / duration) * TWOPI) + HALFPI)
            : 0;
    }, [duration, width, remaining]);

    const shadowColor = useMemo(() => {
        const percent = remaining / duration;

        if (percent <= 0.1) {
            return Colors.nuggRedText;
        }
        if (percent <= 0.25) {
            return Colors.nuggGold;
        }
        return defaultColor;
    }, [remaining, duration, defaultColor]);

    return (
        <div style={{ ...styles.container, ...style }}>
            <div style={{ ...styles.childrenContainer, ...childrenContainerStyle }}>{children}</div>
            <svg
                height="100%"
                width="100%"
                filter={`drop-shadow(-10px 0px 15px ${shadowColor})`}
                style={styles.svgTransition}
            >
                <circle
                    cx="50%"
                    cy="50%"
                    r={width / 6.5 + 50}
                    strokeDashoffset={to}
                    fill="none"
                    style={{ transition: 'all .5s ease' }}
                />
                <circle
                    cx="50%"
                    cy="50%"
                    r={width / 6.5}
                    stroke={shadowColor === 'transparent' ? 'transparent' : 'white'}
                    strokeDashoffset={to}
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeDasharray={`${(width / 6.5) * TWOPI} ${(width / 6.5) * TWOPI}`}
                    strokeLinecap="round"
                    style={{ transition: 'all .5s ease' }}
                />
            </svg>
        </div>
    );
};

export default CircleTimerMobileCSS;
