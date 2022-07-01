/* eslint-disable react/require-default-props */
/* eslint-disable no-nested-ternary */
import React, { CSSProperties, FunctionComponent } from 'react';

import lib from '@src/lib';
import constants from '@src/lib/constants';
import AnimatedCard from '@src/components/general/Cards/AnimatedCard/AnimatedCard';
import TokenViewer from '@src/components/nugg/TokenViewer';
import client from '@src/client';
import { Lifecycle } from '@src/client/interfaces';
import useLifecycle from '@src/client/hooks/useLifecycle';
import useDimensions from '@src/client/hooks/useDimensions';
import CircleTimer from '@src/components/general/AnimatedTimers/CircleTimer/CircleTimer';
import CircleTimerMobileCSS from '@src/components/general/AnimatedTimers/CircleTimer/CircleTimerMobileCSS';
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
	disableHover = false,
	disableClick = false,
	strokeWidth,
	defaultColor = lib.colors.nuggBlue,
}) => {
	const [screenType, isPhone] = useDimensions();

	const swap = client.v2.useSwap(manualTokenId);
	const lifecycle = useLifecycle(manualTokenId);
	const blocknum = client.block.useBlock();

	// const startblock = client.epoch.active.useStartBlock();

	// useTriggerPageLoad(!isPhone && swap, 5000);

	// const showWarning = React.useMemo(() => {
	// 	if (
	// 		lifecycle === Lifecycle.Bunt &&
	// 		swap &&
	// 		blocknum &&
	// 		startblock &&
	// 		+startblock + 255 - blocknum < 75
	// 	)
	// 		return +startblock + 255 - blocknum - 17;

	// 	return 0;
	// }, [startblock, blocknum, lifecycle, swap]);

	const [remaining, duration] = useRemainingBlocks(
		blocknum,
		swap?.commitBlock,
		swap?.endingEpoch,
	);

	const CircleTimerWrap = React.useMemo(() => {
		return isPhone ? CircleTimerMobileCSS : CircleTimer;
	}, [isPhone]);

	const col = React.useMemo(() => {
		return swap && lifecycle
			? lifecycle === Lifecycle.Stands
				? lib.colors.darkerGray
				: lifecycle === Lifecycle.Bench
				? lib.colors.nuggGold
				: lifecycle === Lifecycle.Deck
				? lib.colors.green
				: lifecycle === Lifecycle.Bat || lifecycle === Lifecycle.Bunt
				? ''
				: lifecycle === Lifecycle.Cut
				? lib.colors.red
				: lifecycle === Lifecycle.Minors
				? lib.colors.nuggGold
				: isPhone
				? 'white'
				: 'purple'
			: 'white';
	}, [manualTokenId, swap, lifecycle, isPhone]);

	return (
		<div style={{ width: '100%', height: '100%', ...containerStyle }}>
			<CircleTimerWrap
				duration={duration}
				remaining={remaining}
				tokenId={manualTokenId}
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
				strokeWidth={
					strokeWidth || (screenType === 'phone' ? 10 : screenType === 'tablet' ? 13 : 20)
				}
			>
				{isPhone ? (
					<TokenViewer
						tokenId={manualTokenId}
						style={tokenStyle}
						showcase
						disableOnClick={disableClick}
					/>
				) : (
					<>
						{/* {chainId && swap && lifecycle === Lifecycle.Deck && (
                            <Label
                                text={t`countdown begins in ${countdownMinutes} minutes`}
                                containerStyles={{
                                    ...(screenType === 'phone'
                                        ? { position: 'absolute', top: 50, zIndex: 950 }
                                        : {}),
                                }}
                            />
                        )} */}
						<AnimatedCard disable={disableHover}>
							<TokenViewer
								tokenId={manualTokenId}
								style={tokenStyle}
								showcase
								disableOnClick={disableClick}
							/>
						</AnimatedCard>

						{/* {showWarning !== 0 && (
							<div
								style={{
									display: 'flex',
									padding: '10px',
									justifyContent: 'center',
									background: 'white',
									flexDirection: 'column',
									alignItems: 'center',
									borderRadius: lib.layout.borderRadius.medium,
									zIndex: 1000,
									border: '5px solid red',
									position: 'absolute',
									top: 300,
								}}
							>
								<div
									style={{
										display: 'flex',
										justifyContent: 'center',

										alignItems: 'center',
									}}
								>
									<IoWarning size="25px" color="red" />
									<Text size="larger" textStyle={{ color: 'red' }}>
										Warning
									</Text>
								</div>
								{/* <Text
									</div>
						)} */}
					</>
				)}
			</CircleTimerWrap>
		</div>
	);
};

export default React.memo(
	TheRing,
	(a, b) => a.manualTokenId === b.manualTokenId && a.defaultColor === b.defaultColor,
);
