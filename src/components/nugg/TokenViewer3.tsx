import React, { CSSProperties } from 'react';

import client from '@src/client';
import useAsyncState from '@src/hooks/useAsyncState';
import { useNuggftV1 } from '@src/contracts/useContract';
import web3 from '@src/web3';
import { useDotnuggInjectToCache } from '@src/client/hooks/useDotnugg';
import Label from '@src/components/general/Label/Label';

import TokenViewer, { TokenViewerProps } from './TokenViewer';

interface Props extends TokenViewerProps {
	tokenId: TokenId;
	onTokenQuery?: (input: Base64EncodedSvg) => void;
	style?: CSSProperties;
	validated: boolean;
}

export default ({ tokenId, validated, onTokenQuery, ...props }: Props) => {
	const blocknum = client.block.useBlock();

	const nuggft = useNuggftV1();

	const network = web3.hook.useNetworkProvider();

	const inject = useDotnuggInjectToCache();

	const svg = useAsyncState(() => {
		if (tokenId && network) {
			return nuggft
				.connect(network)
				.imageURI(tokenId)
				.then((x) => {
					if (x === undefined) return undefined;

					inject(tokenId, x as Base64EncodedSvg);
					if (onTokenQuery) onTokenQuery(x as Base64EncodedSvg);
					return x;
				})
				.catch(() => {
					return undefined;
				}) as Promise<Base64EncodedSvg>;
		}

		return undefined;
	}, [tokenId, blocknum, network, onTokenQuery]);

	return (
		<div style={{ display: 'flex', flexDirection: 'column' }}>
			<TokenViewer tokenId={tokenId} svgNotFromGraph={svg} showPending {...props} />
			<Label text={`Live as of ${String(blocknum || 0)}`} />
		</div>
	);
};
