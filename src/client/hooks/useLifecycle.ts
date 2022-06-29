import React from 'react';

import client from '@src/client';
import { Lifecycle } from '@src/client/interfaces';
import { Address } from '@src/classes/Address';
import web3 from '@src/web3';
import { DEFAULT_CONTRACTS, ADDRESS_ZERO } from '@src/web3/constants';

export const useLifecycleData = (tokenId?: TokenId) => {
	const warning = client.epoch.active.useWarning();

	const address = web3.hook.usePriorityAccount();

	const offers = client.live.offers(tokenId);

	const [lifecycle, setLifecycle] = React.useState<Lifecycle>();

	const quick = client.v2.useSwap(tokenId);
	const potential = client.v3.useSwap(tokenId);

	const epoch = client.epoch.active.useId();

	const swap = React.useMemo(() => {
		// if (!token) return undefined;

		// const getit = () => {
		// 	if (token.isItem()) return token?.activeSwap || token?.upcomingActiveSwap;
		// 	return token.activeSwap;
		// };

		// const real = getit();

		return null ?? quick ?? potential;
	}, [quick, potential]);

	const msp = client.stake.useMsp();

	const swapCurrency = client.usd.useUsdPair(
		quick
			? quick.top.gt(0)
				? quick.top
				: msp
			: swap?.isPotential
			? swap.min?.eth.gt(0)
				? swap.min?.eth
				: msp
			: msp,
	);

	React.useEffect(() => {
		const find = () => {
			if (swap?.isPotential) {
				if (swap.isItem() && swap?.count > 0) {
					if (swap.count === 1) return Lifecycle.Formality;
					return Lifecycle.Tryout;
				}
				return Lifecycle.Bench;
			}

			if (swap && epoch !== null) {
				if (!swap.endingEpoch) {
					if (address === swap.owner && address === swap.leader)
						return Lifecycle.Concessions;
					if (swap.owner === web3.constants.DEFAULT_CONTRACTS.NuggftV1)
						return Lifecycle.Minors;
					return Lifecycle.Bench;
				}

				if (+swap.endingEpoch === epoch + 1) {
					if (swap.type === 'nugg' && swap.owner === Address.ZERO.hash) {
						return Lifecycle.Egg;
					}
					return Lifecycle.Deck;
				}

				if (swap.leader === Address.ZERO.hash && swap.endingEpoch && warning) {
					return Lifecycle.Cut;
				}

				if (swap.endingEpoch === epoch) {
					if (
						swap.type === 'nugg' &&
						(swap.owner === DEFAULT_CONTRACTS.NuggftV1 ||
							swap.owner === ADDRESS_ZERO) &&
						offers.length === 1 &&
						offers[0].account === ADDRESS_ZERO
					) {
						return Lifecycle.Bunt;
					}
					return Lifecycle.Bat;
				}

				return Lifecycle.Shower;
			}
			return Lifecycle.Stands;
		};

		const check = find();

		if (check !== lifecycle) setLifecycle(check);
	}, [epoch, warning, address, lifecycle, offers, swap]);

	return [lifecycle, swap, swapCurrency] as const;
};

export default (tokenId?: TokenId): Lifecycle | undefined => {
	const [lifecycle] = useLifecycleData(tokenId);

	return lifecycle;
};
