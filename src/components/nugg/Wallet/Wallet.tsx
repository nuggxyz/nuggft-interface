import React, { FunctionComponent, useMemo } from 'react';
import { t } from '@lingui/macro';

import HappyTabber, { HappyTabberItem } from '@src/components/general/HappyTabber/HappyTabber';
import state from '@src/state';
import web3 from '@src/web3';
import RingAbout from '@src/components/nugg/RingAbout/RingAbout';
import lib from '@src/lib';
import { useDarkMode } from '@src/client/hooks/useDarkMode';

import ClaimTab from './tabs/ClaimTab/ClaimTab';
import ConnectTab from './tabs/ConnectTab/ConnectTab';
import LoanTab from './tabs/LoanTab/LoanTab';
import HomeTab from './tabs/HomeTab/HomeTab';
import styles from './Wallet.styles';
import ActiveTab from './tabs/ActiveTab/ActiveTab';

type Props = Record<string, never>;

const Wallet: FunctionComponent<Props> = () => {
    const screenType = state.app.select.screenType();
    const account = web3.hook.usePriorityAccount();

    const happytabs: HappyTabberItem[] = useMemo(
        () => [
            ...(account
                ? screenType === 'tablet'
                    ? [
                          // @danny7even just here for testing, easier to not reload page...
                          // ive found like 4 bugs in the graph and a couple here too from trying to implement this
                          // still not done
                          {
                              label: t`Active`,
                              comp: React.memo(ActiveTab),
                          },
                          {
                              label: t`Swap`,
                              comp: React.memo(() => <RingAbout asHappyTab />),
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
                              // look up mfer
                              label: t`Active`,
                              comp: React.memo(ActiveTab),
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
                      ...(screenType !== 'phone'
                          ? [
                                {
                                    label: t`Active`,
                                    comp: React.memo(ActiveTab),
                                },
                            ]
                          : []),
                      {
                          label: t`Connect`,
                          comp: React.memo(ConnectTab),
                      },
                  ]),
        ],
        [account, screenType],
    );

    const darkmode = useDarkMode();

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
                bodyStyle={
                    screenType === 'phone'
                        ? styles.mobileBody
                        : styles[darkmode ? 'bodyDark' : 'body']
                }
                headerTextStyle={
                    screenType === 'phone' ? styles.mobileHeaderText : styles.headerText
                }
            />
        </div>
    );
};

export default React.memo(Wallet);
