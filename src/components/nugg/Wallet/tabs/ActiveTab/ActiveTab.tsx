import React from 'react';
import { t } from '@lingui/macro';
import { IoLocate, IoSearch } from 'react-icons/io5';
import curriedLighten from 'polished/lib/color/lighten';
import { useNavigate } from 'react-router-dom';
import { GiQueenCrown } from 'react-icons/gi';

import web3 from '@src/web3';
import client from '@src/client';
import globalStyles from '@src/lib/globalStyles';
import Button from '@src/components/general/Buttons/Button/Button';
import TokenViewer from '@src/components/nugg/TokenViewer';
import lib, { isUndefinedOrNullOrBooleanFalse, isUndefinedOrNullOrObjectEmpty } from '@src/lib';
import Label from '@src/components/general/Label/Label';
import SimpleList from '@src/components/general/List/SimpleList';
import useViewingNugg from '@src/client/hooks/useViewingNugg';
import { useLiveTokenPoll } from '@src/client/subscriptions/useLiveNugg';

import styles from './ActiveTab.styles';

const fancy = curriedLighten(0.25)(lib.colors.blue);

export const ActiveRenderItem = ({
	item: tokenId,
	extraData: { isActiveOffers },
}: {
	item: TokenId;
	extraData: { isActiveOffers?: boolean };
}) => {
	const { gotoViewingNugg } = useViewingNugg();
	const navigate = useNavigate();
	const token = client.live.token(tokenId);
	const account = web3.hook.usePriorityAccount();

	const swap = React.useMemo(() => {
		return token?.activeSwap;
	}, [token?.activeSwap]);

	const itemNugg = client.live.token(swap?.isItem() ? swap?.leader : undefined);
	const myNuggs = client.user.useNuggs();
	const myNugg = React.useMemo(() => {
		return myNuggs.find((nugg) => nugg.tokenId === swap?.leader);
	}, [swap, myNuggs]);

	useLiveTokenPoll(!isUndefinedOrNullOrBooleanFalse(isActiveOffers), tokenId);
	useLiveTokenPoll(!isUndefinedOrNullOrBooleanFalse(myNugg), itemNugg?.tokenId);
	const leader = React.useMemo(() => {
		if (token?.isItem()) {
			return itemNugg?.owner;
		}
		return token?.activeSwap?.leader;
	}, [token, itemNugg]);
	return tokenId ? (
		<div
			style={{
				display: 'flex',
				flexDirection: 'column',
				// padding: '.5rem 1rem',
				background: lib.colors.white,
				justifyContent: 'space-between',
				alignItems: 'center',
				// width: '100%',
				borderRadius: lib.layout.borderRadius.mediumish,
				margin: '0rem .25rem',
				position: 'relative',
			}}
		>
			<Label
				text={tokenId.toPrettyId()}
				size="smaller"
				containerStyles={{
					color: 'white',
					background: fancy,
					position: 'absolute',
					top: 5,
					left: 5,
				}}
			/>
			{account &&
				(account?.toLowerCase() === leader?.toLowerCase() ||
					!isUndefinedOrNullOrObjectEmpty(myNugg)) && (
					<div
						style={{
							position: 'absolute',
							top: -5,
							right: -7,
							background: lib.colors.gradient,
							borderRadius: lib.layout.borderRadius.large,
							padding: '.4rem .4rem .1rem .4rem',
						}}
					>
						<GiQueenCrown color={lib.colors.white} />
					</div>
				)}
			<div
				style={{
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
				}}
			>
				<TokenViewer
					tokenId={tokenId}
					style={{ ...globalStyles.listNugg, margin: '1.5rem 1rem 0rem 1rem' }}
				/>
			</div>

			{/* <CurrencyText
				textStyle={{ color: fancy, paddingTop: '.4rem' }}
				value={swapValue}
				size="smaller"
			/> */}
			<div
				style={{
					display: 'flex',
					width: '100%',
					justifyContent: 'space-between',
					padding: '.2rem .4rem .4rem .4rem',
				}}
			>
				<Button
					onClick={() => {
						gotoViewingNugg(tokenId);
					}}
					buttonStyle={styles.button}
					rightIcon={<IoSearch color={lib.colors.white} />}
				/>
				<Button
					onClick={() => {
						navigate(`/swap/${tokenId}`);
					}}
					buttonStyle={{
						...styles.button,
						background: lib.colors.gradient2Transparent,
					}}
					rightIcon={<IoLocate color={lib.colors.white} />}
				/>
			</div>
		</div>
	) : null;
};

export default () => {
	const provider = web3.hook.usePriorityProvider();
	const chainId = web3.hook.usePriorityChainId();

	const swaps = client.v2.useCoreSwapLists();

	const minutes = client.epoch.active.useMinutes();

	const activeOffers = client.user.useActiveOffers();

	return chainId && provider ? (
		<div style={styles.container}>
			{/* <div>
				<div style={globalStyles.centeredSpaceBetween}>
					<TextStatistic
						label={t`Nuggs`}
						value={`${swaps.current.length}`}
						style={styles.statistic}
					/>
					<TextStatistic
						label={t`Active Items`}
						value={`${swaps.next.length}`}
						style={styles.statistic}
					/>
				</div>
			</div> */}
			<div>
				<SimpleList
					labelStyle={{ ...styles.listLabel }}
					data={swaps.current}
					extraData={{ isActiveOffers: false }}
					RenderItem={ActiveRenderItem}
					label={t`Ending in about ${minutes} minutes`}
					style={styles.list}
					loaderColor="white"
					listEmptyStyle={styles.textWhite}
					listEmptyText={t`no ongoing auctions`}
					action={() => undefined}
					horizontal
				/>
			</div>
			<div>
				<SimpleList
					labelStyle={{ ...styles.listLabel, marginTop: '10px' }}
					data={swaps.next}
					extraData={{ isActiveOffers: false }}
					RenderItem={ActiveRenderItem}
					label={t`Coming Up`}
					style={{ ...styles.list }}
					listEmptyStyle={styles.textWhite}
					listEmptyText={t`no upcoming auctions`}
					loaderColor="white"
					action={() => undefined}
					horizontal
				/>
			</div>
			<div>
				<SimpleList
					horizontal
					labelStyle={{ ...styles.listLabel, marginTop: '10px' }}
					data={activeOffers.map((i) => i.tokenId)}
					extraData={{ isActiveOffers: true }}
					RenderItem={ActiveRenderItem}
					label={t`Auctions you've bid on`}
					listEmptyStyle={styles.textWhite}
					listEmptyText={t`place some bids`}
					style={styles.list}
					loaderColor="white"
					action={() => undefined}
				/>
			</div>
		</div>
	) : null;
};
