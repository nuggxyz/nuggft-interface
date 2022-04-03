import { animated } from '@react-spring/web';
import React, { FunctionComponent, useCallback } from 'react';

import useAnimateOverlay from '@src/hooks/useAnimateOverlay';
import client from '@src/client';
import Wallet from '@src/components/nugg/Wallet/Wallet';
import useFirefoxBlur from '@src/hooks/useFirefoxBlur';

type Props = Record<string, never>;

const WalletView: FunctionComponent<Props> = () => {
    const isMobileWalletOpen = client.live.isMobileWalletOpen();

    const toggleMobileWallet = client.mutate.toggleMobileWallet();

    const onClick = useCallback(
        () => (isMobileWalletOpen ? toggleMobileWallet() : undefined),
        [isMobileWalletOpen],
    );
    const style = useAnimateOverlay(isMobileWalletOpen, {
        zIndex: 999,
    });

    const modalStyle = useFirefoxBlur(['modal', undefined, 'editView', undefined, undefined]);

    return (
        <animated.div
            style={{
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
                width: '100%',
                height: '100%',
                padding: '0rem .5rem',

                ...style,
                ...modalStyle,
            }}
            onClick={onClick}
        >
            <div
                aria-hidden="true"
                role="button"
                style={{
                    display: 'flex',
                    height: '100%',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    position: 'relative',
                    overflow: 'scroll',
                    width: '100%',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div style={{ marginTop: '50px' }} />
                <Wallet />
            </div>
        </animated.div>
    );
};

export default WalletView;
