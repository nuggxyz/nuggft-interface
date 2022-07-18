import { animated } from '@react-spring/web';
import React, { FC, useState } from 'react';
import { useNavigate, useMatch } from 'react-router-dom';
import { t } from '@lingui/macro';
import { IoArrowDownCircle, IoArrowUpCircle, IoReload } from 'react-icons/io5';
import Confetti from 'react-confetti';
import { BigNumber } from '@ethersproject/bignumber/lib/bignumber';
import { isUndefined } from 'lodash';

import client from '@src/client';
import TokenViewer from '@src/components/nugg/TokenViewer';
import Button from '@src/components/general/Buttons/Button/Button';
import lib, { parseItmeIdToNum } from '@src/lib';
import { useAsyncSetState, useMemoizedAsyncState } from '@src/hooks/useAsyncState';
import {
	useNuggftV1,
	useDotnuggV1,
	usePrioritySendTransaction,
	useTransactionManager2,
	useXNuggftV1,
} from '@src/contracts/useContract';
import Label from '@src/components/general/Label/Label';
import eth from '@src/assets/images/app_logos/eth.png';
import web3 from '@src/web3';
import useAnimateOverlay from '@src/hooks/useAnimateOverlay';
import Text from '@src/components/general/Texts/Text/Text';
import { buildTokenIdFactory } from '@src/prototypes';
import Loader from '@src/components/general/Loader/Loader';
import emitter from '@src/emitter';
import { useDotnuggInjectToCache } from '@src/client/hooks/useDotnugg';
import FeedbackButton from '@src/components/general/Buttons/FeedbackButton/FeedbackButton';
import useDimensions from '@src/client/hooks/useDimensions';
import TransactionVisualConfirmation from '@src/components/nugg/TransactionVisualConfirmation';
import { GodListRenderItemProps } from '@src/components/general/List/GodList';
import { ADDRESS_ZERO, FEATURE_NAMES } from '@src/web3/constants';

import styles from './HotRotateO.styles';

const mockFloopOpenSlot = (proof: number[], index: number) => {
	let ptr = 8;
	index++;
	while (proof[ptr] !== 0 && index !== 0) {
		ptr++;
		index--;
	}
	return ptr;
};

export interface HotRotateOItem extends ItemIdFactory<TokenIdFactoryBase> {
	activeIndex: number;
	tokenId: ItemId;
	position: number;
	feature: number;
	hexId: number;
	desiredIndex?: number;
	duplicates: number;
	supplemental: boolean;
}

export type HotRotateOItemList = {
	active: HotRotateOItem[];
	hidden: HotRotateOItem[];
	duplicates: HotRotateOItem[];
	byItem: FixedLengthArray<HotRotateOItem[], 8>;
};

const HotRotateOController = () => {
	const openEditScreen = client.editscreen.useOpenEditScreen();
	const closeEditScreen = client.editscreen.useCloseEditScreen();

	const tokenId = useMatch(`/edit/:id`);

	const navigate = useNavigate();

	React.useEffect(() => {
		if (tokenId && tokenId.params.id && tokenId.params.id.isNuggId())
			openEditScreen(tokenId.params.id);
		return () => {
			closeEditScreen();
		};
	}, [tokenId, openEditScreen, closeEditScreen, navigate]);

	return <HotRotateO />;
};

const RenderItemDesktop: FC<
	GodListRenderItemProps<
		(HotRotateOItem | undefined)[],
		undefined,
		HotRotateOItemList['byItem'][number][number]
	>
> = ({ item, action, index: feature }) => {
	const id = React.useId();
	const [first, ...list] = React.useMemo(() => item ?? [], [item]);
	return (
		<div>
			<RenderItemMedium
				item={first}
				action={action}
				index={0}
				key={`${id}-${0}`}
				id={feature}
			/>
			<div
				style={{
					overflowY: 'scroll',
					overflowX: 'hidden',
					height: '200px',
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'flex-start',
				}}
			>
				{(list ?? []).map((x, index) => (
					<RenderItemMedium
						item={x}
						action={action}
						index={index + 1}
						key={`${id}-${index + 1}`}
					/>
				))}
			</div>
		</div>
	);
};

