import { animated } from '@react-spring/web';
import React, { useCallback } from 'react';
import { IoChevronBackOutline } from 'react-icons/io5';

import ViewingNugg from '@src/components/nugg/ViewingNugg/ViewingNugg';
import useAnimateOverlay from '@src/hooks/useAnimateOverlay';
import client from '@src/client';
import useFirefoxBlur from '@src/hooks/useFirefoxBlur';
import Button from '@src/components/general/Buttons/Button/Button';
import lib, { NLStyleSheetCreator } from '@src/lib';

const styles = NLStyleSheetCreator({
    container: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'space-between',
    },
    nuggDexContainer: {
        display: 'flex',
        width: '40%',
        height: '100%',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },
    tokenContainer: {
        display: 'flex',
        width: '40%',
        height: '100%',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        overflow: 'scroll',
    },
});

export default () => {
    const isMobileViewOpen = client.live.isMobileViewOpen();

    const hideMobileViewingNugg = client.mutate.hideMobileViewingNugg();

    const onClick = useCallback(
        () => (isMobileViewOpen ? hideMobileViewingNugg() : undefined),
        [isMobileViewOpen, hideMobileViewingNugg],
    );
    const style = useAnimateOverlay(isMobileViewOpen, {
        zIndex: 998,
        ...styles.container,
    });

    const modalStyle = useFirefoxBlur(['modal', undefined, 'editView', undefined, 'mobileWallet']);

    return (
        <animated.div style={{ ...styles.container, ...style, ...modalStyle }} onClick={onClick}>
            <div
                aria-hidden="true"
                role="button"
                style={{
                    ...styles.tokenContainer,
                    width: '100%',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <ViewingNugg
                    MobileBackButton={React.memo(() => (
                        <Button
                            leftIcon={
                                <IoChevronBackOutline color={lib.colors.nuggBlueText} size="25" />
                            }
                            onClick={onClick}
                            buttonStyle={{
                                background: lib.colors.transparentWhite,
                                borderRadius: lib.layout.borderRadius.large,
                                padding: '0.4rem',
                                marginTop: 50,
                            }}
                            textStyle={{
                                fontFamily: lib.layout.font.sf.light,
                                color: lib.colors.nuggBlueText,
                                fontSize: lib.fontSize.h6,
                            }}
                        />
                    ))}
                />
            </div>
        </animated.div>
    );
};
