import React, { FC, useCallback, useMemo } from 'react';

import { EthInt } from '../../../../classes/Fraction';
import useOnHover from '../../../../hooks/useOnHover';
import Colors from '../../../../lib/colors';
import Layout from '../../../../lib/layout';
import AppState from '../../../../state/app';
import ProtocolState from '../../../../state/protocol';
import ChainIndicator from '../../../general/Buttons/ChainIndicator/ChainIndicator';
import AccountViewer from '../../AccountViewer/AccountViewer';
import CurrencyText from '../../../general/Texts/CurrencyText/CurrencyText';
import Text from '../../../general/Texts/Text/Text';
import FloorPrice from '../../FloorPrice';
import NuggDexSearchBar from '../../NuggDex/NuggDexSearchBar/NuggDexSearchBar';
import NumberStatistic from '../../Statistics/NumberStatistic';

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
                style={{
                    whiteSpace: 'nowrap',
                    display: 'flex',
                    alignItems: 'center',
                }}>
                <ChainIndicator />
            </div>
            {/* <div
                style={{
                    zIndex: 1000,
                    display: 'flex',
                    background: 'white',
                    borderRadius: Layout.borderRadius.large,
                    padding: '.4rem .7rem',
                    alignItems: 'center',
                }}>
                <Text
                    type="text"
                    size="small"
                    weight="bolder"
                    textStyle={{
                        paddingRight: '.6rem',
                        color: Colors.nuggBlueText,
                        font: Layout.font.inter.bold,
                    }}>
                    FLOOR
                </Text>
                <CurrencyText
                    image="eth"
                    value={new EthInt(valuePerShare).decimal.toNumber()}
                />
            </div> */}
            <div style={styles.linkAccountContainer}>
                <FloorPrice />
                <AccountViewer />
            </div>
        </div>
    );
};

export default React.memo(NavigationBar);
