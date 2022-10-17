import React, { CSSProperties, FunctionComponent, useLayoutEffect, useMemo, useState } from 'react';
import { animated, useSpring } from '@react-spring/web';

import lib, {
	isUndefinedOrNullOrNotNumber,
	isUndefinedOrNullOrNumberZero,
	isUndefinedOrNullOrStringEmpty,
} from '@src/lib';

import styles from './CircleTimer.styles';

type Props = React.PropsWithChildren<{
	duration: number;
	remaining: number;
	// blocktime: number;
	staticColor?: string;
	strokeColor?: string;
	style?: CSSProperties;
	childrenContainerStyle?: CSSProperties;
	width: number;
	strokeWidth?: number;
	defaultColor?: string;
	tokenId?: TokenId;
}>;
const TWOPI = Math.PI * 2;
const HALFPI = Math.PI / 2;

const CircleTimer: FunctionComponent<Props> = ({
	children,
	duration,
	remaining,
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	// blocktime,

	staticColor,
	strokeColor,
	style,
	width,
	strokeWidth = 20,
	childrenContainerStyle,
	defaultColor,
}) => {
	const timerCircleRadius = useMemo(() => width / 6.5, [width]);
	const circumference = useMemo(() => timerCircleRadius * TWOPI, [timerCircleRadius]);

	const [stateRemaining, setStateRemaining] = useState(duration);

	useLayoutEffect(() => {
		setStateRemaining(
			!isUndefinedOrNullOrStringEmpty(staticColor) || duration < remaining
				? duration
				: remaining,
		);
	}, [remaining, duration, staticColor]);

	const to = useMemo(() => {
		return !isUndefinedOrNullOrNotNumber(stateRemaining) &&
			!isUndefinedOrNullOrNumberZero(duration) &&
			stateRemaining <= duration
			? Math.abs(timerCircleRadius * (TWOPI - (stateRemaining / duration) * TWOPI) + HALFPI)
			: 0;
	}, [stateRemaining, duration, timerCircleRadius]);

	const { x } = useSpring({
		to: {
			x: to,
		},
		delay: 200,

		config: {
			tension: 250,
			friction: 180,
		},
	});

	const shadowColor = useMemo(() => {
		const percent = remaining / duration;
		if (!staticColor && !defaultColor) {
			return undefined;
		}
		if (percent > 1 && !isUndefinedOrNullOrStringEmpty(staticColor)) {
			return staticColor;
		}
		if (percent <= 0.1) {
			return lib.colors.nuggRedText;
		}
		if (percent <= 0.25) {
			return lib.colors.nuggGold;
		}
		return defaultColor;
	}, [remaining, duration, staticColor, defaultColor]);

	return (
		<div style={{ ...styles.container, ...style }}>
			<div style={{ ...styles.childrenContainer, ...childrenContainerStyle }}>{children}</div>
			<div
				style={
					shadowColor
						? {
								filter: `drop-shadow(-10px 0px 15px ${shadowColor})`,
								willChange: 'filter',
								height: '200%',
								width: '200%',
						  }
						: { height: '100%', width: '100%' }
				}
			>
				<svg height="100%" width="100%" style={styles.svgTransition}>
					<animated.circle
						cx="50%"
						cy="50%"
						r={timerCircleRadius + 50}
						strokeDashoffset={x}
						fill="none"
					/>
					<animated.circle
						cx="50%"
						cy="50%"
						r={timerCircleRadius}
						stroke={
							strokeColor || (shadowColor === 'transparent' ? 'transparent' : 'white')
						}
						strokeDashoffset={x}
						strokeWidth={strokeWidth}
						fill="none"
						strokeDasharray={`${circumference} ${circumference}`}
						strokeLinecap="round"
					/>
				</svg>
			</div>
		</div>
	);
};

export default React.memo(
	CircleTimer,
	(a, b) =>
		a.tokenId === b.tokenId &&
		a.remaining === b.remaining &&
		b.defaultColor === a.defaultColor &&
		a.staticColor === b.staticColor,
);
