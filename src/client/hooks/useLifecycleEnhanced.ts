import React from 'react';

import lib from '@src/lib';
import useLifecycle from '@src/client/hooks/useLifecycle';
import { Lifecycle } from '@src/client/interfaces';
import web3 from '@src/web3';

import client from '..';

export default (tokenId?: TokenId) => {
	const lifecycle = useLifecycle(tokenId);

	const token = client.live.token(tokenId);

	const epoch = client.epoch.active.useId();
	const blocknum = client.block.useBlock();

	return React.useMemo(() => {
		if (!epoch || !blocknum) return undefined;

		switch (lifecycle) {
			case Lifecycle.Bat:
			case Lifecycle.Bunt:
				if (
					token?.activeSwap &&
					token.activeSwap.endingEpoch &&
					web3.config.calculateEndBlock(token.activeSwap.endingEpoch) - blocknum <
						(60 / 12) * 10
				)
					return {
						color: lib.colors.red,
						label: 'auction ending soon',
						lifecycle,
						active: true,
					};
				return { color: lib.colors.green, label: 'live auction', lifecycle, active: true };

			case Lifecycle.Cut:
				return {
					color: lib.colors.primaryColor,
					label: 'auction just ended',
					lifecycle,
					active: false,
				};
			case Lifecycle.Stands:
				return {
					color: lib.colors.primaryColor,
					label: 'staked',
					lifecycle,
					active: false,
				};
			case Lifecycle.Minors:
			case Lifecycle.Concessions:
			case Lifecycle.Tryout:
			case Lifecycle.Bench:
				return {
					color: lib.colors.nuggGold,
					label: 'waiting on bid',
					lifecycle,
					active: false,
				};
			case Lifecycle.Egg:
				return {
					color: lib.colors.orange,
					label: 'about to start',
					lifecycle,
					active: false,
				};
			case Lifecycle.Deck:
				return {
					color: lib.colors.green,
					label: 'auction just started',
					lifecycle,
					active: true,
				};
			default:
				return undefined;
		}
	}, [token, epoch, blocknum, lifecycle]);
};
