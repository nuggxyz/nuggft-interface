import { PickAnimated, useSpring } from '@react-spring/web';
import { CSSProperties } from 'react';

import { NLStyleSheetCreator } from '@src/lib';
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
    const [wrapperStyle]: [PickAnimated<CSSProperties>, any] = useSpring(
        {
            ...styles.wrapper,
            opacity: isOpen ? 1 : 0,
            pointerEvents: isOpen ? 'auto' : 'none',
            delay,

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
            backdropFilter: 'blur(10px)',
            // @danny7even this seemed to cause problems with issue #67 - but it didnt solve any
            WebkitBackdropFilter: 'blur(10px)',
        },
        [isOpen],
    );
    return wrapperStyle;
};
