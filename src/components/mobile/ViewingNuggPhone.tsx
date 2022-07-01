import React, { PropsWithChildren, useMemo } from 'react';
import { t } from '@lingui/macro';
import { animated, config, useSpring } from '@react-spring/web';
import { useNavigate } from 'react-router';
import { BigNumber } from '@ethersproject/bignumber';

import lib from '@src/lib';
import Text from '@src/components/general/Texts/Text/Text';
import web3 from '@src/web3';
import client from '@src/client';
import globalStyles from '@src/lib/globalStyles';
import { Fraction } from '@src/classes/Fraction';
import { useDebouncedSeconds } from '@src/client/hooks/useRemaining';
import { Lifecycle } from '@src/client/interfaces';
import CurrencyText from '@src/components/general/Texts/CurrencyText/CurrencyText';
import OffersList from '@src/components/nugg/RingAbout/OffersList';
import Label from '@src/components/general/Label/Label';
import useLifecycleEnhanced from '@src/client/hooks/useLifecycleEnhanced';
import { useGetNuggSnapshotsQuery, useGetNuggsThatHoldQuery } from '@src/gql/types.generated';
import { NuggListRenderItemMobileBigHoldingItem } from '@src/components/mobile/NuggListRenderItemMobile';
import SwapListPhone from '@src/components/mobile/SwapListPhone';
import { ItemListPhone } from '@src/components/nugg/ViewingNugg/ItemList';
import { buildTokenIdFactory } from '@src/prototypes';
import { ModalEnum } from '@src/interfaces/modals';
import useAnimateOverlayBackdrop from '@src/hooks/useAnimateOverlayBackdrop';
import useMobileViewingNugg from '@src/client/hooks/useMobileViewingNugg';
import usePrevious from '@src/hooks/usePrevious';
import GodList from '@src/components/general/List/GodList';
import { useLiveTokenPoll } from '@src/client/subscriptions/useLiveNugg';
import TheRingLight from '@src/components/nugg/TheRing/TheRingLight';
import { useLifecycleData } from '@src/client/hooks/useLifecycle';

import { NuggSnapshotRenderItem } from './NuggSnapshotItemMobile';
import MobileOfferButton from './MobileOfferButton';
import { GraphWarningSmall } from './GraphWarning';
import MobileCaboose from './MobileCaboose';

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

const twoDigits = (num: number) => String(num).padStart(2, '0');

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

export const GradientButt = ({
	onClick,
	children,
	style,
	gradient = lib.colors.gradient3,
	background = lib.colors.white,
	textStyle,
	...props
}: PropsWithChildren<React.HTMLAttributes<HTMLButtonElement>> & {
	gradient?: string;
	textStyle?: React.HTMLAttributes<HTMLSpanElement>['style'];
	background?: string;
}) => {
	return React.createElement(
		'div',
		{
			className: 'mobile-pressable-div',
			role: 'button',
			'aria-hidden': 'true',
			onClick,
			...props,
			style: {
				padding: '.6rem 1.2rem',
				borderRadius: lib.layout.borderRadius.large,
				boxShadow: lib.layout.boxShadow.basic,
				backgroundColor: background,
				...style,
			},
		},
		[
			React.createElement(
				'span',
				{
					style: {
						marginBottom: '0.5rem',
						background: gradient,
						color: 'black',
						WebkitBackgroundClip: 'text',
						WebkitTextFillColor: 'transparent',
						...lib.layout.presets.font.main.thicc,
						...textStyle,
					},
				},
				children,
			),
		],
	);
};

