import { animated, config, useSpring } from '@react-spring/web';
import React, { FunctionComponent } from 'react';

import useAsyncState from '../../../hooks/useAsyncState';
import AppState from '../../../state/app';
import ProtocolState from '../../../state/protocol';
import historyQuery from '../../../state/wallet/queries/historyQuery';
import loanedNuggsQuery from '../../../state/wallet/queries/loanedNuggsQuery';
import myActiveSalesQuery from '../../../state/wallet/queries/myActiveSalesQuery';
import unclaimedOffersQuery from '../../../state/wallet/queries/unclaimedOffersQuery';
import Web3State from '../../../state/web3';
import HappyTabber, {
    HappyTabberItem,
} from '../../general/HappyTabber/HappyTabber';

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

    // const loan = useAsyncState(
    //     () => loanedNuggsQuery(address, 'desc', '', 1, 0),
    //     [address, block],
    // );
    // const reclaims = useAsyncState(
    //     () => myActiveSalesQuery(address, 'desc', '', 1, 0),
    //     [address, block],
    // );
    // const claims = useAsyncState(
    //     () => unclaimedOffersQuery(address, epoch?.id),
    //     [address, block],
    // );
    const history = useAsyncState(
        () => historyQuery(address, 1, 0),
        [address, block],
    );
    // const spring = useSpring({
    //     to: {
    //         ...styles.wallet,
    //         right: show ? '65px' : '-430px',
    //         opacity: show ? 1 : 0,
    //     },
    //     config: config.default,
    // });

    const happytabs: HappyTabberItem[] = [
        {
            label: 'Home',
            comp: ({ isActive }) => <MintTab />,
        },
        {
            label: 'Claims',
            comp: ({ isActive }) => <ClaimTab isActive={isActive} />,
        },
        {
            label: 'Loans',
            comp: ({ isActive }) => <LoansTab isActive={isActive} />,
        },
        {
            label: 'Sales',
            comp: ({ isActive }) => <SalesTab isActive={isActive} />,
        },
    ];

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
