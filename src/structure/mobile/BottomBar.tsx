import React, { FunctionComponent, useCallback } from 'react';
import { BookOpen, ChevronLeft, Search } from 'react-feather';
import { IoWalletSharp, IoBookSharp } from 'react-icons/io5';

import Button from '../../components/general/Buttons/Button/Button';
import ChainIndicator from '../../components/general/Buttons/ChainIndicator/ChainIndicator';
import NLStaticImage from '../../components/general/NLStaticImage';
import Jazzicon from '../../components/nugg/Jazzicon';
import TokenViewer from '../../components/nugg/TokenViewer';
import Colors from '../../lib/colors';
import FontSize from '../../lib/fontSize';
import Layout from '../../lib/layout';
import AppState from '../../state/app';
import SwapState from '../../state/swap';
import TokenState from '../../state/token';
import Web3State from '../../state/web3';

import styles from './BottomBar.styles';

type Props = {};

const BottomBar: FunctionComponent<Props> = () => {
    const nuggSelected = TokenState.select.tokenId();
    const mobileView = AppState.select.mobileView();
    const onClick = useCallback((view: NL.Redux.App.MobileViews) => {
        AppState.dispatch.changeMobileView(view);
    }, []);
    const address = Web3State.select.web3address();
    return (
        <div style={styles.container}>
            <Button
                onClick={() =>
                    nuggSelected && mobileView === 'Search'
                        ? TokenState.dispatch.setNugg(undefined)
                        : onClick('Search')
                }
                leftIcon={
                    nuggSelected && mobileView === 'Search' ? (
                        <ChevronLeft color={Colors.nuggBlueText} />
                    ) : (
                        <IoBookSharp color="white" size="25" />
                    )
                }
                label={nuggSelected && mobileView === 'Search' ? 'Back' : ''}
                textStyle={{
                    fontFamily: Layout.font.inter.light,
                    color: Colors.nuggBlueText,
                    fontSize: FontSize.h6,
                }}
                buttonStyle={{
                    ...styles.button,
                    paddingRight:
                        nuggSelected && mobileView === 'Search'
                            ? '1rem'
                            : '.5rem',
                    background:
                        mobileView === 'Search'
                            ? Colors.nuggBlueTransparent
                            : 'transparent',
                }}
            />
            <ChainIndicator
                onClick={mobileView !== 'Mint' && (() => onClick('Mint'))}
            />
            <Button
                onClick={() => onClick('Wallet')}
                rightIcon={<IoWalletSharp color="white" size="25" />}
                buttonStyle={{
                    ...styles.button,
                    background:
                        mobileView === 'Wallet'
                            ? Colors.nuggBlueTransparent
                            : 'transparent',
                }}
            />
        </div>
    );
};

export default BottomBar;
