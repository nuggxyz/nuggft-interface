import React, { FunctionComponent, useCallback } from 'react';
import { BookOpen, ChevronLeft, Search } from 'react-feather';

import Button from '../../components/general/Buttons/Button/Button';
import ChainIndicator from '../../components/general/Buttons/ChainIndicator/ChainIndicator';
import TokenViewer from '../../components/nugg/TokenViewer';
import Colors from '../../lib/colors';
import FontSize from '../../lib/fontSize';
import Layout from '../../lib/layout';
import AppState from '../../state/app';
import SwapState from '../../state/swap';
import TokenState from '../../state/token';

import styles from './BottomBar.styles';

type Props = {};

const BottomBar: FunctionComponent<Props> = () => {
    const nuggSelected = TokenState.select.tokenId();
    const mobileView = AppState.select.mobileView();
    const onClick = useCallback((view: NL.Redux.App.MobileViews) => {
        AppState.dispatch.changeMobileView(view);
    }, []);
    return (
        <div style={styles.container}>
            <Button
                onClick={() => onClick('Wallet')}
                rightIcon={<BookOpen color={Colors.nuggBlueText} />}
                buttonStyle={{
                    ...styles.button,
                    background:
                        mobileView === 'Wallet'
                            ? Colors.nuggBlueTransparent
                            : 'transparent',
                }}
            />
            <ChainIndicator
                onClick={mobileView !== 'Mint' && (() => onClick('Mint'))}
            />
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
                        <Search color={Colors.nuggBlueText} />
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
        </div>
    );
};

export default BottomBar;
