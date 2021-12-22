import React, { FC, ReactChild } from 'react';
import { ChevronRight, ChevronLeft } from 'react-feather';

import { EthInt } from '../../../../classes/Fraction';
import { isUndefinedOrNullOrStringEmpty } from '../../../../lib';
import Colors from '../../../../lib/colors';
import Layout from '../../../../lib/layout';
import AppState from '../../../../state/app';
import ProtocolState from '../../../../state/protocol';
import Web3State from '../../../../state/web3';
import Button from '../../../general/Buttons/Button/Button';
import CurrencyText from '../../../general/Texts/CurrencyText/CurrencyText';
import Text from '../../../general/Texts/Text/Text';
// import ChainIndicator from '../../../general/Buttons/ChainIndicator/ChainIndicator';
import NavigationBar from '../NavigationBar/NavigationBar';

import styles from './PageContainer.styles';

type Props = {
    children: ReactChild | ReactChild[];
    showBackButton?: boolean;
};

const PageContainer: FC<Props> = ({ children }) => {
    // const isOpen = AppState.select.walletVisible();
    // const address = Web3State.select.web3address();
    return (
        <>
            <NavigationBar />
            {/* {!isUndefinedOrNullOrStringEmpty(address) && (
                <Button
                    hoverStyle={styles.hoverColor}
                    buttonStyle={styles.toggleContainer}
                    rightIcon={
                        isOpen ? (
                            <ChevronRight style={styles.iconColor} />
                        ) : (
                            <ChevronLeft style={styles.iconColor} />
                        )
                    }
                    onClick={() => AppState.dispatch.toggleWallet()}
                />
            )} */}
            {/* <div style={styles.bottomLeft}>
            </div> */}

            {children}
        </>
    );
};
export default React.memo(PageContainer);
