/* eslint-disable react/require-default-props */
/* eslint-disable no-nested-ternary */
import React, { CSSProperties, FunctionComponent } from 'react';

import lib from '@src/lib';
import constants from '@src/lib/constants';
import client from '@src/client';
import useDesktopSwappingNugg from '@src/client/hooks/useDesktopSwappingNugg';
import CircleTimerMobileCSS from '@src/components/general/AnimatedTimers/CircleTimer/CircleTimerMobileCSS';
import TokenViewer4 from '@src/components/nugg/TokenViewer4';
import { calculateEndBlock } from '@src/web3/constants';

import styles from './TheRing.styles';

type Props = {
	containerStyle?: CSSProperties;
	circleStyle?: CSSProperties;
	circleWidth?: number;
	tokenStyle?: CSSProperties;
	manualTokenId?: TokenId;
	disableHover?: boolean;
	circleChildrenContainerStyle?: CSSProperties;
	disableClick?: boolean;
	strokeWidth?: number;
	defaultColor?: string;
	ref?: React.ForwardedRef<SVGSVGElement>;
};

export const useRemainingBlocks = (
	blocknum?: number,
	startBlock?: number,
	endingEpoch?: number,
) => {
	return React.useMemo(() => {
		if (!blocknum || !startBlock || !endingEpoch) return [1, 1];
		const endBlock = calculateEndBlock(endingEpoch);

		const duration = endBlock - startBlock;

		const remaining = endBlock - blocknum;

		return [remaining, duration];
	}, [blocknum, startBlock, endingEpoch]);
};

const TheRing: FunctionComponent<Props> = ({
	containerStyle,
	circleStyle,
	circleChildrenContainerStyle,
	circleWidth = 1600,
	tokenStyle,
	manualTokenId,
	// disableHover = false,
	// disableClick = false,
	// strokeWidth,
	defaultColor = lib.colors.nuggBlue,
}) => {
	const tokenId = useDesktopSwappingNugg(manualTokenId);

	const swap = client.v2.useSwap(tokenId);

	const blocknum = client.block.useBlock();

	const [remaining, duration] = useRemainingBlocks(
		blocknum,
		swap?.commitBlock,
		swap?.endingEpoch,
	);

	const col = React.useMemo(() => {
		return swap ? null : lib.colors.nuggGold;
	}, [swap]);

	return (
		<div style={{ width: '100%', height: '100%', ...containerStyle }}>
			<CircleTimerMobileCSS
				duration={duration}
				remaining={remaining}
				tokenId={tokenId}
				blocktime={constants.BLOCKTIME}
				width={circleWidth}
				childrenContainerStyle={circleChildrenContainerStyle}
				defaultColor={defaultColor}
				staticColor={col}
				style={{
					...styles.circle,
					...circleStyle,
					flexDirection: 'column',
				}}
				strokeWidth={10}
			>
				<TokenViewer4 tokenId={tokenId} tokenStyle={tokenStyle} />
			</CircleTimerMobileCSS>
		</div>
	);
};

export default React.memo(
	TheRing,
	(a, b) => a.manualTokenId === b.manualTokenId && a.defaultColor === b.defaultColor,
);
