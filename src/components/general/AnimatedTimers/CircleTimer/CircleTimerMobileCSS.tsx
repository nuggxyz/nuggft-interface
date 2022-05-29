import React, { CSSProperties, FunctionComponent, ReactChild, useMemo } from 'react';

import lib from '@src/lib';

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
    tokenId?: TokenId;
};
const TWOPI = Math.PI * 2;
const HALFPI = Math.PI / 2;
const CircleTimerMobileCSS: FunctionComponent<Props> = ({
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
    staticColor,
    tokenId,
}) => {
    const to = useMemo(() => {
        return duration
            ? Math.abs(
                  (width / 6.5) *
                      (TWOPI - ((staticColor ? duration : remaining) / duration) * TWOPI) +
                      HALFPI,
              )
            : 0;
    }, [duration, width, staticColor, remaining, tokenId]);

    const shadowColor = useMemo(() => {
        const percent = remaining / duration;

        if (staticColor || percent >= 1) return staticColor || defaultColor;

        if (percent <= 0.1) {
            return lib.colors.nuggRedText;
        }
        if (percent <= 0.25) {
            return lib.colors.nuggGold;
        }
        return defaultColor;
    }, [remaining, duration, defaultColor, staticColor]);

    if (tokenId === 'nugg-84') {
        console.log({ shadowColor, remaining, duration, to, staticColor });
    }

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
                    transform: 'translate3d(0px,var(--b),0)',
                    transformOrigin: 'center',
                    zIndex: 101,
                    ...childrenContainerStyle,
                }}
            >
                {children}
            </div>
            <div
                style={{
                    filter: `drop-shadow(2px 3px 10px ${shadowColor})`,
                    willChange: 'filter',
                    height: '100%',
                    width: '100%',
                    transform: 'translate3d(0px,var(--a),0)',
                    transformOrigin: 'center',
                }}
            >
                <svg
                    height="100%"
                    width="100%"
                    style={{
                        ...styles.svgTransition,
                        transform: 'rotate(-90deg)',
                    }}
                >
                    <circle
                        cx="50%"
                        cy="50%"
                        r={width / 6.5 + 50}
                        strokeDashoffset={to}
                        fill="none"
                        style={{ transition: `all 2s ${lib.layout.animation}` }}
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
                        style={{ transition: `all 2s ${lib.layout.animation}` }}
                    />
                </svg>
            </div>
        </div>
    );
};

export default React.memo(
    CircleTimerMobileCSS,
    (a, b) =>
        a.tokenId === b.tokenId &&
        a.remaining === b.remaining &&
        b.defaultColor === a.defaultColor &&
        a.staticColor === b.staticColor,
);
