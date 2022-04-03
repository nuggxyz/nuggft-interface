import React, { FC, useCallback } from 'react';
import { animated } from '@react-spring/web';

import ChainIndicator from '@src/components/general/Buttons/ChainIndicator/ChainIndicator';
import AccountViewer from '@src/components/nugg/AccountViewer/AccountViewer';
import FloorPrice from '@src/components/nugg/FloorPrice';
import NuggDexSearchBar from '@src/components/nugg/NuggDex/NuggDexSearchBar/NuggDexSearchBar';
import state from '@src/state';
import useFirefoxBlur from '@src/hooks/useFirefoxBlur';
import HealthIndicator from '@src/components/general/Buttons/HealthIndicator/HealthIndicator';
import NLStaticImage from '@src/components/general/NLStaticImage';
import client from '@src/client';
import Button from '@src/components/general/Buttons/Button/Button';

import styles from './NavigationBar.styles';

type Props = {
    showBackButton?: boolean;
};

const NavigationBar: FC<Props> = () => {
    // const [ref, isHovering] = useOnHover();
    const screenType = state.app.select.screenType();
    const isViewOpen = client.live.isViewOpen();
    const toggleView = client.mutate.toggleView();
    const toggleMobileWallet = client.mutate.toggleMobileWallet();

    const onClick = useCallback(() => (isViewOpen ? toggleView() : undefined), [isViewOpen]);

    const container = useFirefoxBlur(['modal'], styles.navBarContainer);
    return (
        <animated.div style={container}>
            <div
                role="button"
                aria-hidden="true"
                style={styles.navBarBackground}
                onClick={onClick}
            />
            <div
                style={{
                    ...styles.searchBarContainer,
                    ...(isViewOpen && screenType === 'phone' ? { width: '100%' } : {}),
                }}
            >
                <NuggDexSearchBar />
            </div>
            {!isViewOpen && (
                <>
                    <div style={{ marginRight: '10px' }}>
                        <HealthIndicator />
                    </div>
                    {screenType === 'phone' && (
                        <Button
                            hoverStyle={{ cursor: 'pointer' }}
                            buttonStyle={{ background: 'transparent', padding: '0', zIndex: 1000 }}
                            onClick={() => (isViewOpen ? toggleView() : toggleMobileWallet())}
                            rightIcon={<NLStaticImage image="nuggbutton" />}
                        />
                    )}
                </>
            )}

            {screenType !== 'phone' && (
                <div
                    style={{
                        whiteSpace: 'nowrap',
                        position: 'relative',
                    }}
                >
                    <ChainIndicator />
                    {screenType === 'tablet' && (
                        <div
                            style={{
                                position: 'absolute',
                                marginTop: '0rem',
                                width: '100%',
                            }}
                        >
                            <FloorPrice />
                        </div>
                    )}
                </div>
            )}
            <div
                style={{
                    ...styles.linkAccountContainer,
                    justifyContent: screenType === 'desktop' ? 'space-between' : 'flex-end',
                }}
            >
                {screenType === 'desktop' && <FloorPrice />}
                <AccountViewer />
            </div>
        </animated.div>
    );
};

export default React.memo(NavigationBar);
