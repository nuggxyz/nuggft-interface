import React, { useMemo } from 'react';
import { plural, t } from '@lingui/macro';
import { animated, config, useSpring } from '@react-spring/web';
import { useNavigate } from 'react-router';
import { BigNumber } from '@ethersproject/bignumber';

import lib from '@src/lib';
import Text from '@src/components/general/Texts/Text/Text';
import web3 from '@src/web3';
import client from '@src/client';
import globalStyles from '@src/lib/globalStyles';
import { Fraction } from '@src/classes/Fraction';
import { useRemainingTrueSeconds } from '@src/client/hooks/useRemaining';
import { Lifecycle, TryoutData } from '@src/client/interfaces';
import CurrencyText from '@src/components/general/Texts/CurrencyText/CurrencyText';
import { Address } from '@src/classes/Address';
import OffersList from '@src/components/nugg/RingAbout/OffersList';
import Label from '@src/components/general/Label/Label';
import useLifecycleEnhanced from '@src/client/hooks/useLifecycleEnhanced';
import { useGetNuggSnapshotsQuery, useGetNuggsThatHoldQuery } from '@src/gql/types.generated';
import { NuggListRenderItemMobileBigHoldingItem } from '@src/components/mobile/NuggListRenderItemMobile';
import SwapListPhone from '@src/components/mobile/SwapListPhone';
import { ItemListPhone } from '@src/components/nugg/ViewingNugg/ItemList';
import { buildTokenIdFactory } from '@src/prototypes';
import { ModalEnum } from '@src/interfaces/modals';
import styles from '@src/components/nugg/ViewingNugg/ViewingNugg.styles';
import Button from '@src/components/general/Buttons/Button/Button';
import useAnimateOverlayBackdrop from '@src/hooks/useAnimateOverlayBackdrop';
import useMobileViewingNugg from '@src/client/hooks/useMobileViewingNugg';
import usePrevious from '@src/hooks/usePrevious';
import GodList from '@src/components/general/List/GodList';
import { useLiveTokenPoll } from '@src/client/subscriptions/useLiveNugg';
import TheRingLight from '@src/components/nugg/TheRing/TheRingLight';
import { useLifecycleData } from '@src/client/hooks/useLifecycle';

import { NuggSnapshotRenderItem } from './NuggSnapshotItemMobile';
import MobileOfferButton from './MobileOfferButton';
import MobileCaboose from './MobileCaboose';
import { GraphWarningSmall } from './GraphWarning';

const Ver = ({ left, right, label }: { left: number; right: number; label: string }) => {
	return (
		<div
			style={{
				width: '100%',
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
			}}
		>
			<Label
				text={`"${label}"`}
				containerStyles={{
					background: lib.colors.primaryColor,
					padding: '.3rem .5rem',
					borderRadius: lib.layout.borderRadius.medium,
				}}
				textStyle={{ color: 'white', fontSize: '16px' }}
			/>
			<div
				style={{
					display: 'flex',
					justifyContent: 'space-around',
					width: '100%',
					padding: '10px',
				}}
			>
				<div
					style={{
						display: 'flex',
						flexDirection: 'column',
						justifyContent: 'center',
						alignItems: 'center',
					}}
				>
					<CurrencyText
						forceEth
						value={left}
						percent
						decimals={3}
						textStyle={{ fontSize: '30px' }}
					/>
					<Text>{t`actual`}</Text>
				</div>
				<div
					style={{
						display: 'flex',
						flexDirection: 'column',
						justifyContent: 'center',
						alignItems: 'center',
					}}
				>
					<CurrencyText
						forceEth
						value={right}
						percent
						decimals={3}
						textStyle={{ fontSize: '30px' }}
					/>{' '}
					<Text>{t`predicted`}</Text>
				</div>
			</div>
		</div>
	);
};

