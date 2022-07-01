import React from 'react';
import { animated } from '@react-spring/web';

import GodList from '@src/components/general/List/GodList';
import MobileRingAbout from '@src/components/mobile/MobileRingAbout';
import client from '@src/client';

const MobileSwapPage = () => {
	const pollit = client.v3.usePollV3();

	const swaps = client.v2.useSwapList();
	const potential = client.v3.useSwapList();

	const filtered = React.useMemo(() => {
		return [...new Set([...swaps, ...potential])];
	}, [swaps, potential]);

	return (
		<animated.div
			style={{
				display: 'flex',
				flexDirection: 'column',
				height: '100%',
				width: '100%',
				marginBottom: '500px',
				alignItems: 'center',
				justifyContent: 'flex-start',
				overflow: 'scroll',
				WebkitOverflowScrolling: 'touch',
				zIndex: 0,
			}}
		>
			<GodList
				RenderItem={MobileRingAbout}
				data={filtered}
				extraData={undefined}
				itemHeight={438}
				LIST_PADDING={0}
				skipSelectedCheck
				displacement={1}
				onScrollEnd={pollit}
			/>
		</animated.div>
	);
};

export default MobileSwapPage;
