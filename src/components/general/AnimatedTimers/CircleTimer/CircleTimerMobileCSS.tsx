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

    // const [trail, api] = useTrail(2, () => ({
    //     xy: [0, 0],
    //     // to: {
    //     //     transform: trans,
    //     // },
    //     config: packages.spring.config.molasses,
    // }));

    // // const A = React.memo(({ style: _style, key }: { style: typeof trail[0]; key: number }) => {
    // //     return (

    // //     );
    // // });

    // // const B = React.memo(({ style: _style, key }: { style: typeof trail[0]; key: number }) => (

    // // ));

    // // const arr = [A, B];

    // const handleMouseMove = e => {
    //   }

    return (
        <div style={{ zIndex: 1, ...style }}>
            {/* {trail.map(
                (props, key) => arr[key]({ style: props, key }),
                // <arr[index] key={index} style={{ transform: props.xy.to(trans) }} />
            )} */}
            <div
                key={1}
                id="nugg-holder"
                style={{
                    position: 'absolute',
                    alignItems: 'center',
                    display: 'flex',
                    justifyContent: 'center',
                    overflow: 'visible',

                    flexDirection: 'column',
                    ...childrenContainerStyle,
                    transform: 'var(--b)',
                    transformOrigin: 'center',
                }}
            >
                {children}
            </div>

            <svg
                key={2}
                height="200%"
                width="200%"
                filter={`drop-shadow(-10px 0px 15px ${shadowColor})`}
                style={{
                    ...styles.svgTransition,
                    transform: 'var(--a) rotate(-90deg)',
                    transformOrigin: 'center',
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
    );
};

export default React.memo(
    CircleTimerMobileCSS,
    (a, b) => a.tokenId === b.tokenId && a.remaining === b.remaining,
);
