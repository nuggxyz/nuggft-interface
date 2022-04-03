import { CSSProperties } from 'react';
import { useSpring } from '@react-spring/web';

import AppState from '@src/state/app';
import client from '@src/client';

const useFirefoxBlur = (
    triggers: ['modal'?, 'searchView'?, 'editView'?, 'mobileSearchView'?, 'mobileWallet'?],
    otherStyle?: CSSProperties,
): CSSPropertiesAnimated => {
    const modalIsOpen = AppState.select.modalIsOpen();
    const isViewOpen = client.live.isViewOpen();
    const editingNugg = client.live.editingNugg();
    const isMobileViewOpen = client.live.isMobileViewOpen();
    const isMobileWalletOpen = client.live.isMobileWalletOpen();

    const screenType = AppState.select.screenType();

    const style = useSpring({
        ...otherStyle,
        filter:
            (isMobileViewOpen && screenType === 'phone' && triggers.includes('mobileSearchView')) ||
            (modalIsOpen && triggers.includes('modal')) ||
            (isViewOpen && triggers.includes('searchView')) ||
            (editingNugg && triggers.includes('editView')) ||
            (isMobileWalletOpen && screenType === 'phone' && triggers.includes('mobileWallet'))
                ? 'blur(10px)'
                : 'blur(0px)',
    });

    return style;
};

export default useFirefoxBlur;