const MyNugg = ({ tokenId }: { tokenId: NuggId }) => {
	// const token = client.live.token(tokenId);
	// const address = web3.hook.usePriorityAccount();
	const openModal = client.modal.useOpenModal();

	const [lifecycle, swap, , leaderEns] = useLifecycleData(tokenId);

	const visible = React.useMemo(() => {
		if (!tokenId || !lifecycle) return false;

		return !swap;
	}, [tokenId, swap, lifecycle]);

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
				background: lib.colors.transparentWhite,
				borderRadius: lib.layout.borderRadius.mediumish,
				boxShadow: lib.layout.boxShadow.basic,
				WebkitBackdropFilter: 'blur(50px)',
				backdropFilter: 'blur(50px)',
				display: 'flex',
				justifyContent: 'center',
				flexDirection: 'column',
				alignItems: 'center',
				padding: '.5rem 1rem',
				...sty,
			}}
		>
			<div
				style={{
					display: 'flex',
					justifyContent: 'center',
					flexDirection: 'column',
					alignItems: 'center',
					padding: 5,
				}}
			>
				<div
					style={{
						alignItems: 'center',
						display: 'flex',
						width: '100%',
						justifyContent: 'center',
						// marginBottom: 10,
						// marginTop: 15,
					}}
				>
					{/* <Text
						size="medium"
						textStyle={{
							...lib.layout.presets.font.main.normal,
							...lib.layout.presets.font.main.semibold,
						}}
					>
						{t`owned by`}
					</Text> */}
					<Text
						loading={!leaderEns}
						textStyle={{
							// background: lib.colors.transparentWhite,
							// borderRadius: lib.layout.borderRadius.mediumish,
							// boxShadow: lib.layout.boxShadow.basic,
							// WebkitBackdropFilter: 'blur(50px)',
							// backdropFilter: 'blur(50px)',
							// padding: '.5rem .6rem',
							// margin: 5,
							// marginLeft: 5,
							fontSize: '25px',
							...lib.layout.presets.font.main.thicc,
						}}
					>
						{leaderEns || 'XXXX...XXXX'}
					</Text>
				</div>
				<Text
					size="smaller"
					textStyle={{ margin: 5, ...lib.layout.presets.font.main.semibold }}
				>{t`holder since ${new Date().toLocaleDateString()}`}</Text>
			</div>
			{lifecycle === Lifecycle.GrandStands && (
				<div
					style={{
						// paddingTop: 5,
						display: 'flex',
						alignItems: 'center',
						// flexDirection: 'column',
					}}
				>
					<GradientButt
						style={{
							margin: 5,
						}}
						gradient={lib.colors.gradient2}
						textStyle={{
							fontSize: '24px',
						}}
						onClick={() => {
							openModal(
								buildTokenIdFactory({
									modalType: ModalEnum.RotateO as const,
									tokenId,
									currentVersion: 0,
								}),
							);
						}}
					>{t`edit`}</GradientButt>

					<GradientButt
						style={{
							margin: 5,
						}}
						textStyle={{
							fontSize: '24px',
						}}
						onClick={() => {
							openModal(
								buildTokenIdFactory({
									modalType: ModalEnum.Sell as const,
									tokenId,
									sellingNuggId: null,
								}),
							);
						}}
					>{t`sell`}</GradientButt>
				</div>
			)}
		</animated.div>
	);
};

export const Timer = ({ seconds, resetOn }: { seconds: number; resetOn?: unknown }) => {
	const [trueSeconds] = useDebouncedSeconds(seconds, resetOn);

	const [spring] = useSpring(
		{
			val: trueSeconds,
			from: {
				val: trueSeconds,
			},
			config: config.molasses,
		},
		[trueSeconds],
	);

	return (
		<div
			style={{
				background: lib.colors.transparentWhite,
				borderRadius: lib.layout.borderRadius.mediumish,
				boxShadow: lib.layout.boxShadow.basic,
				WebkitBackdropFilter: 'blur(50px)',
				backdropFilter: 'blur(50px)',
				display: 'flex',
				justifyContent: 'center',
				flexDirection: 'column',
				alignItems: 'center',
				padding: '.5rem 1rem',
			}}
		>
			<animated.span
				style={{
					color: lib.colors.primaryColor,
					fontSize: '30px',
					...lib.layout.presets.font.code.semibold,
				}}
			>
				{spring.val.to((val) => {
					return `${twoDigits(Math.floor(val / 60))}:${twoDigits(Math.floor(val % 60))}`;
				})}
			</animated.span>
		</div>
	);
};