const RenderItemMobileTiny2: FC<
	GodListRenderItemProps<
		(HotRotateOItem | undefined)[],
		undefined,
		HotRotateOItemList['byItem'][number][number]
	>
> = ({ item, action, index: feature }) => {
	const id = React.useId();

	const [first, ...list] = React.useMemo(() => item ?? [], [item]);
	return (
		<div>
			<RenderItemMobileTiny
				item={first}
				action={action}
				index={0}
				key={`${id}-${0}`}
				id={feature}
			/>
			{(list ?? []).map((x, index) => (
				<RenderItemMobileTiny
					item={x}
					action={action}
					index={index + 1}
					key={`${id}-${index + 1}`}
				/>
			))}
		</div>
	);
};

const RenderItemMobileTiny: FC<
	GodListRenderItemProps<HotRotateOItem, undefined, HotRotateOItem>
> = ({ item, action, index, id }) => {
	return (
		<div
			className="mobile-pressable-div"
			role="button"
			aria-hidden="true"
			onClick={() => action && action(item)}
			style={{
				borderRadius: lib.layout.borderRadius.largish,
				overflowY: 'visible',
				width: '80px',
				height: '100%',
			}}
		>
			<div
				style={{
					borderRadius: lib.layout.borderRadius.medium,
					transition: '.2s background ease',
					position: 'relative',
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					padding: 10,
				}}
			>
				{index === 0 && (
					<div
						style={{
							position: 'absolute',
							display: 'flex',
							justifyContent: 'center',
							alignItems: 'center',
							flexDirection: 'column',
						}}
					>
						<Text textStyle={{ color: 'black' }} size="medium">
							{!isUndefined(id) && FEATURE_NAMES[id]}
						</Text>
						<div
							style={{
								height: '45px',
								width: '45px',
								margin: '18px',
								marginTop: '5px',
								borderRadius: lib.layout.borderRadius.mediumish,
								background: lib.colors.transparentWhite,
							}}
						/>
					</div>
				)}
				{item === undefined ? (
					<div
						style={{
							height: '60px',
							width: '60px',
							padding: '3px',
							marginTop: '15px',
						}}
					/>
				) : (
					<TokenViewer
						// forceCache
						tokenId={item?.tokenId}
						style={{ width: '60px', height: '60px', padding: '3px', marginTop: '15px' }}
						disableOnClick
					/>
				)}
				{/* {item === undefined && index === 0 ? (
					<div
						style={{
							height: '45px',
							width: '45px',
							borderRadius: lib.layout.borderRadius.mediumish,
							background: lib.colors.transparentWhite,
						}}
					/>
				) : (
					<TokenViewer
						// forceCache
						tokenId={item?.tokenId}
						style={{ width: '60px', height: '60px', padding: '3px' }}
						disableOnClick
					/>
				)} */}

				{item?.feature !== 0 &&
					item &&
					(index !== 0 ? (
						<IoArrowUpCircle
							color={lib.colors.transparentGreen}
							style={{
								position: 'absolute',
								top: 20,
								right: 10,
								zIndex: 2,
								WebkitBackdropFilter: 'blur(20px)',
								borderRadius: '100px',
							}}
						/>
					) : (
						<IoArrowDownCircle
							color={lib.colors.transparentRed}
							style={{
								position: 'absolute',
								top: 20,
								right: 10,
								zIndex: 2,
								WebkitBackdropFilter: 'blur(20px)',
								borderRadius: '100px',
							}}
						/>
					))}
			</div>
		</div>
	);
};
const RenderItemMedium: FC<GodListRenderItemProps<HotRotateOItem, undefined, HotRotateOItem>> = ({
	item,
	action,
	id,
	index,
}) => {
	return (
		<div
			className={item === undefined ? '' : 'mobile-pressable-div'}
			role="button"
			aria-hidden="true"
			onClick={() => action && action(item)}
			style={{
				borderRadius: lib.layout.borderRadius.largish,
				overflowY: 'visible',
				// width: '80px',
				height: '100%',
			}}
		>
			<div
				style={{
					borderRadius: lib.layout.borderRadius.medium,
					transition: '.2s background ease',
					position: 'relative',
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					padding: 10,
				}}
			>
				{index === 0 && (
					<div
						style={{
							position: 'absolute',
							display: 'flex',
							justifyContent: 'center',
							alignItems: 'center',
							flexDirection: 'column',
						}}
					>
						<Text textStyle={{ color: 'black' }} size="large">
							{!isUndefined(id) && FEATURE_NAMES[id]}
						</Text>
						<div
							style={{
								height: '80px',
								width: '80px',
								borderRadius: lib.layout.borderRadius.medium,
								background: lib.colors.transparentWhite,
								margin: '30px',
								marginTop: '5px',
							}}
						/>
					</div>
				)}
				{item === undefined ? (
					<div
						style={{
							width: '100px',
							height: '100px',
							padding: '10px',
							marginTop: '15px',
							// borderRadius: lib.layout.borderRadius.medium,
							// background: lib.colors.transparentWhite,
							// position: 'absolute',
						}}
					/>
				) : (
					<TokenViewer
						// forceCache
						tokenId={item?.tokenId}
						style={{
							width: '100px',
							height: '100px',
							padding: '10px',
							marginTop: '15px',
						}}
						disableOnClick
					/>
				)}

				{item?.feature !== 0 &&
					item &&
					(index !== 0 ? (
						<IoArrowUpCircle
							color={lib.colors.transparentGreen}
							style={{
								position: 'absolute',
								top: 5,
								right: 5,
								zIndex: 2,
								background: lib.colors.transparentWhite,
								// WebkitBackdropFilter: 'blur(20px)',
								borderRadius: '100px',
							}}
							size={30}
						/>
					) : (
						<IoArrowDownCircle
							color={lib.colors.transparentRed}
							style={{
								position: 'absolute',
								top: 5,
								right: 5,
								zIndex: 2,
								background: lib.colors.transparentWhite,
								// WebkitBackdropFilter: 'blur(20px)',
								borderRadius: '100px',
							}}
							size={30}
						/>
					))}
			</div>
		</div>
	);
};

