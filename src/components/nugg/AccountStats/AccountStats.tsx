import React, { FunctionComponent } from 'react';
import { animated, config, useSpring } from 'react-spring';

import { EthInt } from '../../../classes/Fraction';
import AppSelectors from '../../../state/app/selectors';
import ProtocolSelectors from '../../../state/protocol/selectors';
import WalletSelectors from '../../../state/wallet/selectors';
import NumberStatistic from '../Statistics/NumberStatistic';
import TextStatistic from '../Statistics/TextStatistic';

import styles from './AccountStats.styles';

type Props = {};

const AccountStats: FunctionComponent<Props> = () => {
    const userShares = WalletSelectors.userShares();
    const valuePerShare = ProtocolSelectors.nuggftStakedEthPerShare();

    const walletVisible = AppSelectors.walletVisible();

    const containerStyle = useSpring({
        to: {
            opacity: walletVisible ? 0 : 1,
            ...styles.container,
        },
        config: config.default,
    });

    return (
        <animated.div style={containerStyle}>
            <TextStatistic
                label="Your shares"
                value={'' + userShares}
                transparent
            />
            <NumberStatistic
                label="Your worth"
                value={new EthInt(`${+valuePerShare * userShares}`)}
                transparent
                image="eth"
            />
        </animated.div>
    );
};

export default React.memo(AccountStats);
