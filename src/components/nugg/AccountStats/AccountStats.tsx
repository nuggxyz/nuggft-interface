import React, { FunctionComponent } from 'react';
import { animated } from '@react-spring/web';

type Props = Record<string, never>;

const AccountStats: FunctionComponent<Props> = () => {
	// const walletVisible = AppState.select.walletVisible();

	// const containerStyle = useSpring({
	//     to: {
	//         opacity: walletVisible ? 0 : 1,
	//         ...styles.container,
	//     },
	//     config: config.default,
	// });

	return (
		<animated.div>
			{/* <TextStatistic label="Your shares" value={'' + userShares} transparent />
            <NumberStatistic
                label="Your worth"
                value={new EthInt(`${stake ? +stake.eps * userShares : 0}`)}
                transparent
                image="eth"
            /> */}
		</animated.div>
	);
};

export default React.memo(AccountStats);
