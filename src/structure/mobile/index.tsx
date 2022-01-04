import React, { FunctionComponent, useEffect } from 'react';
import { animated, config, useTransition } from 'react-spring';

import AccountViewer from '../../components/nugg/AccountViewer/AccountViewer';
import FloorPrice from '../../components/nugg/FloorPrice';
import AppState from '../../state/app';
import TokenState from '../../state/token';

import BottomBar from './BottomBar';
import styles from './index.styles';
import MintView from './MintView';
import SearchView from './SearchView';
import WalletView from './WalletView';

type Props = {};

const Mobile: FunctionComponent<Props> = () => {
    const currentView = AppState.select.mobileView();
    const nugg = TokenState.select.tokenId();
    useEffect(() => {
        if (nugg && currentView !== 'Search') {
            AppState.dispatch.changeMobileView('Search');
        }
    }, [nugg]);

    const tabFadeTransition = useTransition(currentView, {
        from: {
            opacity: 0,
            position: 'absolute',
            height: '100%',
            width: '100%',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            paddingBottom: '1rem',
        },
        enter: { opacity: 1 },
        leave: { opacity: 0 },
        config: config.default,
    });
    return (
        <div style={styles.container}>
            <div style={styles.account}>
                <AccountViewer />
            </div>
            <div style={styles.viewContainer}>
                {tabFadeTransition((style, value) => (
                    //@ts-ignore
                    <animated.div style={style}>
                        {value === 'Wallet' && <WalletView />}
                        {value === 'Mint' && <MintView />}
                        {value === 'Search' && <SearchView />}
                    </animated.div>
                ))}
            </div>
            <div style={styles.bottomBar}>
                <BottomBar />
            </div>
        </div>
    );
};

export default Mobile;
