import React, { FunctionComponent } from 'react';

import AppState from '../../state/app';

import BottomBar from './BottomBar';
import styles from './index.styles';
import MintView from './MintView';
import SearchView from './SearchView';
import WalletView from './WalletView';

type Props = {};

const Mobile: FunctionComponent<Props> = () => {
    const currentView = AppState.select.mobileView();
    return (
        <div style={styles.container}>
            <div style={styles.viewContainer}>
                {currentView === 'Wallet' && <WalletView />}
                {currentView === 'Mint' && <MintView />}
                {currentView === 'Search' && <SearchView />}
            </div>
            <div style={styles.bottomBar}>
                <BottomBar />
            </div>
        </div>
    );
};

export default Mobile;