const Info = ({ tokenId }: { tokenId?: ItemId }) => {
	const token = client.live.token(tokenId);
	const totalNuggs = client.stake.useTotalNuggs();
	const featureTotals = client.stake.useFeatureTotals();

	const feature = React.useMemo(() => {
		return tokenId ? tokenId.toRawIdNum().toItemFeature() : 0;
	}, [tokenId]);

	const observedPositionRarity = useMemo(() => {
		if (!token) return 0;
		return new Fraction(token.count, featureTotals[feature]).number;
	}, [token, featureTotals, feature]);

	const positionRarity = useMemo(() => {
		if (!token) return 0;
		return token.rarity.number;
	}, [token]);

	const featureRarity = useMemo(() => {
		if (!token) return 0;
		return web3.config.FEATURE_RARITY[feature];
	}, [token, feature]);

	const observedFeatureRarity = useMemo(() => {
		if (!token) return 0;
		return new Fraction(featureTotals[feature], totalNuggs).number;
	}, [token, totalNuggs, featureTotals, feature]);

	if (!tokenId || !token) return null;

	return (
		<>
			<div
				style={{
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'flex-start',
					textAlign: 'left',
					width: '100%',
					padding: '2rem 1rem 1rem 1.5rem',
				}}
			>
				<Text
					size="larger"
					textStyle={{
						color: lib.colors.primaryColor,
						fontWeight: lib.layout.fontWeight.thicc,
					}}
				>
					chances
				</Text>
			</div>
			<div
				style={{
					flexDirection: 'column',
					...globalStyles.centered,
					background: lib.colors.transparentWhite,
					borderRadius: lib.layout.borderRadius.medium,
					width: '90%',
					height: '100%',
					padding: '1rem .5rem',
				}}
			>
				<div style={{ width: '100%', marginTop: 15 }}> </div>{' '}
				<Ver
					left={observedPositionRarity * observedFeatureRarity * 100}
					right={featureRarity * positionRarity * 100}
					label={t`a new nugg has ${tokenId.toPrettyId().toLowerCase()}`}
				/>
				<div style={{ width: '100%', marginTop: 20 }}> </div>
				<Ver
					left={observedPositionRarity * 100}
					right={positionRarity * 100}
					label={t`a given ${web3.config.FEATURE_NAMES[
						feature
					].toLowerCase()} is ${tokenId.toPrettyId().toLowerCase()}`}
				/>
				<div style={{ width: '100%', marginTop: 20 }}> </div>
				<Ver
					left={observedFeatureRarity * 100}
					right={featureRarity * 100}
					label={t`a nugg is minted with ${web3.config.FEATURE_NAMES[
						feature
					].toLowerCase()}`}
				/>
			</div>
		</>
	);
};

const NextSwap = ({ tokenId }: { tokenId: ItemId }) => {
	const token = client.live.token(tokenId);

	const [selected, setSelected] = React.useState<TryoutData>();
	const [selectedMyNugg, setSelectedMyNugg] = React.useState<NuggId>();

	const [continued, setContinued] = React.useState<boolean>(false);

	const text = useMemo(() => {
		if (selected) return t`continue to start auction`;
		if (token && token.tryout && token.tryout.count && token.tryout.count > 0)
			return t`accept a nugg's asking price`;
		if (token && token.tokenId.toRawIdNum() < 1000) return t`bases are non transferable`;
		return t``;
	}, [token, selected]);

	const currency = client.usd.useUsdPair(selected ? selected.eth : token?.tryout?.min?.eth);

	const [sty] = useSpring(() => ({
		from: {
			maxHeight: '0%',
			opacity: 0,
		},
		to: {
			opacity: 1,
			maxHeight: '100%',
		},
		config: config.molasses,
	}));
	return (
		<animated.div
			style={{
				...sty,
				display: 'flex',
				width: '90%',
				justifyContent: 'center',
				flexDirection: 'column',
				alignItems: 'center',
				background: lib.colors.transparentWhite,
				borderRadius: lib.layout.borderRadius.medium,
				padding: '1rem .5rem',
				marginTop: '1rem',
			}}
		>
			<div
				style={{
					overflow: 'hidden',

					height: 'auto',
					width: '100%',
					alignItems: 'center',
					justifyContent: 'center',
					display: 'flex',
					flexDirection: 'column',
				}}
			>
				{token && token.tryout.min && (
					<div
						style={{
							alignItems: 'center',
							display: 'flex',
							flexDirection: 'column',
							marginBottom: '20px',
							marginTop: '10px',
						}}
					>
						<CurrencyText
							textStyle={{
								color: lib.colors.primaryColor,
								fontSize: '28px',
							}}
							image="eth"
							value={currency}
							decimals={3}
						/>
						<Text
							textStyle={{
								fontSize: '13px',
								color: lib.colors.primaryColor,
							}}
						>
							{selected
								? t`${selected.nugg.toPrettyId()}'s asking price`
								: t`minimum price`}
						</Text>
					</div>
				)}
				<>
					<Text textStyle={{ color: lib.colors.primaryColor }}>
						{continued
							? !selectedMyNugg
								? t`which nugg should bid on your behalf?`
								: t`you will bid as ${selectedMyNugg.toPrettyId()}`
							: text}
					</Text>

					<MobileCaboose
						tokenId={tokenId}
						onSelectNugg={setSelected}
						onSelectMyNugg={setSelectedMyNugg}
						onContinue={() => {
							setContinued(true);
						}}
					/>
				</>
			</div>
		</animated.div>
	);
};