export const useHotRotateO = (tokenId?: NuggId, overrideOwner = true, forceMobileList = false) => {
	const provider = web3.hook.useNetworkProvider();
	const dotnugg = useDotnuggV1(provider);
	const address = web3.hook.usePriorityAccount();
	const epoch = client.epoch.active.useId();

	const nuggft = useNuggftV1(provider);
	const xnuggft = useXNuggftV1(provider);

	const [needsToClaim, setNeedsToClaim] = React.useState<boolean>();
	const [cannotProveOwnership, setCannotProveOwnership] = React.useState<boolean>();
	const [saving, setSaving] = useState(false);
	const [savedToChain, setSavedToChain] = useState(false);

	const myNugg = client.user.useNugg(tokenId);

	const supplementalItems = React.useMemo(() => {
		if (overrideOwner || !myNugg || epoch === null) return undefined;
		return myNugg.unclaimedOffers.filter(
			(y) => y.itemId && y.endingEpoch !== null && y.leader && y.endingEpoch < epoch,
		);
	}, [epoch, myNugg, overrideOwner]);

	const [items, setItems, og] = useAsyncSetState(() => {
		if (tokenId && provider && epoch) {
			const fmtTokenId = BigNumber.from(tokenId.toRawId());
			console.warn('hi there - floop just got called for tokenId ', tokenId);
			const floopCheck = async () => {
				return xnuggft.floop(fmtTokenId).then((x) => {
					const res = x.reduce(
						(prev: Omit<HotRotateOItemList, 'byItem'>, curr, activeIndex) => {
							const parsed = parseItmeIdToNum(curr);
							if (curr === 0) return prev;
							if (
								activeIndex < 8 &&
								!prev.active.find((z) => z.feature === parsed.feature)
							) {
								prev.active.push(
									buildTokenIdFactory({
										supplemental: false,

										duplicates: 1,
										activeIndex,
										hexId: curr,
										tokenId: curr.toItemId(),
										...parsed,
									}),
								);
							} else if (
								!prev.active.find(
									(z) =>
										z.feature === parsed.feature &&
										z.position === parsed.position,
								) &&
								!prev.hidden.find(
									(z) =>
										z.feature === parsed.feature &&
										z.position === parsed.position,
								)
							) {
								prev.hidden.push(
									buildTokenIdFactory({
										supplemental: false,
										activeIndex,
										hexId: curr,
										duplicates: 1,
										tokenId: curr.toItemId(),
										...parsed,
									}),
								);
							} else {
								prev.active.forEach((z) => {
									if (
										z.feature === parsed.feature &&
										z.position === parsed.position
									)
										z.duplicates++;
								});
								prev.hidden.forEach((z) => {
									if (
										z.feature === parsed.feature &&
										z.position === parsed.position
									)
										z.duplicates++;
								});
								prev.duplicates.push(
									buildTokenIdFactory({
										supplemental: false,

										duplicates: 0,
										activeIndex,
										hexId: curr,
										tokenId: curr.toItemId(),
										...parsed,
									}),
								);
							}
							return prev;
						},
						{ active: [], hidden: [], duplicates: [] },
					);

					const trueRes = {
						...res,
						hidden: [
							...res.hidden,
							...((supplementalItems
								? supplementalItems.map((y, i) =>
										y.itemId
											? (buildTokenIdFactory({
													supplemental: false,
													activeIndex: mockFloopOpenSlot(x, i),
													hexId: y.itemId?.toRawIdNum(),
													duplicates: 1,
													tokenId: y.itemId,
													...parseItmeIdToNum(y.itemId.toRawId()),
											  }) as HotRotateOItem)
											: undefined,
								  )
								: []
							).filter((y) => y) as HotRotateOItem[]),
						],
					};

					return {
						...trueRes,

						byItem: [...trueRes.active, ...trueRes.hidden].reduce(
							(prev, curr) => {
								prev[curr.feature].push(curr);
								return prev;
							},
							[[], [], [], [], [], [], [], []] as HotRotateOItemList['byItem'],
						),
					};
				});
			};

			if (overrideOwner) {
				return floopCheck();
			}

			if (!address) {
				setCannotProveOwnership(true);
				return undefined;
			}

			return nuggft.ownerOf(fmtTokenId).then(async (y) => {
				setNeedsToClaim(false);
				setCannotProveOwnership(false);
				await nuggft.agency(fmtTokenId).then(async (agency) => {
					await nuggft.offers(fmtTokenId, address).then((offer) => {
						if (
							agency._hex === offer._hex ||
							(offer.isZero() &&
								agency.mask(160).eq(address) &&
								agency.shr(230).mask(24).lt(epoch))
						) {
							setNeedsToClaim(true);
						}
						setCannotProveOwnership(true);
					});
				});
				if (y.toLowerCase() === address.toLowerCase()) {
					setCannotProveOwnership(false);
				}
				return floopCheck();
			});
		}
		return undefined;
	}, [tokenId, nuggft, provider, address, epoch, overrideOwner, supplementalItems, xnuggft]);

	const [screen] = useDimensions();

	const [svg, , , loading] = useAsyncSetState(() => {
		const arr: BigNumberish[] = new Array<BigNumberish>(8);

		if (provider) {
			if (items && items.active) {
				for (let i = 0; i < 8; i++) {
					arr[i] = BigNumber.from(
						items.active.find((x) => x.feature === i)?.hexId ?? 0,
					).mod(1000);
				}
				return dotnugg['exec(uint8[8],bool)'](
					arr as Parameters<typeof dotnugg['exec(uint8[8],bool)']>[0],
					true,
				) as Promise<Base64EncodedSvg>;
			}
		}

		return undefined;
	}, [items, dotnugg, provider]);

	const caller = React.useCallback(
		(item: HotRotateOItem | undefined) => {
			if (items && item && item.feature !== 0) {
				if (items.active.findIndex((x) => item.tokenId === x.tokenId) === -1) {
					// if they are not active --- add
					setItems({
						...items,

						active: [
							...items.active.filter((x) => x.feature !== item.feature),
							item,
						].sort((a, b) => a.feature - b.feature),
						hidden: [
							...items.hidden.filter((x) => x.tokenId !== item.tokenId),
							...items.active.filter((x) => x.feature === item.feature),
						].sort((a, b) => a.feature - b.feature),
					});
				} else {
					setItems({
						...items,
						active: [...items.active.filter((x) => x.feature !== item.feature)].sort(
							(a, b) => a.feature - b.feature,
						),
						hidden: [item, ...items.hidden].sort((a, b) => a.feature - b.feature),
					});
				}
			}
		},
		[items, setItems],
	);

	const sortedList = React.useMemo(() => {
		if (items) {
			return items.byItem.reduce(
				(prev, curr, index) => {
					prev[index].push(undefined);

					curr.forEach((b) => {
						if (items.active.findIndex((x) => b.tokenId === x.tokenId) !== -1) {
							prev[index][0] = b;
						} else {
							prev[index].push(b);
						}
					});

					return prev;
				},
				[[], [], [], [], [], [], [], []] as Array<Array<HotRotateOItem | undefined>>,
			);
		}
		return [];
	}, [items]);

	const MobileList = React.useMemo(() => {
		return screen === 'phone' || forceMobileList ? (
			<div
				style={{
					marginTop: 20,
					width: '100%',
					display: 'flex',
					alignItems: 'flex-start',
					overflow: 'scroll',
					height: 200,
				}}
			>
				{(!sortedList || sortedList.length === 0) && (
					<div
						style={{
							width: '100%',
							height: 200,
							display: 'flex',
							justifyContent: 'center',
						}}
					>
						<Loader style={{ color: lib.colors.primaryColor }} />{' '}
					</div>
				)}
				{(sortedList ?? [[], [], [], [], [], [], [], []]).map((x, index) => (
					<RenderItemMobileTiny2
						item={x}
						action={caller}
						index={index}
						key={`sorted-list-${index}`}
					/>
				))}
			</div>
		) : null;
	}, [sortedList, caller, screen, forceMobileList]);
	const DesktopList2 = React.useMemo(() => {
		return (
			<div
				style={{
					marginTop: 20,
					width: '100%',
					display: 'flex',
					alignItems: 'flex-start',
					overflowX: 'scroll',
					overflowY: 'hidden',
					// overflow: 'scroll',
					// height: 200,
				}}
			>
				{(!sortedList || sortedList.length === 0) && (
					<div
						style={{
							width: '100%',
							height: 200,
							display: 'flex',
							justifyContent: 'center',
						}}
					>
						<Loader style={{ color: lib.colors.primaryColor }} />{' '}
					</div>
				)}
				{(sortedList ?? [[], [], [], [], [], [], [], []]).map((x, index) => (
					<RenderItemDesktop
						item={x}
						action={caller}
						index={index}
						key={`sorted-list-${index}`}
					/>
				))}
			</div>
		);
	}, [sortedList, caller]);

	// const DesktopList = React.useMemo(() => {
	// 	return screen !== 'phone' && !forceMobileList ? (
	// 		<>
	// 			<div
	// 				style={{
	// 					width: '100%',
	// 					display: 'flex',
	// 					flexDirection: 'column',
	// 					justifyContent: 'space-between',
	// 					position: 'relative',
	// 				}}
	// 			>
	// 				<div style={styles[`${'horizontal'}ListContainer`]}>
	// 					<SimpleList
	// 						data={items?.active || []}
	// 						label={t`Displayed`}
	// 						labelStyle={globalStyles.textBlack}
	// 						action={caller}
	// 						extraData={{
	// 							type: 'displayed' as const,
	// 						}}
	// 						RenderItem={RenderItem}
	// 						horizontal
	// 						style={styles.list}
	// 					/>
	// 				</div>
	// 				<div style={styles[`${'horizontal'}ListContainer`]}>
	// 					<SimpleList
	// 						data={items?.hidden || []}
	// 						label={t`In storage`}
	// 						listEmptyText={t`All items are displayed`}
	// 						listEmptyStyle={globalStyles.centered}
	// 						labelStyle={globalStyles.textBlack}
	// 						extraData={{ type: 'storage' as const }}
	// 						RenderItem={RenderItem}
	// 						horizontal
	// 						action={caller}
	// 						style={styles.list}
	// 					/>
	// 				</div>
	// 			</div>
	// 		</>
	// 	) : null;
	// }, [caller, items?.active, screen, items?.hidden]);

	return [
		screen,
		items,
		setItems,
		needsToClaim,
		savedToChain,
		cannotProveOwnership,
		setSavedToChain,
		saving,
		setSaving,
		loading,
		svg,
		caller,
		sortedList,
		MobileList,
		DesktopList2,
		og,
		supplementalItems,
	] as const;
};

