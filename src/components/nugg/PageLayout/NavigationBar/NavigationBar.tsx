import React, { FC, useCallback, useMemo } from 'react';

import useOnHover from '../../../../hooks/useOnHover';
import AppState from '../../../../state/app';
import ChainIndicator from '../../../general/Buttons/ChainIndicator/ChainIndicator';
import LinkAccountButton from '../../../general/Buttons/LinkAccountButton/LinkAccountButton';
import NuggDexSearchBar from '../../NuggDex/NuggDexSearchBar/NuggDexSearchBar';

import styles from './NavigationBar.styles';

type Props = {
    showBackButton?: boolean;
};

const NavigationBar: FC<Props> = () => {
    // const [ref, isHovering] = useOnHover();
    const view = AppState.select.view();
    const onClick = useCallback(
        () =>
            view === 'Search'
                ? AppState.dispatch.changeView('Swap')
                : undefined,
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
                style={{ width: '30%', display: 'flex', alignItems: 'center' }}>
                <ChainIndicator />
            </div>
            <div style={styles.linkAccountContainer}>
                <LinkAccountButton />
            </div>
        </div>
    );
};

export default React.memo(NavigationBar);