const ActiveSwap = React.memo<{ tokenId?: TokenId }>(
	({ tokenId }) => {
		const token = client.live.token(tokenId);
		const epoch = client.epoch.active.useId();

		const [lifecycle, swap, swapCurrency] = useLifecycleData(tokenId);

		const { minutes, seconds } = client.epoch.useEpoch(
			swap?.isPotential ? 0 : swap?.endingEpoch,
		);

		const trueSeconds = useRemainingTrueSeconds(seconds ?? 0);
		const provider = web3.hook.usePriorityProvider();

		const leaderEns = web3.hook.usePriorityAnyENSName(
			token && token.type === 'item' ? 'nugg' : provider,
			swap?.isPotential ? undefined : swap?.leader || undefined,
		);

		const visible = React.useMemo(() => {
			if (!tokenId || !epoch || !lifecycle) return false;

			if (swap?.isPotential) {
				if (swap.isItem()) return false;
				return true;
			}

			return !!swap;
		}, [tokenId, swap, lifecycle, epoch]);

		const [sty] = useSpring(
			() => ({
				from: {
					maxHeight: '0%',
					opacity: 0,
				},
				to: {
					opacity: visible ? 1 : 0,
					maxHeight: visible ? '100%' : '0%',
				},
				config: config.molasses,
			}),
			[visible],
		);

		return (
			<animated.div
				style={{
					display: 'flex',
					width: '90%',
					justifyContent: 'center',
					flexDirection: 'column',
					alignItems: 'center',
					background: lib.colors.transparentWhite,
					borderRadius: lib.layout.borderRadius.medium,
					padding: '1rem .5rem',
					marginTop: '1rem',
					...sty,
				}}
			>
				<animated.div
					style={{
						display: 'flex',
						justifyContent: 'space-around',
						width: '100%',
						alignItems: 'center',
					}}
				>
					{lifecycle === Lifecycle.Minors ||
					lifecycle === Lifecycle.Bench ||
					lifecycle === Lifecycle.Concessions ? (
						<div
							style={{
								alignItems: 'center',
								display: 'flex',
								flexDirection: 'column',
							}}
						>
							<CurrencyText
								textStyle={{
									color: lib.colors.primaryColor,
									fontSize: '28px',
								}}
								forceEth
								value={swapCurrency}
								decimals={3}
							/>
							<Text
								textStyle={{
									fontSize: '13px',
									color: lib.colors.primaryColor,
								}}
							>
								{lifecycle === Lifecycle.Minors
									? t`starting price`
									: t`asking price`}
							</Text>
							{lifecycle !== Lifecycle.Minors && (
								<div style={{ display: 'flex' }}>
									<Text
										size="large"
										textStyle={{
											paddingTop: '1rem',
											paddingRight: '.5em',
										}}
									>
										{t`for sale by`}
									</Text>
									<Text
										loading={!leaderEns}
										size="large"
										textStyle={{
											paddingTop: '1rem',
										}}
									>
										{leaderEns || 'XXXX...XXXX'}
									</Text>
								</div>
							)}
						</div>
					) : (
						<div
							style={{
								alignItems: 'flex-start',
								display: 'flex',
								flexDirection: 'column',
							}}
						>
							<CurrencyText
								textStyle={{
									color: lib.colors.primaryColor,
									fontSize: '28px',
								}}
								forceEth
								value={swapCurrency}
								decimals={3}
							/>
							<Text
								textStyle={{
									fontSize: '13px',
									color: lib.colors.primaryColor,
								}}
							>
								{!swap?.isPotential &&
								leaderEns &&
								swap?.leader !== Address.ZERO.hash
									? t`${leaderEns} is leading`
									: t`starting price`}
							</Text>
						</div>
					)}
					{swap && !swap.isPotential && swap?.endingEpoch && (
						<div
							style={{
								alignItems: 'flex-end',
								display: 'flex',
								flexDirection: 'column',
							}}
						>
							<Text
								textStyle={{
									fontSize: '13px',
									color: lib.colors.primaryColor,
								}}
							>
								{t`ending in about`}
							</Text>
							<Text
								textStyle={{
									color: lib.colors.primaryColor,
									fontSize: '28px',
								}}
							>
								{!minutes
									? `${plural(trueSeconds ?? 0, {
											1: '# second',
											other: '# seconds',
									  })}`
									: `${plural(minutes, {
											1: '# minute',
											other: '# minutes',
									  })}`}
							</Text>
						</div>
					)}
				</animated.div>
				<OffersList tokenId={tokenId} />
				<MobileOfferButton tokenId={tokenId} />
			</animated.div>
		);
	},
	(prev, next) => prev.tokenId === next.tokenId || next.tokenId === undefined,
);

