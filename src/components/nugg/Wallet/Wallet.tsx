import { animated, config, useSpring } from '@react-spring/web';
import React, { FunctionComponent } from 'react';

import AppState from '../../../state/app';
import HappyTabber, {
    HappyTabberItem,
} from '../../general/HappyTabber/HappyTabber';

import HistoryTab from './tabs/HistoryTab/HistoryTab';
import SwapTab from './tabs/SwapTab/SwapTab';
import styles from './Wallet.styles';

type Props = {};

const Wallet: FunctionComponent<Props> = () => {
    const show = AppState.select.walletVisible();
    const spring = useSpring({
        to: {
            ...styles.wallet,
            right: show ? '65px' : '-430px',
            opacity: show ? 1 : 0,
        },
        config: config.default,
    });

    const happytabs: HappyTabberItem[] = [
        {
            label: 'Pool',
            comp: ({ isActive }) => <SwapTab isActive={isActive} />,
        },

        {
            label: 'Claim',
            comp: ({ isActive }) => <HistoryTab isActive={isActive} />,
        },
    ];

    return (
        <div style={styles.container}>
            <animated.div style={spring}>
                <HappyTabber items={happytabs} />
            </animated.div>
        </div>
    );
};

export default React.memo(Wallet);
