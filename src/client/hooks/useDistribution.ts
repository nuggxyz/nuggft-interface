import { useMemo } from 'react';

import web3 from '@src/web3';
import { SwapData } from '@src/client/interfaces';

export default (swapData?: SwapData) => {
	const provider = web3.hook.usePriorityProvider();

	const ownerEns = web3.hook.usePriorityAnyENSName(
		swapData?.type === 'item' ? ('nugg' as const) : provider,
		swapData?.owner,
	);

	const distribution = useMemo(() => {
		if (swapData) {
			const extra = swapData.eth.sub(swapData.bottom);

			const isMint = swapData.bottom.isZero();

			const proto = extra.div(isMint ? 2 : 10);

			return {
				proto,
				stake: extra.sub(proto),
				owner: swapData.bottom,
			};
		}
		return undefined;
	}, [swapData]);

	return { ownerEns, distribution };
};
