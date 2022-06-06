import React, { CSSProperties, FunctionComponent, ReactChild, useMemo } from 'react';

import lib from '@src/lib';
import useInterval from '@src/hooks/useInterval';

import styles from './CircleTimer.styles';

type Props = {
    children?: ReactChild | ReactChild[];
    duration: number;
    remaining: number;
    primaryColor?: string;
    secondaryColor?: string;
    toggled?: boolean;
    style?: CSSProperties;
    childrenContainerStyle?: CSSProperties;
    width: number;
    strokeWidth?: number;
    isStatic?: boolean;
    interval?: number;
};
const TWOPI = Math.PI * 2;
const HALFPI = Math.PI / 2;
const CircleTimerMobileCSS: FunctionComponent<Props> = ({
    children,
    duration,
    remaining,

    style,
    width,
    strokeWidth = 20,
    childrenContainerStyle,
    primaryColor = lib.colors.primaryColor,
    secondaryColor = 'white',
    toggled = false,
    isStatic = false,
    interval = 1,
}) => {
    const [trueRemaining, setTrueRemaining] = React.useState(remaining * interval);
    const [trueDuration, setTrueDuration] = React.useState(duration * interval);

    const to = useMemo(() => {
        return duration && !isStatic
            ? Math.round(
                  Math.abs(
                      (width / 6.5) * (TWOPI - (trueRemaining / trueDuration) * TWOPI) + HALFPI,
                  ),
              )
            : 0;
    }, [trueDuration, width, trueRemaining, duration, isStatic]);

    const max = React.useMemo(() => {
        return Math.round(Math.abs((width / 6.5) * (TWOPI - 0 * TWOPI) + HALFPI));
    }, [width]);

    const activated = useMemo(() => {
        return isStatic || (!isStatic && max !== to);
    }, [isStatic, to, max]);

    useInterval(
        React.useCallback(() => {
            if (trueRemaining) setTrueRemaining(trueRemaining - 1);
        }, [trueRemaining, setTrueRemaining]),
        React.useMemo(() => (!activated ? null : 1000), [activated]),
    );

    React.useEffect(() => {
        setTrueRemaining(remaining * interval);
    }, [remaining, setTrueRemaining, interval]);

    React.useEffect(() => {
        setTrueDuration(duration * interval);
    }, [duration, setTrueDuration, interval]);

    const [r, strokeDashArray, _style, stroke, fill, _strokeWidth] = React.useMemo(() => {
        return [
            width / 6.5,
            `${(width / 6.5) * TWOPI} ${(width / 6.5) * TWOPI}`,
            {
                transition: `all 1s ${lib.layout.animation}`,
                opacity: activated ? 1 : 0.5,
            },
            toggled ? primaryColor : secondaryColor,
            toggled ? secondaryColor : primaryColor,
            activated ? strokeWidth : 0,
        ];
    }, [width, activated, toggled, primaryColor, secondaryColor, strokeWidth]);

    return (
        <div style={{ zIndex: 1, ...style }}>
            <div
                id="nugg-holder"
                style={{
                    position: 'absolute',
                    alignItems: 'center',
                    display: 'flex',
                    justifyContent: 'center',
                    overflow: 'visible',
                    flexDirection: 'column',
                    transformOrigin: 'center',
                    zIndex: 101,
                    ...childrenContainerStyle,
                }}
            >
                {children}
            </div>
            <div
                style={{
                    filter: `drop-shadow(2px 3px 2px rgb(0 0 0 / 0.2))`,
                    willChange: 'filter',
                    transformOrigin: 'center',
                }}
            >
                <svg
                    style={{
                        ...styles.svgTransition,
                        transform: 'rotate(-90deg)',
                    }}
                >
                    <circle
                        cx="50%"
                        cy="50%"
                        r={r}
                        stroke={stroke}
                        strokeDashoffset={to}
                        strokeWidth={_strokeWidth}
                        fill={fill}
                        strokeDasharray={strokeDashArray}
                        strokeLinecap="round"
                        style={_style}
                    />
                </svg>
            </div>
        </div>
    );
};

export default CircleTimerMobileCSS;
