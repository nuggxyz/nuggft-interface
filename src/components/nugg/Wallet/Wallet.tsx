import { animated, config, useSpring } from '@react-spring/web';
import React, { FunctionComponent, useMemo } from 'react';

import useAsyncState from '../../../hooks/useAsyncState';
import Layout from '../../../lib/layout';
import AppState from '../../../state/app';
import ProtocolState from '../../../state/protocol';
import historyQuery from '../../../state/wallet/queries/historyQuery';
import loanedNuggsQuery from '../../../state/wallet/queries/loanedNuggsQuery';
import myActiveSalesQuery from '../../../state/wallet/queries/myActiveSalesQuery';
import unclaimedOffersQuery from '../../../state/wallet/queries/unclaimedOffersQuery';
import Web3State from '../../../state/web3';
import Web3Config from '../../../state/web3/Web3Config';
import Button from '../../general/Buttons/Button/Button';
import HappyTabber, {
    HappyTabberItem,
} from '../../general/HappyTabber/HappyTabber';
import NLStaticImage from '../../general/NLStaticImage';

import ClaimTab from './tabs/ClaimTab/ClaimTab';
import LoansTab from './tabs/LoansTab/LoansTab';
import MintTab from './tabs/MintTab/MintTab';
import SalesTab from './tabs/SalesTab/SalesTab';
import styles from './Wallet.styles';

type Props = {};

const Wallet: FunctionComponent<Props> = () => {
    const show = AppState.select.walletVisible();
    const address = Web3State.select.web3address();
    const block = ProtocolState.select.currentBlock();
    const epoch = ProtocolState.select.epoch();

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
                          comp: ({ isActive }) => (
                              <ClaimTab isActive={isActive} />
                          ),
                      },
                      {
                          label: 'Loans',
                          comp: ({ isActive }) => (
                              <LoansTab isActive={isActive} />
                          ),
                      },
                      {
                          label: 'Sales',
                          comp: ({ isActive }) => (
                              <SalesTab isActive={isActive} />
                          ),
                      },
                  ]
                : [
                      {
                          label: 'Home',
                          comp: ({ isActive }) => (
                              <div style={{ padding: '1rem' }}>
                                  {Object.values(
                                      Web3Config.SUPPORTED_WALLETS,
                                  ).map((walletObject) =>
                                      walletObject.name !== 'MetaMask' ||
                                      (walletObject.name === 'MetaMask' &&
                                          window.ethereum) ? (
                                          <Button
                                              label={walletObject.name}
                                              buttonStyle={{
                                                  color: 'white',
                                                  borderRadius:
                                                      Layout.borderRadius.large,
                                                  padding: '.6rem 1rem',
                                                  pointerEvents: 'auto',
                                                  background: `${walletObject.color}66`,
                                              }}
                                              rightIcon={
                                                  <NLStaticImage
                                                      //@ts-ignore
                                                      image={walletObject.name}
                                                  />
                                              }
                                              onClick={() =>
                                                  Web3State.safeActivate(
                                                      walletObject.connector,
                                                  )
                                              }
                                          />
                                      ) : null,
                                  )}
                              </div>
                          ),
                      },
                  ]),
        ],
        [address],
    );

    return (
        <div style={styles.container}>
            <div
                style={{
                    ...styles.wallet,
                    ...(AppState.isMobile && { height: '90%' }),
                }}>
                <HappyTabber items={happytabs} />
            </div>
        </div>
    );
};

export default React.memo(Wallet);
