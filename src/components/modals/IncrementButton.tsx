import React from 'react';
import { t } from '@lingui/macro';

import Button from '@src/components/general/Buttons/Button/Button';
import lib from '@src/lib';
import { EthInt } from '@src/classes/Fraction';

const IncrementButton = React.memo(
	({
		increment,
		wrappedSetAmount,
		amount,
		lastPressed,
	}: {
		increment: bigint;
		wrappedSetAmount: (amt: string, _lastPressed?: string) => void;
		amount: BigNumberish | null | undefined;
		lastPressed: string | undefined;
	}) => {
		return (
			<Button
				className="mobile-pressable-div"
				label={increment.toString() === '5' ? t`Min` : `+${increment.toString()}%`}
				onClick={() => {
					if (amount) {
						wrappedSetAmount(
							new EthInt(amount).increaseToFixedStringRoundingUp(increment, 5),
							increment.toString(),
						);
					}
				}}
				buttonStyle={{
					borderRadius: lib.layout.borderRadius.large,
					padding: '.4rem .7rem',
					background:
						lastPressed === increment.toString()
							? lib.colors.white
							: lib.colors.textColor,
					boxShadow:
						lastPressed === increment.toString()
							? `${lib.layout.boxShadow.medium}`
							: '',
					transition: `all .5s ${lib.layout.animation}`,
				}}
				size="medium"
				textStyle={{
					color:
						lastPressed === increment.toString()
							? lib.colors.textColor
							: lib.colors.white,
				}}
			/>
		);
	},
);
export default IncrementButton;
