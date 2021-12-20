import { animated, config, useSpring } from '@react-spring/web';
import React, { FunctionComponent } from 'react';

import AppSelectors from '../../../state/app/selectors';
import HappyTabber, {
    HappyTabberItem,
} from '../../general/HappyTabber/HappyTabber';

import HistoryTab from './tabs/HistoryTab/HistoryTab';
import SwapTab from './tabs/SwapTab/SwapTab';
import styles from './Wallet.styles';

type Props = {};

const Wallet: FunctionComponent<Props> = () => {
    const show = AppSelectors.walletVisible();
    const spring = useSpring({
        to: {
            ...styles.wallet,
            right: show ? '65px' : '-430px',
            opacity: show ? 1 : 0,
        },
        config: config.default,
    });

    const happytabs: HappyTabberItem[] = [
        { label: 'Pool', comp: () => <SwapTab /> },

        { label: 'Claim', comp: () => <HistoryTab /> },
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
