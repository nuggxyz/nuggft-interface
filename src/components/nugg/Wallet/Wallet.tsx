import React, { FunctionComponent, useMemo } from 'react';
import { t } from '@lingui/macro';

import HappyTabber, { HappyTabberItem } from '@src/components/general/HappyTabber/HappyTabber';
import state from '@src/state';
import web3 from '@src/web3';
import RingAbout from '@src/components/nugg/RingAbout/RingAbout';
import lib from '@src/lib';

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
            // eslint-disable-next-line no-nested-ternary
            ...(account
                ? screenType === 'tablet'
                    ? [
                          {
                              label: t`Swap`,
                              comp: React.memo(RingAbout),
                              labelStyle: { color: lib.colors.nuggBlueText },
                              bodyStyle: {
                                  background: lib.colors.gradient2,
                                  boxShadow: `${lib.layout.boxShadow.prefix} ${lib.colors.shadowNuggBlue}`,
                              },
                          },
                          {
                              label: t`Home`,
                              comp: React.memo(HomeTab),
                          },
                          {
                              label: t`Claims`,
                              comp: React.memo(ClaimTab),
                          },

                          {
                              label: t`Loans`,
                              comp: React.memo(LoanTab),
                          },
                      ]
                    : [
                          {
                              label: t`Home`,
                              comp: React.memo(HomeTab),
                          },
                          {
                              label: t`Claims`,
                              comp: React.memo(ClaimTab),
                          },

                          {
                              label: t`Loans`,
                              comp: React.memo(LoanTab),
                          },
                      ]
                : [
                      {
                          label: t`Home`,
                          comp: React.memo(ConnectTab),
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
