import React, { useEffect, useState, CSSProperties } from 'react';
import { useSpring, animated, config } from '@react-spring/web';
import { IoLogoUsd } from 'react-icons/io5';
import { SiEthereum } from 'react-icons/si';

import Text, { TextProps } from '@src/components/general/Texts/Text/Text';
import usePrevious from '@src/hooks/usePrevious';
import { NLStaticImageKey } from '@src/components/general/NLStaticImage';
import { PairInt, CurrencyInt } from '@src/classes/Fraction';
import client from '@src/client';
import lib from '@src/lib';

import styles from './CurrencyText.styles';

type PartialText = Partial<TextProps>;

interface BalanceProps extends PartialText {
	value: number | PairInt;
	decimals?: number;
	unitStyle?: CSSProperties;
	// unit?: string;
	// prefix?: string;
	// duration?: number;
	percent?: boolean;
	image?: NLStaticImageKey;
	forceGwei?: boolean;
	forceEth?: boolean;

	showUnit?: boolean;
	stopAnimation?: boolean;
	showIncrementAnimation?: boolean;
	loadOnZero?: boolean;
	str?: string;
	loadingOnZero?: boolean;
	dashOnZero?: boolean;

	onlyAnimateOnIncrease?: boolean;
	stopAnimationOnStart?: boolean;
	removeZeroAtBeggining?: boolean;
	unitOverride?: 'ETH' | 'USD';
	full?: boolean;
	prefix?: string;
	icon?: boolean;
	iconSize?: number;
}

const MIN = 0.000000000001;

const CurrencyText: React.FC<BalanceProps> = ({
	value: _value,
	decimals = 0,
	unitStyle,
	// unit = '',
	// prefix = '',
	// duration = 2,
	percent = false,
	forceGwei = false,
	forceEth = true,
	showUnit = true,
	stopAnimation = false,
	prefix,
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	showIncrementAnimation = false,
	loadOnZero = false,
	unitOverride,
	loadingOnZero = true,
	stopAnimationOnStart = true,
	full = false,
	// onlyAnimateOnIncrease = false,
	str,
	icon = false,
	iconSize = 30,
	// dashOnZero = false,
	// image,
	...props
}) => {
	const usdError = client.usd.useUsdError();

	if (usdError) unitOverride = 'ETH';

	const [value, unit] = React.useMemo(() => {
		if (typeof _value === 'number') return [_value, unitOverride ?? 'ETH'];
		if (unitOverride)
			return [_value[unitOverride.toLowerCase() as 'eth' | 'usd'].number, unitOverride];
		return [_value.selected.number, _value.preference];
	}, [_value, unitOverride]);

	// if (value === 0) value = MIN;
	const [isGwei, setIsGwei] = useState(forceGwei && !forceEth);
	const prevValue = usePrevious(value);
	// const prevValue2 = usePrevious(prevValue);

	// const [jumpValue, setJumpValue] = React.useState(MIN);
	// React.useEffect(() => {
	//     if (showIncrementAnimation && prevValue && prevValue !== 0 && prevValue < value) {
	//         setJumpValue(value - prevValue);
	//     }
	//     return undefined;
	// }, [value, prevValue, showIncrementAnimation]);
	useEffect(() => {
		if (!forceEth) setIsGwei(value < 0.001);
	}, [value, forceGwei, forceEth]);

	const okayAfterStart = React.useMemo(() => {
		return (
			!stopAnimationOnStart ||
			(prevValue !== undefined && prevValue !== 0 && prevValue !== value)
		);
	}, [prevValue, value, stopAnimationOnStart]);

	// console.log({ value, prevValue, okayAfterStart }, okayAfterStart ? 'AHHHHHHHH' : '');

	// const cancle = React.useMemo(() => {
	//     return (stopAnimationOnStart && (prevValue === 0 || prevValue === MIN)) ||
	//     stopAnimation || (onlyAnimateOnIncrease && prevValue2 === )
	// }, [])

	const [spring] = useSpring(
		{
			val: value || MIN,
			from: {
				val: loadOnZero && prevValue === undefined ? MIN : prevValue || value * 0.5,
			},
			config: config.molasses,
			immediate: stopAnimation || !okayAfterStart,
		},
		[prevValue, value, stopAnimation, okayAfterStart, loadOnZero],
	);
	// if (value < 13) console.log(spring.val.get());
	// const transitions = useTransition(jumpValue, {
	//     from: { opacity: 1, marginBottom: 30 },
	//     enter: { opacity: 0, marginBottom: 45 },
	//     delay: 300,
	//     cancel: !showIncrementAnimation,
	//     config: config.molasses,
	//     onRest: () => setJumpValue(MIN),
	// });

	return (
		<>
			{/* {showIncrementAnimation &&
                jumpValue !== 0 &&
                transitions(
                    (_styles, item) =>
                        item && (
                            <animated.div
                                style={{
                                    ..._styles,
                                    position: 'absolute',
                                    color: 'green',
                                }}
                            >
                                +{jumpValue.toFixed(5)}
                            </animated.div>
                        ),
                )} */}
			<Text
				{...props}
				textStyle={{
					...styles.textStyle,
					...props.textStyle,
				}}
				loading={value === 0 && loadingOnZero && !str}
			>
				{prefix && prefix}

				{value === 0 && str ? (
					str
				) : (
					<animated.span className="number" style={{ paddingRight: '.5rem' }}>
						{value === 0 && loadingOnZero
							? '----'
							: spring.val.to((val) => {
									const replace = val < 1;
									const res = full
										? val.toFixed(2)
										: isGwei
										? (val * 10 ** 9).toFixed(decimals)
										: percent
										? val >= 1
											? val.toFixed(1)
											: val.toFixed(2)
										: val > 1
										? CurrencyInt.format(val, unit === 'USD' ? 2 : 3)
										: val.toFixed(percent ? 2 : decimals || 5);
									if (replace) return res.replace('0.', '.');
									return res;
							  })}
					</animated.span>
				)}
				{percent && '%'}
				{!percent && showUnit && !icon && (
					<div style={{ paddingRight: '0rem', ...unitStyle }}>
						{unit === 'ETH' && isGwei ? 'gwei' : unit}
					</div>
				)}
				{icon && (
					<div
						style={{
							width: iconSize,
							height: iconSize,
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							background: lib.colors.white,
							borderRadius: 10,
							WebkitBackdropFilter: 'blur(50px)',
							backdropFilter: 'blur(50px)',
							boxShadow: lib.layout.boxShadow.centerDark,
							// marginRight: 7,
							// padding: 6,
						}}
					>
						{unit === 'USD' ? (
							<IoLogoUsd
								color={lib.colors.primaryColor}
								style={{ width: '65%', height: '65%' }}
							/>
						) : (
							<SiEthereum
								color={lib.colors.primaryColor}
								style={{ width: '65%', height: '65%' }}
							/>
						)}
					</div>
				)}
			</Text>
		</>
	);
};

export default CurrencyText;
