import React, { FunctionComponent, useEffect, useMemo } from 'react';

import AppState from '../../../state/app';
import Web3State from '../../../state/web3';
import config from '../../../state/web32/config';
import HappyTabber, { HappyTabberItem } from '../../general/HappyTabber/HappyTabber';
import NLStaticImage from '../../general/NLStaticImage';

import ClaimTab from './tabs/ClaimTab/ClaimTab';
import ConnectWalletTab from './tabs/ConnectWalletTab';
import LoansTab from './tabs/LoansTab/LoansTab';
import MintTab from './tabs/MintTab/MintTab';
import SalesTab from './tabs/SalesTab/SalesTab';
import styles from './Wallet.styles';

type Props = {};

const Wallet: FunctionComponent<Props> = () => {
    const address = Web3State.select.web3address();
    const screenType = AppState.select.screenType();

    const chainId = config.priority.usePriorityChainId();
    const accounts = config.priority.usePriorityAccounts();
    const error = config.priority.usePriorityError();
    const isActivating = config.priority.usePriorityIsActivating();

    const isActive = config.priority.usePriorityIsActive();

    const provider = config.priority.usePriorityProvider();
    const ENSNames = config.priority.usePriorityENSNames(provider);

    useEffect(() => {
        console.log({ chainId, accounts, error, isActivating, isActive, ENSNames });
    }, [chainId, accounts, error, isActivating, isActive, ENSNames]);

    const happytabs: HappyTabberItem[] = useMemo(
        () => [
            ...(address
                ? [
                      {
                          label: 'Home',
                          comp: ({ isActive }) => <MintTab />,
                      },
                      {
                          label: 'Claims',
                          comp: ({ isActive }) => <ClaimTab isActive={isActive} />,
                      },
                      {
                          label: 'Sales',
                          comp: ({ isActive }) => <SalesTab isActive={isActive} />,
                      },
                      {
                          label: 'Loans',
                          comp: ({ isActive }) => <LoansTab isActive={isActive} />,
                      },
                  ]
                : [
                      {
                          label: 'Home',
                          comp: ({ isActive }) => <ConnectWalletTab />,
                      },
                  ]),
        ],
        [address],
    );

    return (
        <div
            style={{
                ...styles.wallet,
                ...(screenType === 'tablet' && { width: '100%' }),
                ...(screenType === 'phone' && { height: '100%' }),
            }}>
            <HappyTabber
                items={happytabs}
                bodyStyle={screenType === 'phone' ? styles.mobileBody : styles.body}
                headerTextStyle={
                    screenType === 'phone' ? styles.mobileHeaderText : styles.headerText
                }
            />
        </div>
    );
};

export default React.memo(Wallet);
