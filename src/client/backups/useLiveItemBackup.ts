import { useCallback } from 'react';

import web3 from '@src/web3';
import { useNuggftV1 } from '@src/contracts/useContract';
import { itemBackup } from '@src/contracts/backup';

import client from '..';

export default () => {
	const liveEpoch = client.epoch.active.useId();
	const provider = web3.hook.usePriorityProvider();
	const nuggft = useNuggftV1(provider);

	const updateToken = client.mutate.updateToken();

	const callback = useCallback(
		async (tokenId: ItemId | undefined) => {
			if (!tokenId || !liveEpoch) return;
			const res = await itemBackup(tokenId, nuggft, liveEpoch);
			void updateToken(tokenId, res);
		},
		[nuggft, updateToken, liveEpoch],
	);

	return callback;
};