export const ActiveSwap = React.memo<{ tokenId?: TokenId }>(
	({ tokenId }) => {
		const epoch = client.epoch.active.useId();

		const [lifecycle, swap, swapCurrency, leaderEns, seconds] = useLifecycleData(tokenId);

		const visible = React.useMemo(() => {
			if (!tokenId || !epoch || !lifecycle) return false;

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

		const MemoizedTimer = React.useMemo(() => {
			return swap && !swap.isPotential && swap?.endingEpoch ? (
				<div>
					<Timer seconds={seconds ?? 0} resetOn={tokenId} />
				</div>
			) : null;
		}, [swap, seconds, tokenId]);
		// console.log({ tokenId, visible, swap, swapCurrency, leaderEns, seconds });

		if (swap?.isPotential && swap.isItem()) {
			return (
				<animated.div
					style={{
						display: 'flex',
						width: '90%',
						justifyContent: 'center',
						flexDirection: 'column',
						alignItems: 'center',
						background: lib.colors.transparentWhite,
						borderRadius: lib.layout.borderRadius.largish,
						padding: '1rem .5rem',
						marginTop: '1rem',
						...sty,
					}}
				>
					<MobileCaboose tokenId={swap.tokenId} />
				</animated.div>
			);
		}
		return (
			<animated.div
				style={{
					display: 'flex',
					width: '90%',
					justifyContent: 'center',
					flexDirection: 'column',
					alignItems: 'center',
					background: lib.colors.transparentWhite,
					borderRadius: lib.layout.borderRadius.largish,
					padding: '10px',
					marginTop: '1rem',
					...sty,
				}}
			>
				<div
					style={{
						display: 'flex',
						justifyContent: MemoizedTimer ? 'space-between' : 'center',
						width: '100%',
						alignItems: 'center',
					}}
				>
					<div
						style={{
							background: lib.colors.transparentWhite,
							borderRadius: lib.layout.borderRadius.mediumish,
							boxShadow: lib.layout.boxShadow.basic,
							WebkitBackdropFilter: 'blur(50px)',
							backdropFilter: 'blur(50px)',
							display: 'flex',
							justifyContent: 'center',
							flexDirection: 'column',
							alignItems: 'center',
							padding: '.5rem .6rem',
							paddingLeft: '.8rem',
						}}
					>
						<CurrencyText
							textStyle={{
								color: lib.colors.primaryColor,
								fontSize: '30px',
								display: 'flex',
								alignItems: 'center',
								fontWeight: lib.layout.fontWeight.semibold,
							}}
							stopAnimationOnStart
							value={swapCurrency}
							decimals={3}
							icon
							iconSize={32}
							loadingOnZero
						/>
					</div>

					{MemoizedTimer}
				</div>
				{(lifecycle === Lifecycle.Bench ||
					lifecycle === Lifecycle.Concessions ||
					lifecycle === Lifecycle.Minors) && (
					<div
						style={{
							alignItems: 'center',
							display: 'flex',
							width: '100%',
							justifyContent: 'center',
							marginBottom: 10,
							marginTop: 15,
						}}
					>
						<Text
							size="medium"
							textStyle={{
								...lib.layout.presets.font.main.normal,
							}}
						>
							{t`owned by`}
						</Text>
						<Text
							loading={!leaderEns}
							size="large"
							textStyle={{
								// background: lib.colors.transparentWhite,
								// borderRadius: lib.layout.borderRadius.mediumish,
								// boxShadow: lib.layout.boxShadow.basic,
								// WebkitBackdropFilter: 'blur(50px)',
								// backdropFilter: 'blur(50px)',
								// padding: '.5rem .6rem',
								// margin: 5,
								marginLeft: 5,
								...lib.layout.presets.font.main.thicc,
							}}
						>
							{leaderEns || 'XXXX...XXXX'}
						</Text>
					</div>
				)}

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

		// const openModal = client.modal.useOpenModal();
		// const sender = web3.hook.usePriorityAccount();

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

						{token && token.isItem() && <Info tokenId={token.tokenId} />}

						{token && token.isNugg() && <MyNugg tokenId={token.tokenId} />}

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
