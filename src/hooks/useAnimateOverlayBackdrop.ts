import { CSSProperties } from 'react';
import { PickAnimated } from '@react-spring/web';

import lib, { NLStyleSheetCreator } from '@src/lib';
import useDimensions from '@src/client/hooks/useDimensions';

const styles = NLStyleSheetCreator({
    wrapper: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        // background: 'transparent',
        // background: lib.colors.transparentDarkGrey2,

        overflow: 'hidden',
        zIndex: 999,
    },
    mobile: {},
});

export default (isOpen: boolean, style?: CSSProperties, delay?: number) => {
    const { screen: screenType } = useDimensions();
    // const [wrapperStyle]: [PickAnimated<CSSProperties>, any] = useSpring(
    //     {
    //         opacity: isOpen ? 1 : 0,
    //         delay,
    //     },
    //     [isOpen],
    // );
    return {
        animationDelay: delay,
        animation: `all 1s ${lib.layout.animation}`,
        ...styles.wrapper,

        pointerEvents: isOpen ? ('auto' as const) : ('none' as const),

        ...(screenType === 'phone'
            ? {
                  justifyContent: 'center',
                  alignItems: 'flex-start',
              }
            : {
                  justifyContent: 'center',
                  alignItems: 'center',
              }),
        ...style,
        backdropFilter: 'blur(50px)',
        // @danny7even this seemed to cause problems with issue #67 - but it didnt solve any
        WebkitBackdropFilter: 'blur(50px)',
        opacity: isOpen ? 1 : 0,
    } as const as PickAnimated<CSSProperties>;
};
