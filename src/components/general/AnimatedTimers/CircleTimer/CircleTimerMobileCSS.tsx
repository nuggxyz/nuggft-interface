import React, { CSSProperties, FunctionComponent, ReactChild, useMemo } from 'react';

import lib from '@src/lib';
import useInterval from '@src/hooks/useInterval';

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
    const [trueRemaining, setTrueRemaining] = React.useState((1 + remaining) * 12);
    const [trueDuration, setTrueDuration] = React.useState(duration * 12);

    useInterval(
        React.useCallback(() => {
            if (trueRemaining) setTrueRemaining(trueRemaining - 1);
        }, [trueRemaining, setTrueRemaining]),
        React.useMemo(() => (staticColor ? null : 1000), [staticColor]),
    );

    React.useEffect(() => {
        setTrueRemaining((1 + remaining) * 12);
    }, [remaining, setTrueRemaining]);

    React.useEffect(() => {
        setTrueDuration(duration * 12);
    }, [duration, setTrueDuration]);

    const to = useMemo(() => {
        return duration
            ? Math.round(
                  Math.abs(
                      (width / 6.5) *
                          (TWOPI -
                              ((staticColor ? trueDuration : trueRemaining) / trueDuration) *
                                  TWOPI) +
                          HALFPI,
                  ),
              )
            : 0;
    }, [trueDuration, width, staticColor, trueRemaining, tokenId, duration]);

    const max = React.useMemo(() => {
        return Math.round(Math.abs((width / 6.5) * (TWOPI - 0 * TWOPI) + HALFPI));
    }, [width]);

    const activated = React.useMemo(() => {
        return staticColor || (!staticColor && max !== to);
    }, [staticColor, to, max]);

    const shadowColor = useMemo(() => {
        const percent = trueRemaining / trueDuration;

        if (staticColor || percent >= 1) return staticColor || defaultColor;

        if (percent <= 0.1) {
            return lib.colors.nuggRedText;
        }
        if (percent <= 0.25) {
            return lib.colors.nuggGold;
        }
        return defaultColor;
    }, [trueRemaining, trueDuration, defaultColor, staticColor]);

    const [r, r2, strokeDashArray, _shadowColor, _style, _strokeWidth] = React.useMemo(() => {
        return [
            width / 6.5,
            width / 6.5 + 50,
            `${(width / 6.5) * TWOPI} ${(width / 6.5) * TWOPI}`,
            shadowColor === 'transparent' ? 'transparent' : 'white',
            { transition: `all 1s ${lib.layout.animation}` },
            activated ? strokeWidth : 0,
        ];
    }, [width, shadowColor, activated, strokeWidth]);

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
                        r={r2}
                        strokeDashoffset={max}
                        fill="none"
                        style={_style}
                    />
                    <circle
                        cx="50%"
                        cy="50%"
                        r={r}
                        stroke={_shadowColor}
                        strokeDashoffset={to}
                        strokeWidth={_strokeWidth}
                        fill="none"
                        strokeDasharray={strokeDashArray}
                        strokeLinecap="round"
                        style={_style}
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
