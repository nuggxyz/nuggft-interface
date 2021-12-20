import React, { FC, ReactChild } from 'react';
import { ChevronRight, ChevronLeft } from 'react-feather';

import { isUndefinedOrNullOrStringEmpty } from '../../../../lib';
import AppState from '../../../../state/app';
import Web3Selectors from '../../../../state/web3/selectors';
import Button from '../../../general/Buttons/Button/Button';
import ChainIndicator from '../../../general/Buttons/ChainIndicator/ChainIndicator';
import NavigationBar from '../NavigationBar/NavigationBar';

import styles from './PageContainer.styles';

type Props = {
    children: ReactChild | ReactChild[];
    showBackButton?: boolean;
};

const PageContainer: FC<Props> = ({ children }) => {
    const isOpen = AppState.select.walletVisible();
    const address = Web3Selectors.web3address();
    return (
        <>
            <NavigationBar />
            {!isUndefinedOrNullOrStringEmpty(address) && (
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
            )}
            <div style={styles.bottomRight}>
                <ChainIndicator />
            </div>

            {children}
        </>
    );
};
export default React.memo(PageContainer);
