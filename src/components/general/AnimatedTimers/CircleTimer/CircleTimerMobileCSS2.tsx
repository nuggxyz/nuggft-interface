import React, { CSSProperties, FunctionComponent, ReactChild, useMemo } from 'react';

import lib from '@src/lib';

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
    const to = useMemo(() => {
        return duration && !isStatic
            ? Math.round(
                  Math.abs((width / 6.5) * (TWOPI - (remaining / duration) * TWOPI) + HALFPI),
              )
            : 0;
    }, [duration, width, remaining, isStatic, interval]);

    const max = React.useMemo(() => {
        return Math.round(Math.abs((width / 6.5) * (TWOPI - 0 * TWOPI) + HALFPI));
    }, [width]);
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
                    // transform: 'translate3d(0px,var(--b),0)',
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
                    // height: '100%',
                    // width: '100%',
                    // transform: 'translate3d(0px,var(--a),0)',
                    transformOrigin: 'center',
                    // zIndex: 102,
                }}
            >
                <svg
                    // height="100%"
                    // width="100%"
                    style={{
                        ...styles.svgTransition,
                        transform: 'rotate(-90deg)',
                    }}
                >
                    {/* <circle
                        cx="50%"
                        cy="50%"
                        r={width / 6.5 + 50}
                        strokeDashoffset={to}
                        fill="none"
                        style={{ transition: `all 2s ${lib.layout.animation}` }}
                    /> */}
                    <circle
                        cx="50%"
                        cy="50%"
                        r={width / 6.5}
                        stroke={toggled ? primaryColor : secondaryColor}
                        strokeDashoffset={to}
                        strokeWidth={isStatic || (!isStatic && max !== to) ? strokeWidth : 0}
                        fill={toggled ? secondaryColor : primaryColor}
                        strokeDasharray={`${(width / 6.5) * TWOPI} ${(width / 6.5) * TWOPI}`}
                        strokeLinecap="round"
                        style={{
                            transition: `all 2s ${lib.layout.animation}`,
                            opacity: isStatic || (!isStatic && max !== to) ? 1 : 0.5,
                        }}
                    />
                </svg>
            </div>
        </div>
    );
};

export default React.memo(
    CircleTimerMobileCSS,
    (a, b) => a.remaining === b.remaining && a.toggled === b.toggled && a.isStatic === b.isStatic,
);
