import { useSpring, animated, easings } from '@react-spring/web';
import React, { CSSProperties, useMemo } from 'react';

import client from '@src/client';
import useAsyncState from '@src/hooks/useAsyncState';
import { useNuggftV1 } from '@src/contracts/useContract';
import web3 from '@src/web3';
import { useDotnuggInjectToCache } from '@src/client/hooks/useDotnugg';
import useDimensions from '@src/client/hooks/useDimensions';

import TokenViewer, { TokenViewerProps } from './TokenViewer';

interface Props extends TokenViewerProps {
	tokenId?: TokenId;
	style?: CSSProperties;
	validated: boolean;
}

export default ({ tokenId, style, validated, ...props }: Props) => {
	const [screenType] = useDimensions();

	const [initial, setInitial] = React.useState<null | Base64EncodedSvg>();

	const [doneWaiting, setDoneWaiting] = React.useState<boolean>(false);

	const { width } = useMemo(() => {
		return { width: window.innerWidth };
	}, []);

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
					if (x === undefined) return null;
					return x;
				})
				.catch(() => {
					return null;
				}) as Promise<Base64EncodedSvg | null>;
		}

		return undefined;
	}, [tokenId, blocknum, network]);

	React.useEffect(() => {
		if (initial !== undefined && svg && svg !== initial) {
			setDoneWaiting(true);
			if (tokenId) {
				inject(tokenId, svg);
			}
		}
	}, [initial, svg, inject, tokenId]);

	React.useEffect(() => {
		if (initial === undefined && (svg !== undefined || !tokenId)) {
			if (!svg) setInitial(null);
			else setInitial(svg || null);
		}
	}, [svg, tokenId]);

	const { background, rotateZ } = useSpring({
		from: {
			background: '#46e891',
			rotateZ: 0,
		},
		to: {
			background: '#277ef4',
			rotateZ: 225,
		},
		config: {
			duration: 2000,
			easing: easings.easeInOutQuart,
		},
		loop: { reverse: true },
	});

	return !validated || !doneWaiting ? (
		<div
			style={{
				...(screenType === 'phone'
					? { width: width / 1.2, height: width / 1.2 }
					: { width: '400px', height: '400px' }),
				...style,
				position: 'relative',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				flexDirection: 'column',
				opacity: 1,
			}}
		>
			<animated.div
				style={{
					background,
					width: 120,
					height: 120,
					borderRadius: 16,
					rotateZ,
				}}
			/>
		</div>
	) : (
		<TokenViewer tokenId={tokenId} svgNotFromGraph={svg} {...props} />
	);
};
