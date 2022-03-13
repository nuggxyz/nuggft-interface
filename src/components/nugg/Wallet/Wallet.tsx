import React, { FunctionComponent, useMemo } from 'react';

import HappyTabber, { HappyTabberItem } from '@src/components/general/HappyTabber/HappyTabber';
import state from '@src/state';
import web3 from '@src/web3';

import ClaimTab from './tabs/ClaimTab/ClaimTab';
import ConnectTab from './tabs/ConnectTab/ConnectTab';
import LoanTab from './tabs/LoanTab/LoanTab';
import HomeTab from './tabs/HomeTab/HomeTab';
import styles from './Wallet.styles';
type Props = Record<string, never>;

const Wallet: FunctionComponent<Props> = () => {
    const screenType = state.app.select.screenType();
    const account = web3.hook.usePriorityAccount();

    const happytabs: HappyTabberItem[] = useMemo(
        () => [
            ...(account
                ? [
                      {
                          label: 'Home',
                          comp: () => <HomeTab />,
                      },
                      {
                          label: 'Claims',
                          comp: () => <ClaimTab />,
                      },

                      {
                          label: 'Loans',
                          comp: () => <LoanTab />,
                      },
                  ]
                : [
                      {
                          label: 'Home',
                          comp: () => <ConnectTab />,
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
