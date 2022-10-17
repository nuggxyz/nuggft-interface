import React, { CSSProperties, FunctionComponent, useMemo } from 'react';
import { AlertCircle } from 'react-feather';
import { useSpring, animated } from '@react-spring/web';
import { useNavigate } from 'react-router-dom';

import TokenViewer from '@src/components/nugg/TokenViewer';
import web3 from '@src/web3';
import client from '@src/client';
import useOnHover from '@src/hooks/useOnHover';
import Text from '@src/components/general/Texts/Text/Text';
import lib from '@src/lib';

import styles from './ChainIndicator.styles';
import { useRemainingBlocks } from '@src/components/nugg/TheRing/TheRing';
import CircleTimer from '@src/components/general/AnimatedTimers/CircleTimer/CircleTimer';

type Props = {
	style?: CSSProperties;
	textStyle?: CSSProperties;
	onClick?: () => void;
};

const ChainIndicator: FunctionComponent<Props> = ({ style, textStyle, onClick }) => {
	const epoch = client.epoch.active.useId();
	const swap = client.v2.useSwap(epoch?.toNuggId());

	const blocknum = client.block.useBlock();

	const error = web3.hook.usePriorityError();

	const navigate = useNavigate();
	const springStyle = useSpring({
		opacity: epoch ? 1 : 0,
	});

	const [ref, hover] = useOnHover(() => undefined);

	const style2 = useMemo(() => {
		return {
			...(hover ? { filter: 'brightness(.8)' } : {}),
		};
	}, [hover, error, style]);

	const [remaining, duration] = useRemainingBlocks(
		blocknum,
		swap?.commitBlock,
		swap?.endingEpoch,
	);

	const color = useMemo(() => {
		const percentage = remaining / duration;
		return percentage <= 0.1
			? lib.colors.nuggRedText
			: percentage <= 0.25
			? lib.colors.nuggGold
			: lib.colors.nuggBlue;
	}, [remaining, duration]);

	return (
		<div style={{ display: 'flex' }}>
			<animated.div
				style={{
					...springStyle,
					display: 'flex',
					alignItems: 'center',
				}}
			>
				<div
					ref={ref}
					aria-hidden="true"
					role="button"
					onClick={() => {
						if (onClick) onClick();
						navigate('/');
					}}
					style={{
						...style2,
						...styles.buttonDefault,
						...styles.button,
						...(error ? styles.warning : styles.normal),
						...style,
						boxShadow: lib.layout.boxShadow.basic,
					}}
				>
					{error ? (
						<AlertCircle size={24} style={{ paddingRight: `${0.5}rem` }} />
					) : (
						<div style={{ display: 'flex', alignItems: 'center' }}>
							{epoch ? (
								<TokenViewer
									tokenId={epoch.toNuggId()}
									style={{
										width: '37px',
										height: '37px',
										marginRight: '.5rem',
										padding: '.2rem',
									}}
								/>
							) : null}
						</div>
					)}

					{epoch && blocknum ? (
						<Text
							textStyle={{
								...lib.layout.presets.font.main.bold,
								...textStyle,
							}}
						>
							{`${epoch.toNuggId().toPrettyId()}`}
						</Text>
					) : null}
					<CircleTimer
						duration={duration}
						remaining={remaining}
						strokeColor={color}
						// defaultColor={'red'}
						width={70}
						strokeWidth={2}
						style={{ height: '35px', width: '35px' }}
					/>
				</div>
			</animated.div>
			{/* <NextSwap /> */}
		</div>
	);
};

export default React.memo(ChainIndicator);
