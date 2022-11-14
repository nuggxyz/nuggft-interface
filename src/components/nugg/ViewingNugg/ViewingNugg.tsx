import React, { FunctionComponent, useMemo, useState } from 'react';
import { t } from '@lingui/macro';
import { IoChevronDown, IoChevronUp } from 'react-icons/io5';
import { BigNumber } from '@ethersproject/bignumber';

import lib, { isUndefinedOrNullOrArrayEmpty } from '@src/lib';
import Loader from '@src/components/general/Loader/Loader';
import Text from '@src/components/general/Texts/Text/Text';
import TokenViewer from '@src/components/nugg/TokenViewer';
import web3 from '@src/web3';
import client from '@src/client';
import HappyTabber from '@src/components/general/HappyTabber/HappyTabber';
import AddressViewer from '@src/components/general/Texts/AddressViewer/AddressViewer';
import useViewingNugg from '@src/client/hooks/useViewingNugg';
import globalStyles from '@src/lib/globalStyles';
import AnimatedCard from '@src/components/general/Cards/AnimatedCard/AnimatedCard';
import Button from '@src/components/general/Buttons/Button/Button';
import { useLiveTokenPoll } from '@src/client/subscriptions/useLiveNugg';
import { useLifecycleData } from '@src/client/hooks/useLifecycle';
import { ADDRESS_ZERO } from '@src/web3/constants';
import { SwapListItem } from '@src/components/mobile/SwapListPhone';
import { useGetNuggSnapshotsQuery, useGetNuggsThatHoldQuery } from '@src/gql/types.generated';
import GodList from '@src/components/general/List/GodList';
import { NuggListRenderItemMobileBigHoldingItem } from '@src/components/mobile/NuggListRenderItemMobile';
import { NuggSnapshotRenderItem } from '@src/components/mobile/NuggSnapshotItemMobile';
import { Fraction } from '@src/classes/Fraction';
import { InfoPoint } from '@src/components/mobile/ViewingNuggPhone';

import styles from './ViewingNugg.styles';
import MyNuggActions from './MyNuggActions';
import ItemList from './ItemList';
import ActiveSwap from './ActiveSwap';

type Props = Record<string, never>;

