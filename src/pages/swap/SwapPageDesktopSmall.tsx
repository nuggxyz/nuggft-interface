import React, { FunctionComponent } from 'react';
import { animated } from '@react-spring/web';

import RingAbout from '@src/components/nugg/RingAbout/RingAbout';
import TheRing from '@src/components/nugg/TheRing/TheRing';
import Wallet from '@src/components/nugg/Wallet/Wallet';
// import useBlur from '@src/hooks/useBlur';
import styles from '@src/pages/SwapPage.styles';
import useDesktopSwappingNugg from '@src/client/hooks/useDesktopSwappingNugg';

type Props = Record<string, never>;

const SwapPageDesktopSmall: FunctionComponent<Props> = () => {
	// const blur = useBlur(['/', '/swap/:id', '/live']);
	const tokenId = useDesktopSwappingNugg();

	return (
		<animated.div
			style={{
				...styles.container,
				// ...blur,
				alignItems: 'flex-start',
			}}
		>
			<>
				<div style={styles.tabletMain}>
					<div style={styles.tabletRing}>
						<TheRing circleWidth={1100} manualTokenId={tokenId} />
					</div>
					<div style={styles.tabletRingAbout}>
						<RingAbout manualTokenId={tokenId} />
					</div>
				</div>
				<div style={styles.tabletSecondary}>
					<Wallet />
				</div>
			</>
		</animated.div>
	);
};

export default SwapPageDesktopSmall;
