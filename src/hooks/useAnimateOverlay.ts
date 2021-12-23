import { useSpring } from '@react-spring/core';
import { CSSProperties } from 'react';

import { NLStyleSheetCreator } from '../lib';

const useAnimateOverlay = (isOpen: boolean, style?: CSSProperties) => {
    const wrapperStyle: any = useSpring({
        ...styles.wrapper,
        opacity: isOpen ? 1 : 0,
        pointerEvents: isOpen ? 'auto' : 'none',
        ...style,
    });
    return wrapperStyle;
};

export default useAnimateOverlay;

const styles = NLStyleSheetCreator({
    wrapper: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',

        background: 'transparent',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        overflow: 'hidden',
        zIndex: 999,
    },
    mobile:{
        
    }
});
