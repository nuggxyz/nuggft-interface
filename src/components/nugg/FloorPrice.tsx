import React, { CSSProperties, FunctionComponent } from 'react';
import { t } from '@lingui/macro';

import CurrencyText from '@src/components/general/Texts/CurrencyText/CurrencyText';
import Text from '@src/components/general/Texts/Text/Text';
import client from '@src/client';
import { useDarkMode } from '@src/client/hooks/useDarkMode';
import lib from '@src/lib';

type Props = { style?: CSSProperties };

const FloorPrice: FunctionComponent<Props> = ({ style }) => {
	const stake__eps = client.stake.useEps();

	const preferenceValue = client.usd.useUsdPair(stake__eps);

	const darkmode = useDarkMode();

	return (
		<div
			style={{
				...style,
				display: 'flex',
				borderRadius: lib.layout.borderRadius.large,
				alignItems: 'center',
				justifyContent: 'center',
				margin: '.3rem 0rem',
			}}
		>
			<Text
				type="text"
				size="smaller"
				weight="bolder"
				textStyle={{
					paddingRight: '.6rem',
					color: lib.colors.nuggBlueText,
					...lib.layout.presets.font.main.bold,
					marginTop: '.1rem',
				}}
			>
				{t`FLOOR`}
			</Text>
			<CurrencyText
				textStyle={{ color: darkmode ? lib.colors.white : lib.colors.primaryColor }}
				size="small"
				image="eth"
				value={preferenceValue}
			/>
		</div>
	);
};

export default FloorPrice;
