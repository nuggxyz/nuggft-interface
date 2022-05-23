import React, { CSSProperties, FunctionComponent, useMemo } from 'react';
import { animated, config, useSpring } from '@react-spring/web';

import lib from '@src/lib';

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

// export const Basic: FunctionComponent<Props> = ({
//     children,

//     // eslint-disable-next-line @typescript-eslint/no-unused-vars
//     blocktime,
//     staticColor,
//     style,
//     width,
//     strokeWidth = 20,
//     childrenContainerStyle,
//     defaultColor,
// }) => {
//     return (
//         <div style={{ ...styles.container, ...style }}>
//             <div style={{ ...styles.childrenContainer, ...childrenContainerStyle }}>{children}</div>
//             <svg
//                 height="100%"
//                 width="100%"
//                 filter={`drop-shadow(-10px 0px 15px ${staticColor || defaultColor})`}
//                 style={styles.svgTransition}
//             >
//                 <animated.circle
//                     cx="50%"
//                     cy="50%"
//                     r={width / 6.5 + 50}
//                     strokeDashoffset={0}
//                     fill="none"
//                 />
//                 <animated.circle
//                     cx="50%"
//                     cy="50%"
//                     r={width / 6.5}
//                     stroke={
//                         (staticColor || defaultColor) === 'transparent' ? 'transparent' : 'white'
//                     }
//                     strokeDashoffset={0}
//                     strokeWidth={strokeWidth}
//                     fill="none"
//                     strokeDasharray={`${(width / 6.5) * TWOPI} ${(width / 6.5) * TWOPI}`}
//                     strokeLinecap="round"
//                 />
//             </svg>
//         </div>
//     );
// };

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
        if (staticColor || percent >= 1) {
            return staticColor || defaultColor;
        }
        if (percent <= 0.1) {
            return lib.colors.nuggRedText;
        }
        if (percent <= 0.25) {
            return lib.colors.nuggGold;
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

const CircleTimerMobile = React.memo(
    Normal,
    (a, b) => a.remaining === b.remaining && a.tokenId === b.tokenId,
);

export default CircleTimerMobile;
