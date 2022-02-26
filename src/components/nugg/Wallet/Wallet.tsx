import React, { FunctionComponent, useMemo } from 'react';

import HappyTabber, { HappyTabberItem } from '@src/components/general/HappyTabber/HappyTabber';
import AppState from '@src/state/app';
import web3 from '@src/web3';
import state from '@src/state';

import ClaimTab from './tabs/ClaimTab/ClaimTab';
import ConnectWalletTab from './tabs/ConnectWalletTab';
import LoansTab from './tabs/LoansTab/LoansTab';
import MintTab from './tabs/MintTab/MintTab';
import SalesTab from './tabs/SalesTab/SalesTab';
import styles from './Wallet.styles';
type Props = {};

// const call = ;

const Wallet: FunctionComponent<Props> = () => {
    const screenType = AppState.select.screenType();
    const account = web3.hook.usePriorityAccount();

    state.socket.hook.useBlock((event) => {
        console.log('block:', { event });
    });

    const happytabs: HappyTabberItem[] = useMemo(
        () => [
            ...(account
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
        [account],
    );

    return (
        <div
            style={{
                ...styles.wallet,
                ...(screenType === 'tablet' && { width: '100%' }),
                ...(screenType === 'phone' && { height: '100%' }),
            }}
        >
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
