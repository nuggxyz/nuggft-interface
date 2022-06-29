import { useCallback, useEffect } from 'react';
import { useMatch } from 'react-router-dom';

import { useGetLiveItemLazyQuery, useGetLiveNuggLazyQuery } from '@src/gql/types.generated';
import formatLiveNugg from '@src/client/formatters/formatLiveNugg';
import client from '@src/client';
import formatLiveItem from '@src/client/formatters/formatLiveItem';
import web3 from '@src/web3';

export const useStartupCallback = () => {
	const graph = client.live.graph();
	const provider = web3.hook.usePriorityProvider();
	const chainId = web3.hook.usePriorityChainId();

	const updateToken = client.mutate.updateToken();
	const setLastSwap = client.mutate.setLastSwap();

	const [itemLazyQuery] = useGetLiveItemLazyQuery({ client: graph });
	const [nuggLazyQuery] = useGetLiveNuggLazyQuery({ client: graph });

	const match = useMatch('/swap/:id');

	return useCallback(async () => {
		if (provider && chainId) {
			if (match && match.params.id && match.params.id !== '') {
				const tokenId = match.params.id;

				const isItem = tokenId.isItemId();

				if (!isItem) {
					await nuggLazyQuery({
						variables: { tokenId },
					}).then((x) => {
						if (x.data) {
							if (!x.data.nugg) window.location.hash = '#/';
							else {
								const formatted = formatLiveNugg(x.data.nugg);
								if (formatted) {
									setLastSwap(tokenId.toNuggId());
									updateToken(tokenId.toNuggId(), formatted);
								}
							}
						}
					});
				} else {
					await itemLazyQuery({
						variables: { tokenId: tokenId.toRawId() },
					}).then((x) => {
						if (x.data) {
							if (!x.data.item) window.location.hash = '#/';
							else {
								const formatted = formatLiveItem(x.data.item);
								if (formatted) {
									setLastSwap(tokenId);
									updateToken(tokenId, formatted);
								}
							}
						}
					});
				}
			}

			// await createInfuraProvider(chainId)
			//     .getBlockNumber()
			//     .then((num) => {
			//         updateBlocknum(num, chainId, true);
			//     });
		}
	}, [provider, chainId, nuggLazyQuery, itemLazyQuery, updateToken, match, setLastSwap]);
};

export default () => {
	const provider = web3.hook.usePriorityProvider();
	const chainId = web3.hook.usePriorityChainId();

	const callback = useStartupCallback();

	useEffect(() => {
		if (provider && chainId) void callback();
	}, [provider, chainId, callback]);

	return null;
};
