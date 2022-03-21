import { CSSProperties } from 'react';
import { useSpring } from '@react-spring/web';

import AppState from '@src/state/app';
import client from '@src/client';

const useFirefoxBlur = (
    triggers: ['modal'?, 'searchView'?, 'editView'?],
    otherStyle?: CSSProperties,
): CSSPropertiesAnimated => {
    const modalIsOpen = AppState.select.modalIsOpen();
    const isViewOpen = client.live.isViewOpen();
    const editingNugg = client.live.editingNugg();

    const style = useSpring({
        ...otherStyle,
        filter:
            (modalIsOpen && triggers.includes('modal')) ||
            (isViewOpen && triggers.includes('searchView')) ||
            (editingNugg && triggers.includes('editView'))
                ? 'blur(10px)'
                : 'blur(0px)',
    });

    return style;
};

export default useFirefoxBlur;
