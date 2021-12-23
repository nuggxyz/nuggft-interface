import React, { FunctionComponent, useCallback } from 'react';
import { BookOpen, Search } from 'react-feather';

import Button from '../../components/general/Buttons/Button/Button';
import ChainIndicator from '../../components/general/Buttons/ChainIndicator/ChainIndicator';
import TokenViewer from '../../components/nugg/TokenViewer';
import Colors from '../../lib/colors';
import AppState from '../../state/app';
import SwapState from '../../state/swap';

import styles from './BottomBar.styles';

type Props = {};

const BottomBar: FunctionComponent<Props> = () => {
    const mobileView = AppState.select.mobileView();
    const onClick = useCallback((view: NL.Redux.App.MobileViews) => {
        AppState.dispatch.changeMobileView(view);
    }, []);
    return (
        <div style={styles.container}>
            <Button
                onClick={() => onClick('Wallet')}
                rightIcon={<BookOpen />}
                buttonStyle={{
                    background:
                        mobileView === 'Wallet'
                            ? Colors.nuggBlueTransparent
                            : 'white',
                }}
            />
            <ChainIndicator
                onClick={mobileView !== 'Mint' && (() => onClick('Mint'))}
            />
            <Button
                onClick={() => onClick('Search')}
                rightIcon={<Search />}
                buttonStyle={{
                    background:
                        mobileView === 'Search'
                            ? Colors.nuggBlueTransparent
                            : 'white',
                }}
            />
        </div>
    );
};

export default BottomBar;