const ViewingNugg: FunctionComponent<Props> = () => {
	const epoch = client.epoch.active.useId();

	const { safeTokenId: tokenId } = useViewingNugg();
	const [, activeSwap] = useLifecycleData(tokenId);

	const sender = web3.hook.usePriorityAccount();

	const provider = web3.hook.usePriorityProvider();

	useLiveTokenPoll(tokenId !== undefined, tokenId);

	const token = client.token.useToken(tokenId);

	const filteredPurchases = React.useMemo(() => {
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

	const List = React.useMemo(
		() =>
			tokenId && tokenId.isNuggId() && token && token.type === 'nugg' && tokenId ? (
				<ItemList
					items={token?.items || []}
					isOwner={!!sender && sender === token.owner && !token?.activeSwap?.tokenId}
					tokenId={tokenId}
				/>
			) : null,
		[tokenId, token, sender],
	);

	const PurchasesList = React.useMemo(
		() =>
			token ? (
				<div
					style={{
						width: '100%',
						display: 'flex',
						flexDirection: 'column',
						justifyContent: 'center',
						alignItems: 'center',
					}}
				>
					<div
						style={{
							overflow: 'scroll',
							width: '80%',
						}}
					>
						{filteredPurchases.map((item, index) => (
							<SwapListItem key={`SwapItem${token.tokenId}${index}`} item={item} />
						))}
					</div>
				</div>
			) : null,
		[token, filteredPurchases],
	);

	const { data: snapshots } = useGetNuggSnapshotsQuery({
		skip: !tokenId || tokenId?.isItemId(),
		variables: {
			tokenId: tokenId?.toRawId() || '',
		},
	});

	const { data: holders } = useGetNuggsThatHoldQuery({
		fetchPolicy: 'no-cache',
		skip: !token || !token.isItem(),
		variables: {
			skip: 0,
			first: 1000,
			itemId: token?.tokenId.toRawId() || '',
		},
	});

	const renderItemData = React.useMemo(() => {
		return token?.isItem()
			? holders?.nuggItems.map((x) => ({
					tokenId: x.nugg.id.toNuggId(),
					since: Number(x?.displayedSinceUnix || 0),
			  })) || []
			: [...(snapshots?.nugg?.snapshots || [])].sort((a, b) =>
					BigNumber.from(a.block).gt(BigNumber.from(b.block)) ? -1 : 1,
			  );
	}, [token, holders, snapshots]);

	const totalNuggs = client.stake.useTotalNuggs();
	const featureTotals = client.stake.useFeatureTotals();

	const ItemInfo = React.useMemo(() => {
		if (token?.isItem()) {
			const feature = tokenId ? tokenId.toRawIdNum().toItemFeature() : 0;

			const observedPositionRarity = !token
				? 0
				: new Fraction(token.count, featureTotals[feature]).number;

			const positionRarity = !token ? 0 : token.rarity.number;

			const featureRarity = !token ? 0 : web3.config.FEATURE_RARITY[feature];

			const observedFeatureRarity = !token
				? 0
				: new Fraction(featureTotals[feature], totalNuggs).number;

			if (!tokenId || !token) return null;

			return (
				<div
					style={{
						flexDirection: 'column',
						width: '100%',
						height: '100%',
						padding: '1rem .5rem',
						overflow: 'scroll',
						display: 'flex',
						alignItems: 'center',
					}}
				>
					<div
						style={{
							marginTop: 15,
							width: '80%',
							padding: '1rem',
							background: lib.colors.transparentWhite,
							borderRadius: lib.layout.borderRadius.medium,
						}}
					>
						<InfoPoint
							left={observedPositionRarity * observedFeatureRarity * 100}
							right={featureRarity * positionRarity * 100}
							label={t`a new nugg has ${tokenId.toPrettyId().toLowerCase()}`}
						/>
					</div>
					<div
						style={{
							marginTop: 15,
							width: '80%',
							padding: '1rem',
							background: lib.colors.transparentWhite,
							borderRadius: lib.layout.borderRadius.medium,
						}}
					>
						<InfoPoint
							left={observedPositionRarity * 100}
							right={positionRarity * 100}
							label={t`a given ${web3.config.FEATURE_NAMES[
								feature
							].toLowerCase()} is ${tokenId.toPrettyId().toLowerCase()}`}
						/>
					</div>
					<div
						style={{
							marginTop: 15,
							width: '80%',
							padding: '1rem',
							background: lib.colors.transparentWhite,
							borderRadius: lib.layout.borderRadius.medium,
						}}
					>
						<InfoPoint
							left={observedFeatureRarity * 100}
							right={featureRarity * 100}
							label={t`a nugg is minted with ${web3.config.FEATURE_NAMES[
								feature
							].toLowerCase()}`}
						/>
					</div>
				</div>
			);
		}
		return null;
	}, [token, tokenId, totalNuggs, featureTotals]);

	const ider = React.useId();

	const ExtraInfo = React.useMemo(
		() => (
			<GodList
				id={ider}
				style={{
					position: 'relative',
					width: '100%',
					overflow: 'scroll',
					flexDirection: 'column',
					// background: 'red',
					height: '100%',
				}}
				itemHeight={340}
				endGap={100}
				// @ts-ignore
				data={renderItemData}
				// @ts-ignore
				RenderItem={
					token?.isItem()
						? NuggListRenderItemMobileBigHoldingItem
						: NuggSnapshotRenderItem
				}
				extraData={undefined}
			/>
		),
		[ider, renderItemData, token],
	);

	const happyTabs = useMemo(() => {
		const tabs = [];

		if (
			activeSwap &&
			(activeSwap.isNugg() ||
				// @ts-ignore
				!isUndefinedOrNullOrArrayEmpty(activeSwap.swaps) ||
				// @ts-ignore
				activeSwap.endingEpoch)
		) {
			tabs.push({
				label: t`Active`,
				comp: React.memo(ActiveSwap),
			});
		}
		if (token && token.type === 'nugg' && token.owner === sender) {
			tabs.push({
				label: t`My Nugg`,
				comp: React.memo(MyNuggActions),
			});
		}
		if (!isUndefinedOrNullOrArrayEmpty(filteredPurchases)) {
			tabs.push({
				label: t`Purchases`,
				comp: () => PurchasesList,
			});
		}
		if (token && token.type === 'nugg') {
			tabs.push({
				label: t`Items`,
				comp: () => List,
			});
		} else if (token && token.type === 'item') {
			tabs.push({
				label: t`Chances`,
				comp: () => ItemInfo,
			});
		}

		tabs.push({
			label: token?.type === 'item' ? t`Worn by` : t`History`,
			comp: () => ExtraInfo,
		});

		return tabs;
	}, [token, sender, List, activeSwap, PurchasesList, filteredPurchases, ExtraInfo]);

	const [expanded, setExpanded] = useState(false);

	return (
		<div
			style={{ ...styles.container, opacity: provider && epoch && tokenId && token ? 1 : 0 }}
		>
			<div style={styles.swaps}>
				<div style={styles.owner}>
					<div style={{ display: 'flex' }}>
						<Text textStyle={styles.nuggId} size="large">
							{tokenId && tokenId.toPrettyId()}
						</Text>
						{token && token.type === 'nugg' ? (
							token.owner ? (
								<div
									style={{
										marginLeft: '1rem',
										display: 'flex',
										justifyContent: 'center',
										flexDirection: 'column',
									}}
								>
									<Text
										type="text"
										size="smaller"
										textStyle={{
											color: lib.colors.white,
										}}
									>
										{t`Owned by`}
									</Text>
									<div style={globalStyles.centered}>
										<AddressViewer
											address={token.owner}
											textStyle={styles.titleText}
											param={token.owner}
											route="address"
											size="large"
											isNugg={false}
										/>
									</div>
								</div>
							) : (
								<Loader color={lib.colors.nuggBlueText} />
							)
						) : token ? (
							<div
								style={{
									...globalStyles.centeredSpaceBetween,
									...globalStyles.fillWidth,
								}}
							>
								<div style={{ marginLeft: '1rem' }}>
									<Text
										type="text"
										size="smaller"
										textStyle={{
											color: lib.colors.white,
										}}
									>
										{t`Owned by`}
									</Text>
									<Text type="text" size="large" textStyle={styles.titleText}>
										{t`${token.count} Nugg${
											token.count > 1 || !token.count ? 's' : ''
										}`}
									</Text>
								</div>
							</div>
						) : null}
					</div>
					<div style={{ display: 'flex' }}>
						<div
							style={{
								opacity: expanded ? 1 : 0,
								transition: `opacity .5s ${lib.layout.animation}`,
								marginRight: '.5rem',
							}}
						>
							<TokenViewer
								tokenId={tokenId}
								disableOnClick
								style={{
									height: '45px',
									width: '45px',
								}}
							/>
						</div>
						<Button
							buttonStyle={{
								borderRadius: lib.layout.borderRadius.mediumish,
								boxShadow: lib.layout.boxShadow.medium,
							}}
							rightIcon={
								expanded ? (
									<IoChevronDown color={lib.colors.nuggBlueText} size={26} />
								) : (
									<IoChevronUp color={lib.colors.nuggBlueText} size={26} />
								)
							}
							onClick={() => setExpanded((e) => !e)}
						/>
					</div>
				</div>
				<div
					style={{
						...styles.nuggContainer,
						marginTop: token && token.type === 'item' ? '1.5rem' : '0rem',
						opacity: expanded ? 0 : 1,
						height: expanded ? '0px' : '400px',
						overflow: expanded ? 'hidden' : 'visible',
						transition: `all .5s ${lib.layout.animation}`,
					}}
				>
					<div
						style={{
							height: '400px',
							width: '400px',
							position: 'relative',
							padding: '.5rem',
						}}
					>
						<div style={{ position: expanded ? 'relative' : 'fixed' }}>
							<AnimatedCard>
								{tokenId && (
									<TokenViewer tokenId={tokenId} showcase disableOnClick />
								)}
							</AnimatedCard>
						</div>
					</div>
				</div>
				<HappyTabber
					defaultActiveIndex={0}
					items={happyTabs}
					selectionIndicatorStyle={{ background: lib.colors.white }}
					bodyStyle={styles.tabberList}
					headerContainerStyle={{
						marginTop: '1.5rem',
						padding: '0rem 1rem',
						borderRadius: 0,
					}}
				/>
			</div>
		</div>
	);
};

export default React.memo(ViewingNugg);
