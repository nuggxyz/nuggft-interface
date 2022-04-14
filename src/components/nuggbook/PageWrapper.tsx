import React, { FC, PropsWithChildren } from 'react';
import { animated, config, useSpring, useTransition } from '@react-spring/web';

import client from '@src/client';
import useAnimateOverlayBackdrop from '@src/hooks/useAnimateOverlayBackdrop';
import lib from '@src/lib';
import { Page } from '@src/interfaces/nuggbook';

const Modal: FC<PropsWithChildren<{ height: number; top: number }>> = ({
    height,
    top,
    children,
}) => {
    const isOpen = client.nuggbook.useNuggBookPage();

    const containerStyle = useSpring({
        from: {
            top: 1000,
        },
        to: {
            top,
        },
        config: config.default,
    });

    const style: CSSPropertiesAnimated = useAnimateOverlayBackdrop(isOpen !== Page.Close);

    const tabFadeTransition = useTransition(children, {
        from: {
            opacity: 0,
        },
        enter: { opacity: 1 },
        leave: { opacity: 0 },
        config: config.default,
    });

    return (
        <animated.div
            style={{
                ...style,
                height: '100%',
                width: '100%',
                justifyContent: 'flex-end',
                display: 'flex',
                flexDirection: 'column',
                zIndex: 100000,
            }}
        >
            <animated.div
                style={{
                    ...containerStyle,
                    height,
                    width: '100%',
                    background: lib.colors.white,
                    borderTopLeftRadius: lib.layout.borderRadius.largish,
                    borderTopRightRadius: lib.layout.borderRadius.largish,
                    position: 'absolute',
                }}
            >
                {tabFadeTransition((_styles, ItemComp) => (
                    <animated.div style={_styles}>{ItemComp}</animated.div>
                ))}
            </animated.div>
        </animated.div>
    );
};

// const styles = NLStyleSheetCreator({
//     wrapper: {
//         position: 'absolute',
//         width: '100%',
//         height: '100%',
//         display: 'flex',
//         justifyContent: 'center',
//         alignItems: 'center',

//         background: 'transparent',
//         transition: `opacity .5s ${lib.layout.animation}`,
//         backdropFilter: 'blur(10px)',
//         WebkitBackdropFilter: 'blur(10px)',
//         zIndex: 999,
//     },
//     open: {
//         opacity: 1,
//         background: lib.colors.transparentGrey,
//         zIndex: 999,
//         overflow: 'hidden',
//     },
//     closed: {
//         opacity: 0,
//         background: 'transparent',
//     },
//     container: {
//         background: lib.colors.transparentDarkGrey,
//         backdropFilter: 'blur(20px)',
//         // commented out to fix issue #64
//         // WebkitBackdropFilter: 'blur(20px)',
//         transition: `.2s all ${lib.layout.animation}`,
//         display: 'flex',
//         flexDirection: 'row',
//         justifyContent: 'center',
//         position: 'relative',
//         borderRadius: lib.layout.borderRadius.largish,
//         padding: '1rem',
//         width: '100%',
//         transform: 'translate(1.5rem, 1.5rem)',
//         height: '100%',
//         margin: '0rem',
//         // margin: '0rem .5rem',
//         minWidth: '0px',
//     },
//     containerFull: { width: '630px' },
//     containerMobile: {},
//     containerOpen: {
//         transform: 'translate(.5rem, .5rem)',
//     },
//     containerBackground: {
//         position: 'absolute',
//         background: lib.colors.gradient2Transparent,
//         transition: `.2s all ${lib.layout.animation}`,
//         opacity: 1,
//         width: '100%',
//         padding: '1rem',
//         height: '100%',
//         borderRadius: lib.layout.borderRadius.largish,
//     },
//     containerBackgroundOpen: { transform: 'translate(-.2rem, -.2rem)' },
//     closeButton: {
//         position: 'absolute',
//         top: 0,
//         right: 0,
//     },
// });

export default React.memo(Modal);