export const useHotRotateOTransaction = (tokenId?: NuggId) => {
	const inject = useDotnuggInjectToCache();
	const provider = web3.hook.usePriorityProvider();
	const address = web3.hook.usePriorityAccount();

	const nuggft = useNuggftV1(provider);

	const [
		screen,
		items,
		setItems,
		needsToClaim,
		savedToChain,
		cannotProveOwnership,
		setSavedToChain,
		saving,
		setSaving,
		loading,
		svg,
		caller,
		sortedList,
		MobileList,
		DesktopList,
		og,
		supplementalItems,
	] = useHotRotateO(tokenId, false);

	const algo: Parameters<typeof nuggft.rotate> | undefined = React.useMemo(() => {
		if (items && tokenId) {
			const active = items.active.map((x, i) => ({ ...x, desiredIndex: i }));
			const hidden = items.hidden.map((x, i) => ({ ...x, desiredIndex: i + 8 }));
			const duplicates = items.duplicates.map((x, i) => ({ ...x, desiredIndex: i + 8 }));

			const current = [...active, ...hidden, ...duplicates].reduce(
				(prev: (HotRotateOItem | undefined)[], curr) => {
					prev[curr.activeIndex] = curr;
					return prev;
				},
				new Array(16).fill(undefined) as undefined[],
			);

			const moves: { from: number; to: number }[] = [];

			let check = 0;

			while (current.findIndex((x, i) => x !== undefined && x.desiredIndex !== i) !== -1) {
				if (check++ > 100) break;
				for (let i = 0; i < 16; i++) {
					let desired = current[i]?.desiredIndex;
					if (desired && desired !== i) {
						while (current[desired] !== undefined) desired++;
						current[desired] = current[i];
						current[i] = undefined;
						moves.push({ from: i, to: desired });
					}
				}
			}
			return [
				BigNumber.from(tokenId.toRawId()),
				moves.map((x) => x.from),
				moves.map((x) => x.to),
			];
		}
		return undefined;
	}, [items, tokenId]);

	// const token = client.live.token(tokenId);

	// const needToClaim = React.useMemo(() => {
	// 	return token && token.isNugg() && token.pendingClaim;
	// }, [token]);

	const populatedTransaction = React.useMemo(() => {
		if (!tokenId || !address || !algo) return undefined;
		const main = nuggft.populateTransaction['rotate(uint24,uint8[],uint8[])'](...algo);

		if (supplementalItems && supplementalItems.length > 0) {
			const check = async () => {
				return nuggft.populateTransaction.multicall(
					await Promise.all([
						nuggft.populateTransaction
							.claim(
								supplementalItems.map((x) => (x.sellingNuggId as NuggId).toRawId()),
								supplementalItems.map(() => ADDRESS_ZERO),
								supplementalItems.map(() => tokenId.toRawId()),
								supplementalItems.map((x) => (x.itemId as ItemId).toRawId()),
							)
							.then((x) => x.data || '0x0'),
						main.then((x) => x.data || '0x0'),
					]),
				);
			};

			return check();
		}

		if (needsToClaim) {
			const check = async () => {
				return nuggft.populateTransaction.multicall(
					await Promise.all([
						nuggft.populateTransaction
							.claim(
								[tokenId.toRawId()],
								[address],
								[BigNumber.from(0)],
								[BigNumber.from(0)],
							)
							.then((x) => x.data || '0x0'),
						main.then((x) => x.data || '0x0'),
					]),
				);
			};

			return check();
		}

		return main;
	}, [nuggft, address, algo, needsToClaim, tokenId]);

	const [send, [estimate, estimateError], hash, error, ,] = usePrioritySendTransaction();
	useTransactionManager2(provider, hash, undefined);

	const network = web3.hook.useNetworkProvider();

	const estimation = useMemoizedAsyncState(
		() => {
			if (populatedTransaction && network) {
				return Promise.all([estimate(populatedTransaction), network?.getGasPrice()]).then(
					(_data) => ({
						gasLimit: _data[0] || BigNumber.from(0),
						// gasPrice: new EthInt(_data[1] || 0),
						// mul: new EthInt((_data[0] || BigNumber.from(0)).mul(_data[1] || 0)),
						// amount: populatedTransaction.amount,
					}),
				);
			}

			return undefined;
		},
		[populatedTransaction, network, items?.active] as const,
		(prev, curr) => {
			return (prev[2] && prev[2].every((v, i) => curr[2] && v === curr[2][i])) ?? false;
		},
	);

	const calculating = React.useMemo(() => {
		if (estimateError) return false;
		if (populatedTransaction && estimation) {
			return false;
		}
		return true;
	}, [populatedTransaction, estimation]);

	emitter.useOn(
		emitter.events.Rotate,
		(event) => {
			if (saving) setSaving(false);
			if (event.event.args.tokenId === Number(tokenId?.toRawId())) {
				setSavedToChain(true);
				if (tokenId && svg) inject(tokenId, svg);
			}
		},
		[tokenId, svg, saving, inject],
	);

	return [
		algo,
		estimation,
		send,
		hash,
		calculating,
		populatedTransaction,
		[estimate, estimateError],
		error,
		screen,
		items,
		setItems,
		needsToClaim,
		savedToChain,
		cannotProveOwnership,
		nuggft,
		setSavedToChain,
		saving,
		setSaving,
		loading,
		svg,
		caller,
		sortedList,
		MobileList,
		DesktopList,
		og,
	] as const;
};

