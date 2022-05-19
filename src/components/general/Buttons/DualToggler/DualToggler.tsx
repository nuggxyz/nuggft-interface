import { animated, config, useSpring } from '@react-spring/web';
import React, { CSSProperties } from 'react';
import { IconType } from 'react-icons/lib';

import useMeasure from '@src/hooks/useMeasure';
import lib from '@src/lib';

const DualToggler = ({
    activeIndex,
    containerStyle,
    floaterStyle,
    toggleActiveIndex,
    LeftIcon,
    RightIcon,
}: {
    activeIndex: 0 | 1;
    containerStyle?: CSSProperties;
    floaterStyle?: CSSProperties;
    toggleActiveIndex: (input: 0 | 1) => undefined;
    LeftIcon: IconType;
    RightIcon: IconType;
}) => {
    const [headerRef, { width: WIDTH }] = useMeasure();

    const selectionIndicatorSpring = useSpring({
        // from: {
        //     x: 0,
        //     opacity: 1,
        // },

        to: {
            x: activeIndex * (WIDTH / 2) - 22.5,
        },
        // immediate: {
        //     opacity: 1,
        //     x: activeIndex * (WIDTH / 2) - 22.5,
        // },
        config: config.stiff,
    });

    return (
        <div
            ref={headerRef}
            style={{
                display: 'flex',
                zIndex: 300010,
                width: 90,
                justifyContent: 'space-around',
                position: 'relative',
                ...containerStyle,
            }}
        >
            <animated.div
                style={{
                    top: -5,
                    width: `40px`,
                    height: `40px`,
                    ...selectionIndicatorSpring,
                    position: 'absolute',
                    zIndex: -1,
                    background: lib.colors.transparentWhite,
                    borderRadius: lib.layout.borderRadius.mediumish,
                    WebkitBackdropFilter: 'blur(30px)',
                    backdropFilter: 'blur(30px)',
                    display: 'flex',
                    ...floaterStyle,
                }}
            />
            <LeftIcon
                color={lib.colors.primaryColor}
                size={30}
                onClick={() => toggleActiveIndex(0)}
            />
            <RightIcon
                color={lib.colors.primaryColor}
                size={30}
                onClick={() => toggleActiveIndex(1)}
            />
        </div>
    );
};

export default DualToggler;
