import React, { FunctionComponent } from 'react';
import { animated } from '@react-spring/web';

import { useDarkMode } from '@src/client/hooks/useDarkMode';
import lib from '@src/lib';
import useDesktopSwappingNugg from '@src/client/hooks/useDesktopSwappingNugg';
import { useLiveTokenPoll } from '@src/client/subscriptions/useLiveNugg';

import styles from './RingAbout.styles';
import OffersList from './OffersList';
import OwnerBlock from './OwnerBlock';
import OfferButton from './OfferButton';
import SideCar from './SideCar';
import Caboose from './Caboose';
import OfferText from './OfferText';

type Props = {
	asHappyTab?: boolean;
	manualTokenId?: TokenId;
};

const RingAbout: FunctionComponent<Props> = ({ asHappyTab = false, manualTokenId }) => {
	const darkmode = useDarkMode();

	const tokenId = useDesktopSwappingNugg(manualTokenId);

	useLiveTokenPoll(true, tokenId);

	return (
		<>
			<animated.div
				style={{
					...(asHappyTab
						? styles.containerTablet
						: darkmode
						? styles.containerDark
						: styles.container),
					boxShadow: lib.layout.boxShadow.dark,
				}}
			>
				<div style={styles.bodyContainer}>
					<OwnerBlock tokenId={tokenId} />
					<OfferText tokenId={tokenId} />
					<OffersList tokenId={tokenId} />
				</div>
				<OfferButton tokenId={tokenId} />
			</animated.div>
			<SideCar tokenId={tokenId} />
			<Caboose tokenId={tokenId?.onlyItemId()} />
		</>
	);
};

export default React.memo(RingAbout);