export const ViewingNuggPhoneController = () => {
	const openViewScreen = client.viewscreen.useOpenViewScreen();
	const closeViewScreen = client.viewscreen.useCloseViewScreen();

	const { tokenId } = useMobileViewingNugg();

	const navigate = useNavigate();

	React.useEffect(() => {
		if (tokenId) openViewScreen(tokenId);
		return () => {
			closeViewScreen();
		};
	}, [tokenId, openViewScreen, closeViewScreen, navigate]);

	return null;
};

const ViewingNuggPhone = React.memo<{ tokenId?: TokenId }>(
	({ tokenId }) => {
		const isOpen = client.viewscreen.useViewScreenOpen();

		useLiveTokenPoll(isOpen && tokenId !== undefined, tokenId);

		const openModal = client.modal.useOpenModal();
		const sender = web3.hook.usePriorityAccount();

		const prevTokenId = usePrevious(tokenId);

		const ref = React.useRef<HTMLDivElement>(null);

		React.useEffect(() => {
			if (ref && ref.current && prevTokenId !== tokenId) {
				window.requestAnimationFrame(() => {
					if (ref.current) {
						ref.current.scrollTo({ top: 0 });
					}
				});
			}
		}, [tokenId, prevTokenId, ref]);

		const token = client.live.token(tokenId);

		const lifecycle = useLifecycleEnhanced(tokenId);

		const { data } = useGetNuggsThatHoldQuery({
			fetchPolicy: 'no-cache',
			skip: !token || !token.isItem(),
			variables: {
				skip: 0,
				first: 1000,
				itemId: token?.tokenId.toRawId() || '',
			},
		});

		const ider = React.useId();

		const overlay = useAnimateOverlayBackdrop(isOpen);

		const { data: snapshots } = useGetNuggSnapshotsQuery({
			skip: !tokenId || tokenId?.isItemId(),
			variables: {
				tokenId: tokenId?.toRawId() || '',
			},
		});

		const renderItemData = React.useMemo(() => {
			return token?.isItem()
				? data?.nuggItems.map((x) => ({
						tokenId: x.nugg.id.toNuggId(),
						since: Number(x?.displayedSinceUnix || 0),
				  })) || []
				: [...(snapshots?.nugg?.snapshots || [])].sort((a, b) =>
						BigNumber.from(a.block).gt(BigNumber.from(b.block)) ? -1 : 1,
				  );
		}, [token, data, snapshots]);

		if (!isOpen) return null;

		return (
			<animated.div
				style={{
					position: 'absolute',
					width: '100%',
					height: '100%',
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					overflow: 'hidden',
					flexDirection: 'column',
					zIndex: 100000,
					...overlay,
				}}
			>
				<div
					draggable="true"
					style={{
						height: '100%',
						width: '100%',
						borderTopLeftRadius: lib.layout.borderRadius.largish,
						borderTopRightRadius: lib.layout.borderRadius.largish,
						position: 'absolute',
						justifyContent: 'flex-start',
						alignItems: 'center',
						display: 'flex',
						flexDirection: 'column',
						background: 'transparent',
					}}
				>
					<div
						ref={ref}
						style={{
							// scrollBehavior: 'smooth',
							WebkitScrollSnapType: 'y',
							WebkitOverflowScrolling: 'touch',
							position: 'relative',
							display: 'flex',
							flexDirection: 'column',
							width: '100%',
							alignItems: 'center',
							justifyContent: 'start',
							backdropFilter: 'blur(5px)',
							WebkitBackdropFilter: 'blur(5px)',
							height: '100%',
							overflowY: 'auto',
						}}
					>
						<div
							style={{
								position: 'relative',
								width: '100%',
								top: 0,
								display: 'flex',
								justifyContent: 'center',
								alignItems: 'flex-end',
								zIndex: 1000,
							}}
						>
							<div
								style={{
									display: 'flex',
									justifyContent: 'center',
									alignItems: 'center',
									width: '100%',
									height: '100%',
									paddingTop: '20px',
								}}
							>
								<div
									style={{
										width: '100%',
										height: '375px',
										display: 'flex',
										flexDirection: 'column',
										justifyContent: 'center',
										alignItems: 'center',
										// marginBottom: '-10px',
										marginTop: '-30px',
									}}
								>
									<TheRingLight
										circleWidth={1000}
										strokeWidth={10}
										disableClick
										manualTokenId={tokenId}
										disableHover
										tokenStyle={{ width: '275px', height: '275px' }}
									/>
								</div>
							</div>
						</div>
						<div
							style={{
								marginTop: -10,
								display: 'flex',
								justifyContent: 'center',
								flexDirection: 'column',
								alignItems: 'center',
								background: lib.colors.transparentWhite,
								borderRadius: lib.layout.borderRadius.medium,
								padding: '.7rem .8rem',
							}}
						>
							<Text
								textStyle={{
									color: lib.colors.primaryColor,
									borderRadius: lib.layout.borderRadius.large,
								}}
								size="larger"
							>
								{tokenId && tokenId.toPrettyId()}
							</Text>
							{lifecycle && (
								<Label
									// type="text"
									containerStyles={{
										background: 'transparent',
									}}
									size="small"
									textStyle={{
										color: lib.colors.primaryColor,

										position: 'relative',
									}}
									text={lifecycle?.label}
									leftDotColor={lifecycle.color}
								/>
							)}
						</div>

						<ActiveSwap tokenId={tokenId} />

						{token && token.isItem() && token.tryout.count > 0 && (
							<>
								{token?.activeSwap && (
									<div
										style={{
											display: 'flex',
											justifyContent: 'flex-start',
											alignItems: 'flex-start',
											textAlign: 'left',
											width: '100%',
											padding: '2rem 1rem 1rem 1.5rem',
										}}
									>
										<Text
											size="larger"
											textStyle={{
												color: lib.colors.primaryColor,
												fontWeight: lib.layout.fontWeight.thicc,
											}}
										>
											{t`start the next auction`}
										</Text>
									</div>
								)}
								<NextSwap tokenId={token.tokenId} />
							</>
						)}

						{token && token.isItem() && <Info tokenId={token.tokenId} />}

						{token && token.type === 'nugg' && token.owner === sender && (
							<>
								<div
									style={{
										display: 'flex',
										justifyContent: 'flex-start',
										alignItems: 'flex-start',
										textAlign: 'left',
										width: '100%',
										marginTop: 20,

										padding: '2rem 1rem 1rem 1.5rem',
									}}
								>
									<Text
										size="larger"
										textStyle={{
											color: lib.colors.primaryColor,
											fontWeight: lib.layout.fontWeight.thicc,
										}}
									>
										{t`my nugg`}
									</Text>
								</div>
								<Button
									className="mobile-pressable-div"
									buttonStyle={{
										...styles.goToSwap,
										marginTop: 10,

										position: 'relative',
									}}
									textStyle={{
										...styles.goToSwapGradient,
										padding: '.2rem .5rem',
										fontSize: '24px',
										fontWeight: lib.layout.fontWeight.thicc,
									}}
									label={t`put up for sale`}
									// rightIcon={<IoArrowRedo color={lib.colors.gradientPink} />}
									onClick={() => {
										openModal(
											buildTokenIdFactory({
												modalType: ModalEnum.Sell as const,
												tokenId: token.tokenId,
												sellingNuggId: null,
											}),
										);
									}}
								/>
								<Button
									className="mobile-pressable-div"
									buttonStyle={{
										...styles.goToSwap,
										marginTop: 10,

										position: 'relative',
									}}
									textStyle={{
										...styles.goToSwapGradient,
										background: lib.colors.gradient2,
										padding: '.2rem .5rem',
										fontSize: '24px',
										fontWeight: lib.layout.fontWeight.thicc,
									}}
									label={t`edit`}
									// rightIcon={<IoArrowRedo color={lib.colors.gradientPink} />}
									onClick={() => {
										openModal(
											buildTokenIdFactory({
												modalType: ModalEnum.RotateO as const,
												tokenId: token.tokenId,
												currentVersion: renderItemData.length - 1,
											}),
										);
									}}
								/>
							</>
						)}

						{tokenId && tokenId.isNuggId() && (
							<>
								<div
									style={{
										display: 'flex',
										justifyContent: 'flex-start',
										alignItems: 'flex-start',
										textAlign: 'left',
										width: '100%',
										padding: '2rem 1rem 1rem 1.5rem',
									}}
								>
									<Text
										size="larger"
										textStyle={{
											color: lib.colors.primaryColor,
											fontWeight: lib.layout.fontWeight.thicc,
										}}
									>
										{t`items`}
									</Text>
								</div>
								<ItemListPhone tokenId={tokenId} />
							</>
						)}
						<div
							style={{
								display: 'flex',
								justifyContent: 'space-between',
								alignItems: 'flex-start',
								textAlign: 'left',
								width: '100%',
								padding: '2rem 1rem 1rem 1.5rem',
							}}
						>
							<Text
								size="larger"
								textStyle={{
									color: lib.colors.primaryColor,
									fontWeight: lib.layout.fontWeight.thicc,
								}}
							>
								{t`purchases`}
							</Text>
							<GraphWarningSmall />
						</div>
						<SwapListPhone tokenId={tokenId} />

						<div
							style={{
								display: 'flex',
								justifyContent: 'space-between',
								alignItems: 'flex-start',
								textAlign: 'left',
								width: '100%',
								padding: '2rem 1rem 1rem 1.5rem',
							}}
						>
							<Text
								size="larger"
								textStyle={{
									color: lib.colors.primaryColor,
									fontWeight: lib.layout.fontWeight.thicc,
								}}
							>
								{token?.isItem() ? t`worn by` : t`history`}
							</Text>
							<GraphWarningSmall />
						</div>

						<GodList
							id={ider}
							style={{
								position: 'relative',
								width: '100%',
								overflow: undefined,
								flexDirection: 'column',
							}}
							coreRef={ref}
							itemHeight={340}
							endGap={100}
							offsetListRef
							// @ts-ignore
							data={renderItemData}
							// @ts-ignore
							RenderItem={
								token?.isItem()
									? NuggListRenderItemMobileBigHoldingItem
									: NuggSnapshotRenderItem
							}
							disableScroll
							extraData={undefined}
						/>

						<div
							style={{
								width: '100%',
								marginTop: '400px',
								position: 'relative',
								display: 'flex',
							}}
						/>
					</div>
				</div>
			</animated.div>
		);
	},
	(prev, curr) => prev.tokenId === curr.tokenId || curr.tokenId === undefined,
);

export default ViewingNuggPhone;
