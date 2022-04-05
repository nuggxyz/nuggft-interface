import { animated } from '@react-spring/web';
import React, { FunctionComponent } from 'react';
import { useNavigate } from 'react-router-dom';

import useAnimateOverlay from '@src/hooks/useAnimateOverlay';
import Wallet from '@src/components/nugg/Wallet/Wallet';
import useBlur from '@src/hooks/useBlur';

type Props = Record<string, never>;

const WalletView: FunctionComponent<Props> = () => {
    const navigate = useNavigate();
    const style = useAnimateOverlay(true, {
        zIndex: 999,
    });

    const blur = useBlur(['/wallet']);

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
                ...blur,
            }}
            onClick={() => navigate('/')}
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
                <div style={{ marginTop: '75px' }} />
                <Wallet />
            </div>
        </animated.div>
    );
};

export default WalletView;
