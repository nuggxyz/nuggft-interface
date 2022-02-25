import React, { FunctionComponent, useEffect } from 'react';
import { animated, config, useSpring } from 'react-spring';

import Colors from '@src/lib/colors';
import AppState from '@src/state/app';
import TokenState from '@src/state/token';

import BottomBar from './BottomBar/BottomBar';
import styles from './index.styles';
import MintView from './MintView/MintView';
import SearchView from './SearchView/SearchView';
import WalletView from './WalletView';

type Props = {};

const sty = {
    position: 'absolute',
    height: '100%',
    width: '100%',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingBottom: '1rem',
};

const Mobile: FunctionComponent<Props> = () => {
    const currentView = AppState.select.mobileView();
    const nugg = TokenState.select.tokenId();
    useEffect(() => {
        if (nugg && currentView !== 'Search') {
            AppState.dispatch.changeMobileView('Search');
        }
    }, [nugg]);

    const wallet = useSpring({
        opacity: currentView === 'Wallet' ? 1 : 0,
        pointerEvents: currentView === 'Wallet' ? 'auto' : 'none',
        zIndex: currentView === 'Wallet' ? 1 : 0,
        ...sty,
        config: config.default,
    });
    const mint = useSpring({
        opacity: currentView === 'Mint' ? 1 : 0,
        pointerEvents: currentView === 'Mint' ? 'auto' : 'none',
        zIndex: currentView === 'Mint' ? 1 : 0,
        ...sty,
        config: config.default,
    });
    const search = useSpring({
        opacity: currentView === 'Search' ? 1 : 0,
        pointerEvents: currentView === 'Search' ? 'auto' : 'none',
        zIndex: currentView === 'Search' ? 1 : 0,
        ...sty,
        config: config.default,
    });

    return (
        <div
            style={{
                ...styles.container,
                background:
                    currentView === 'Wallet'
                        ? Colors.gradient3
                        : currentView === 'Search'
                        ? Colors.gradient2
                        : 'transparent',
            }}>
            <div style={styles.viewContainer}>
                <animated.div
                    //@ts-ignore¸
                    style={wallet}>
                    <WalletView />
                </animated.div>
                <animated.div
                    //@ts-ignore¸
                    style={mint}>
                    <MintView />
                </animated.div>
                <animated.div
                    //@ts-ignore¸
                    style={search}>
                    <SearchView />
                </animated.div>
            </div>
            <div style={styles.bottomBar}>
                <BottomBar />
            </div>
        </div>
    );
};

export default Mobile;
