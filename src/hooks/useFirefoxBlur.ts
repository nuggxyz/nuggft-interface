import { CSSProperties } from 'react';
import { useSpring } from '@react-spring/web';

import AppState from '@src/state/app';
import client from '@src/client';

const useFirefoxBlur = (
    triggers: ['modal'?, 'searchView'?],
    otherStyle?: CSSProperties,
): CSSPropertiesAnimated => {
    const modalIsOpen = AppState.select.modalIsOpen();
    const isViewOpen = client.live.isViewOpen();

    const style = useSpring({
        ...otherStyle,
        filter:
            (modalIsOpen && triggers.includes('modal')) ||
            (isViewOpen && triggers.includes('searchView'))
                ? 'blur(10px)'
                : 'blur(0px)',
    });

    return style;
};

export default useFirefoxBlur;