export const HotRotateO = ({ tokenId: overridedTokenId }: { tokenId?: NuggId }) => {
	const openEditScreen = client.editscreen.useEditScreenOpen();
	const tokenId = client.editscreen.useEditScreenTokenIdWithOverride(overridedTokenId);

	const style = useAnimateOverlay(openEditScreen || !!overridedTokenId, {
		zIndex: 998,
	});

	const [
		algo,
		,
		send,
		hash,
		,
		populatedTransaction,
		[, estimateError],
		,
		screen,
		items,
		setItems,
		,
		savedToChain,
		cannotProveOwnership,
		,
		setSavedToChain,
		saving,
		setSaving,
		loading,
		svg,
		,
		,
		,
		DesktopList,
		og,
	] = useHotRotateOTransaction(tokenId);

	const navigate = useNavigate();

	const width = React.useMemo(() => {
		if (savedToChain) {
			return '0%';
		}
		switch (screen) {
			case 'desktop':
				return '45%';
			case 'tablet':
				return '55%';
			case 'phone':
				return '100%';
			default:
				return '45%';
		}
	}, [screen, savedToChain]);

	if (cannotProveOwnership) {
		return (
			<animated.div style={{ ...styles.desktopContainer, ...style }}>
				<Label text="Canot prove ownership" />
			</animated.div>
		);
	}

	// console.log(!(algo && algo[1] && algo[1].length > 0), estimateError);

	return (
		<animated.div
			style={{
				...styles[`${screen}Container`],
				...style,
				opacity: items ? 1 : 0,
			}}
		>
			<Confetti
				numberOfPieces={50}
				run={savedToChain}
				style={{
					transition: `opacity .5s ${lib.layout.animation}`,
					opacity: savedToChain ? 1 : 0,
				}}
			/>
			{tokenId && items && (
				<>
					<div
						style={{
							...styles[`${screen}ControlContainer`],
							transition: `opacity .5s ${savedToChain ? '0s' : '.5s'} ${
								lib.layout.animation
							}, width 1s ${savedToChain ? '.5s' : '0s'} ${
								lib.layout.animation
							}, height 1s ${savedToChain ? '.5s' : '0s'} ${lib.layout.animation}`,
							opacity: savedToChain ? 0 : 1,
							pointerEvents: savedToChain ? 'none' : 'auto',
							width,
							height: 'auto',
						}}
					>
						{saving ? (
							<TransactionVisualConfirmation hash={hash} />
						) : (
							<>
								<Text
									size="larger"
									textStyle={styles.title}
								>{t`Edit Nugg ${tokenId.toRawId()}`}</Text>
								<Button
									label={t`Reset`}
									buttonStyle={{
										borderRadius: lib.layout.borderRadius.large,
										padding: '.3rem .7rem .3rem 1rem',
										position: 'absolute',
										top: '1rem',
										right: '1rem',
									}}
									textStyle={{ paddingRight: '.3rem' }}
									onClick={() => setItems(og)}
									disabled={JSON.stringify(og) === JSON.stringify(items)}
									rightIcon={<IoReload />}
								/>
								{DesktopList}
							</>
						)}
						<div style={styles.buttonsContainer}>
							<Button
								buttonStyle={styles.button}
								textStyle={{ color: lib.colors.nuggRedText }}
								label={t`Cancel`}
								onClick={() => {
									navigate(-1);
									setSaving(false);
								}}
							/>

							{!saving && (
								<FeedbackButton
									feedbackText={t`Check Wallet`}
									buttonStyle={styles.button}
									textStyle={{ color: lib.colors.nuggBlueText }}
									disabled={
										!(algo && algo[1] && algo[1].length > 0) || !!estimateError
									}
									label={t`Save`}
									onClick={() => {
										if (populatedTransaction) {
											setSaving(true);
											void send(populatedTransaction);
										}
									}}
								/>
							)}
						</div>
					</div>
					<div
						style={
							screen === 'phone'
								? {
										height: '40%',
										width: '100%',
										display: 'flex',
										justifyContent: 'center',
										alignItems: 'center',
										flexDirection: 'column',
								  }
								: {}
						}
					>
						<div style={styles[`${screen}TokenContainer`]}>
							<div style={{ ...styles.loadingIndicator, opacity: loading ? 1 : 0 }}>
								<Text
									textStyle={{
										color: lib.colors.textColor,
										paddingRight: '.3rem',
									}}
								>{t`Loading`}</Text>
								<Loader color={lib.colors.textColor} />
							</div>
							<TokenViewer
								tokenId={tokenId}
								svgNotFromGraph={svg}
								showcase
								style={styles[`${screen}Token`]}
							/>
							<div
								style={{
									display: 'flex',
									justifyContent: 'center',
									alignItems: 'center',
									position: 'relative',
									borderRadius: lib.layout.borderRadius.large,
									padding: '.4rem 1rem .8rem',
									textAlign: 'center',
									verticalAlign: 'center',
									marginBottom: '.4rem',
									backgroundColor: 'transparent',
								}}
							>
								<img
									alt="ethereum logo"
									src={eth}
									height={30}
									style={{
										objectFit: 'cover',
									}}
								/>

								<span
									style={{
										marginLeft: 10,
										fontSize: '18px',
										color: lib.colors.transparentPrimaryColor,
										...lib.layout.presets.font.main.semibold,
									}}
								>
									{t`generated on ethereum`}
								</span>
							</div>
						</div>
						<div
							style={{
								width: '100%',
								opacity: savedToChain ? 1 : 0,
								pointerEvents: savedToChain ? 'auto' : 'none',
								position: savedToChain ? 'relative' : 'absolute',
								transition: `opacity .5s ${lib.layout.animation}, display .5s ${lib.layout.animation}`,
							}}
						>
							<Text
								size="larger"
								textStyle={styles.title}
							>{t`Nugg ${tokenId.toRawId()} saved!`}</Text>
							<div style={styles.buttonsContainer}>
								<Button
									buttonStyle={styles.button}
									textStyle={{ color: lib.colors.nuggRedText }}
									label={t`Exit`}
									onClick={() => {
										navigate(-1);
									}}
								/>

								<Button
									buttonStyle={styles.button}
									textStyle={{ color: lib.colors.nuggBlueText }}
									label={t`Edit again`}
									onClick={() => {
										setSavedToChain(false);
										setSaving(false);
									}}
								/>
							</div>
						</div>
					</div>
				</>
			)}
		</animated.div>
	);
};

export default HotRotateOController;
