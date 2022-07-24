import React, { FunctionComponent } from 'react';

import Text from '@src/components/general/Texts/Text/Text';
import web3 from '@src/web3';
import CurrencyText from '@src/components/general/Texts/CurrencyText/CurrencyText';
import client from '@src/client';
import lib from '@src/lib';
import { LiveItem, SwapData } from '@src/client/interfaces';
import Label from '@src/components/general/Label/Label';
import globalStyles from '@src/lib/globalStyles';
import { useUsdPair } from '@src/client/usd';
import styles from '@src/components/nugg/ViewingNugg/ViewingNugg.styles';
import { ADDRESS_ZERO } from '@src/web3/constants';

import { GraphWarning } from './GraphWarning';

type SwapDataWithTryout = SwapData & {
	tryout?: LiveItem['tryout'];
};

export const SwapListItem: FunctionComponent<{ item: SwapDataWithTryout }> = ({ item }) => {
	const provider = web3.hook.usePriorityProvider();

	const leaderEns = web3.hook.usePriorityAnyENSName(
		item.isItem() ? 'nugg' : provider,
		item.leader || undefined,
	);

	const amount = useUsdPair(item.eth);

	return (
		<div
			style={{
				marginBottom: 10,
				flexDirection: 'column',
				...globalStyles.centered,
			}}
		>
			<GraphWarning />
			<div
				style={{
					width: '100%',
					padding: '0rem 1rem',
					flexDirection: 'column',

					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
				}}
			>
				<div
					style={{
						padding: '.5rem 1rem',
						borderRadius: lib.layout.borderRadius.mediumish,
						position: 'relative',
						display: 'flex',
						flexDirection: 'column',
						width: '100%',
						zIndex: 101,
						background: lib.colors.transparentWhite,
					}}
				>
					<div style={styles.swapButton}>
						<Text
							textStyle={{
								color: lib.colors.primaryColor,
								fontWeight: lib.layout.fontWeight.thicc,
								textAlign: 'left',
							}}
						>
							{leaderEns}
							{item.startUnix && (
								<Text size="smaller">
									{new Date(item.startUnix * 1000).toLocaleDateString()}
								</Text>
							)}
						</Text>

						<CurrencyText
							value={amount}
							icon
							decimals={3}
							iconSize={25}
							textStyle={{
								background: lib.colors.primaryColor,
								color: 'white',
								padding: '.3rem .5rem',
								borderRadius: lib.layout.borderRadius.mediumish,
							}}
						/>
					</div>
				</div>
			</div>
		</div>
	);
};

const SwapListPhone: FunctionComponent<{ tokenId?: TokenId }> = ({ tokenId }) => {
	const token = client.token.useToken(tokenId);

	const epoch = client.epoch.active.useId();
	const filtered = React.useMemo(() => {
		if (token && epoch && token.isNugg()) {
			return token.swaps.filter(
				(x) => x.endingEpoch && x.endingEpoch < epoch && x.leader !== ADDRESS_ZERO,
			);
		}
		if (token && epoch && token.isItem()) {
			return token.swaps.filter((x) => x.endingEpoch && x.endingEpoch < epoch);
		}
		return [];
	}, [token, epoch]);

	return (
		<div
			style={{
				padding: 10,
				width: '100%',
			}}
		>
			{token &&
				(filtered.length === 0 ? (
					<div
						style={{
							display: 'flex',
							flexDirection: 'row',
							justifyContent: 'center',
							width: '100%',
						}}
					>
						<Label text="none" size="large" textStyle={{ padding: '.2rem .5rem' }} />
					</div>
				) : (
					<>
						{filtered.map((item, index) => (
							<SwapListItem key={`SwapItem${token.tokenId}${index}`} item={item} />
						))}
					</>
				))}
		</div>
	);
};

export default SwapListPhone;
