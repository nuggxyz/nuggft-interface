import React, { FC, useCallback } from 'react';

import ChainIndicator from '@src/components/general/Buttons/ChainIndicator/ChainIndicator';
import AccountViewer from '@src/components/nugg/AccountViewer/AccountViewer';
import FloorPrice from '@src/components/nugg/FloorPrice';
import NuggDexSearchBar from '@src/components/nugg/NuggDex/NuggDexSearchBar/NuggDexSearchBar';
import state from '@src/state';

import styles from './NavigationBar.styles';

type Props = {
    showBackButton?: boolean;
};

const NavigationBar: FC<Props> = () => {
    // const [ref, isHovering] = useOnHover();
    const screenType = state.app.select.screenType();
    const view = state.app.select.view();
    const onClick = useCallback(
        () => (view === 'Search' ? state.app.dispatch.changeView('Swap') : undefined),
        [view],
    );

    // const backgroundStyle = useMemo(() => {
    //     return {
    //         ...styles.navBarBackground,
    //         ...(isHovering && view === 'Search' ? styles.navBarHover : {}),
    //     };
    // }, [view, isHovering]);

    return (
        <div style={styles.navBarContainer}>
            <div style={styles.navBarBackground} onClick={onClick} />
            <div style={styles.searchBarContainer}>
                <NuggDexSearchBar />
            </div>
            <div
                style={{
                    whiteSpace: 'nowrap',
                    // display: 'flex',
                    alignItems: 'center',
                }}
            >
                <ChainIndicator />
                {screenType === 'tablet' && (
                    <div style={{ position: 'absolute', marginTop: '0rem' }}>
                        <FloorPrice />
                    </div>
                )}
            </div>
            <div
                style={{
                    ...styles.linkAccountContainer,
                    justifyContent: screenType === 'desktop' ? 'space-between' : 'flex-end',
                }}
            >
                {screenType === 'desktop' && <FloorPrice />}
                <AccountViewer />
            </div>
        </div>
    );
};

export default React.memo(NavigationBar);
