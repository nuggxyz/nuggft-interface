import React, { FunctionComponent } from 'react';
import { animated } from '@react-spring/web';

import RingAbout from '@src/components/nugg/RingAbout/RingAbout';
import TheRing from '@src/components/nugg/TheRing/TheRing';
import Wallet from '@src/components/nugg/Wallet/Wallet';
// import useBlur from '@src/hooks/useBlur';
import DesktopToggleButton from '@src/components/nuggbook/DesktopToggleButton';
import styles from '@src/pages/SwapPage.styles';
import useDesktopSwappingNugg from '@src/client/hooks/useDesktopSwappingNugg';

type Props = Record<string, never>;

const SwapPageDesktopLarge: FunctionComponent<Props> = () => {
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
			<div style={styles.secondaryContainer}>
				<div style={styles.innerContainer}>
					<RingAbout manualTokenId={tokenId} />
				</div>
				<div style={styles.innerContainer}>
					<Wallet />
				</div>
			</div>
			<div style={styles.theRingContainer}>
				<TheRing manualTokenId={tokenId} />
			</div>
			<DesktopToggleButton />
		</animated.div>
	);
};

export default SwapPageDesktopLarge;
