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
import HistoryTab from './tabs/HistoryTab/HistoryTab';
import LoansTab from './tabs/LoansTab/LoansTab';
import MintTab from './tabs/MintTab/MintTab';
import MyNuggsTab from './tabs/MyNuggsTab/MyNuggsTab';
import SalesTab from './tabs/SalesTab/SalesTab';
import SwapTab from './tabs/SwapTab_DEPRECATED/SwapTab';
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

    console.log({ history });
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
            label: 'Nuggs',
            comp: ({ isActive }) => <MyNuggsTab isActive={isActive} />,
        },
        {
            label: 'Claims',
            comp: ({ isActive }) => <ClaimTab isActive={isActive} />,
        },
        {
            label: 'History',
            comp: ({ isActive }) => <HistoryTab isActive={isActive} />,
        },
        {
            label: 'Loans',
            comp: ({ isActive }) => <LoansTab isActive={isActive} />,
        },
        {
            label: 'Reclaim',
            comp: ({ isActive }) => <SalesTab isActive={isActive} />,
        },
    ];

    return (
        <div style={styles.container}>
            <div style={styles.wallet}>
                <HappyTabber items={happytabs} />
            </div>
        </div>
    );
};

export default React.memo(Wallet);
