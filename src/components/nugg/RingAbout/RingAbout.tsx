import React, { FunctionComponent } from 'react';
import { animated } from '@react-spring/web';

import { useLiveTokenPoll } from '@src/client/subscriptions/useLiveNugg';

import Caboose from './Caboose';
import OfferButton from './OfferButton';
import OffersList from './OffersList';
import OwnerBlock from './OwnerBlock';
import styles from './RingAbout.styles';
import OfferText from './OfferText';

type Props = {
	asHappyTab?: boolean;
	manualTokenId?: TokenId;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const RingAbout: FunctionComponent<Props> = ({ manualTokenId }) => {
	// const darkmode = useDarkMode();

	useLiveTokenPoll(true, manualTokenId);

	// return (
	// 	<div style={{ width: '400px', overflowY: 'auto', WebkitScrollSnapType: 'y' }}>
	// 		<ActiveSwap tokenId={manualTokenId} />
	// 	</div>
	// );

	return (
		<>
			<animated.div
				style={{
					...styles.container,
				}}
			>
				<div style={styles.bodyContainer}>
					<OwnerBlock tokenId={manualTokenId} />
					<OfferText tokenId={manualTokenId} />
					<OffersList tokenId={manualTokenId} />
					<Caboose tokenId={manualTokenId?.onlyItemId()} />
				</div>
				<OfferButton tokenId={manualTokenId} />
			</animated.div>
		</>
	);
};

export default RingAbout;
