import React, { FunctionComponent, useCallback } from 'react';
import { BookOpen, Search } from 'react-feather';

import Button from '../../components/general/Buttons/Button/Button';
import ChainIndicator from '../../components/general/Buttons/ChainIndicator/ChainIndicator';
import TokenViewer from '../../components/nugg/TokenViewer';
import AppState from '../../state/app';
import SwapState from '../../state/swap';

import styles from './BottomBar.styles';

type Props = {};

const BottomBar: FunctionComponent<Props> = () => {
    const onClick = useCallback((view: NL.Redux.App.MobileViews) => {
        AppState.dispatch.changeMobileView(view);
    }, []);
    return (
        <div style={styles.container}>
            <Button
                onClick={() => onClick('Wallet')}
                rightIcon={<BookOpen />}
            />
            <ChainIndicator onClick={() => onClick('Mint')} />
            <Button onClick={() => onClick('Search')} rightIcon={<Search />} />
        </div>
    );
};

export default BottomBar;
