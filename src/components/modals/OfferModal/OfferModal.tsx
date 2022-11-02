import React, { FC, useMemo, useState } from 'react';
import { t } from '@lingui/macro';
import { BigNumber } from '@ethersproject/bignumber/lib/bignumber';
import { animated } from '@react-spring/web';
import { IoIosArrowDropleftCircle } from 'react-icons/io';

import { useMemoizedAsyncState } from '@src/hooks/useAsyncState';
import { DualCurrencyInput } from '@src/components/general/TextInputs/CurrencyInput/CurrencyInput';
import Text from '@src/components/general/Texts/Text/Text';
import TokenViewer from '@src/components/nugg/TokenViewer';
import FeedbackButton from '@src/components/general/Buttons/FeedbackButton/FeedbackButton';
import AnimatedCard from '@src/components/general/Cards/AnimatedCard/AnimatedCard';
import lib, {
	isUndefinedOrNull,
	isUndefinedOrNullOrBooleanFalse,
	isUndefinedOrNullOrObjectEmpty,
} from '@src/lib';
import web3 from '@src/web3';
import client from '@src/client';
import { MyNuggsData } from '@src/client/interfaces';
import Label from '@src/components/general/Label/Label';
import { EthInt } from '@src/classes/Fraction';
import { OfferModalData } from '@src/interfaces/modals';
import useDimensions from '@src/client/hooks/useDimensions';
import {
	useNuggftV1,
	usePrioritySendTransaction,
	useTransactionManager2,
} from '@src/contracts/useContract';
import globalStyles from '@src/lib/globalStyles';
import CurrencyToggler from '@src/components/general/Buttons/CurrencyToggler/CurrencyToggler';
import { useUsdPair, useUsdPairWithCalculation } from '@src/client/usd';
import Loader from '@src/components/general/Loader/Loader';
import GodListHorizontal from '@src/components/general/List/GodListHorizontal';
import { GodListRenderItemProps } from '@src/components/general/List/GodList';
import CurrencyText from '@src/components/general/Texts/CurrencyText/CurrencyText';
import Button from '@src/components/general/Buttons/Button/Button';
import { calculateIncrementWithRemaining, gotoEtherscan } from '@src/web3/config';
import { Butter } from '@src/components/mobile/OfferModalMobile';
import packages from '@src/packages';
import PeerButtonMobile from '@src/components/mobile/PeerButtonMobile';

import styles from './OfferModal.styles';

type FormatedMyNuggsData = MyNuggsData & { lastBid: EthInt | 'unable-to-bid' };

const incrementers = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 75, 99] as const;

const OfferModal = ({ data }: { data: OfferModalData }) => {
	const address = web3.hook.usePriorityAccount();
	const network = web3.hook.useNetworkProvider();
	const provider = web3.hook.useNetworkProvider();
	const chainId = web3.hook.usePriorityChainId();

	const epoch = client.epoch.active.useId();
	const [..._myNuggs] = client.user.useNuggs();
	const userBalance = web3.hook.usePriorityBalance(provider);

	const nuggft = useNuggftV1(provider);
	const closeModal = client.modal.useCloseModal();

	const [send, [estimate, estimateError], hash, error] = usePrioritySendTransaction();
	const addToast = client.toast.useAddToast();

	const transaction = useTransactionManager2(provider, hash, closeModal);

	const [lastPressed, setLastPressed] = React.useState<string | undefined | null>(null);
	const [selectedNuggForItem, setSelectedNugg] = useState<NuggId | undefined>(
		data?.nuggToBuyFor ?? undefined,
	);
	const [amount, setAmount] = useState('0');
	const pref = client.usd.useCurrencyPreferrence();
	const msp = client.stake.useMsp();
	const blocknum = client.block.useBlock();
	const [currencyPref, setCurrencyPref] = useState<'ETH' | 'USD'>(pref);
	const v2 = client.v2.useSwap(data.tokenId);

	const increments = React.useMemo(() => {
		const [inc] = calculateIncrementWithRemaining(
			data.endingEpoch,
			blocknum,
			!v2 || v2?.numOffers === 0,
		);

		// const inc = check?.increment ? (check.increment.toNumber() - 10000) / 100 : 5;
		return [BigInt(inc), ...incrementers.filter((x) => x > inc).map((x) => BigInt(x))];
	}, [data.endingEpoch, blocknum, v2, selectedNuggForItem]);

	const myNuggs = useMemo(() => {
		const nuggId = data.nuggToBuyFrom;

		return [..._myNuggs].map((x) => {
			const filt = x.unclaimedOffers.filter((y) => {
				return y.itemId === data.tokenId;
			});

			return {
				...x,
				lastBid:
					filt.length === 0
						? new EthInt(0)
						: filt[0].sellingNuggId === nuggId
						? new EthInt(filt[0]?.eth || 0)
						: ('unable-to-bid' as const),
			};
		}) as FormatedMyNuggsData[];
	}, [_myNuggs, data.tokenId, data.nuggToBuyFrom]);

	const check = useMemoizedAsyncState(
		() => {
			if (data.tokenId && address && chainId && network && msp) {
				if (data.isNugg()) {
					return nuggft['check(address,uint24)'](address, data.tokenId.toRawIdNum()).then(
						(x) => {
							return {
								canOffer: x.canOffer,
								nextUserOffer: x.next,
								currentUserOffer: x.currentUserOffer,
								increment: x.incrementBps,
								currentLeaderOffer: x.currentLeaderOffer,
								mustClaimBuyer: false,
								mustOfferOnSeller: false,
							};
						},
					);
				}

				const nuggId = selectedNuggForItem || data.nuggToBuyFor;

				if (nuggId) {
					return nuggft['check(uint24,uint24,uint16)'](
						nuggId.toRawId(),
						data.nuggToBuyFrom.toRawId(),
						data.tokenId.toRawId(),
					).then((x) => {
						return {
							canOffer: x.canOffer,
							nextUserOffer: x.next,
							currentUserOffer: x.currentUserOffer,
							currentLeaderOffer: x.currentLeaderOffer,
							increment: x.incrementBps,
							mustClaimBuyer: x.mustClaimBuyer,
							mustOfferOnSeller: x.mustOfferOnSeller,
						};
					});
				}
			}
			return undefined;
		},
		[
			address,
			chainId,
			network,
			data.nuggToBuyFor,
			data.nuggToBuyFrom,
			msp,
			blocknum,
			data.tokenId,
			selectedNuggForItem,
		] as const,
		(prev, curr, res) => {
			return res !== null && res !== undefined && prev[7] === curr[7] && prev[8] === curr[8];
		},
	);

	const amountUsd = useUsdPair(amount);
	const mspUsd = useUsdPair(msp);
	const wrappedSetAmount = React.useCallback(
		(amt: string, _lastPressed?: string | null) => {
			setAmount(amt);
			setLastPressed(_lastPressed);
		},
		[setAmount, setLastPressed],
	);

	const paymentUsd = useUsdPairWithCalculation(
		React.useMemo(
			() => [
				amount,
				check?.currentUserOffer || 0,
				check?.mustOfferOnSeller ? msp.increase(BigInt(5)) : 0,
			],
			[amount, check, msp],
		),
		React.useMemo(
			() =>
				([_amount, _check, _msp]) => {
					// was running into issue where "value" inside populatedTransaction was negative
					const copy = _amount.copy();
					if (copy.gt(0)) {
						return copy.sub(_check).add(_msp);
					}
					return new EthInt(0);
				},
			[],
		),
	);

	const populatedTransaction = React.useMemo(() => {
		const value = paymentUsd.eth.bignumber;

		if (!paymentUsd.eth.eq(0)) {
			if (data.isItem()) {
				if (selectedNuggForItem && data.nuggToBuyFrom) {
					if (check?.mustClaimBuyer || check?.mustOfferOnSeller) {
						const realmsp = msp.increase(BigInt(5));
						return {
							tx: nuggft.populateTransaction[
								'offer(uint24,uint24,uint16,uint96,uint96)'
							](
								selectedNuggForItem.toRawId(),
								data.nuggToBuyFrom.toRawId(),
								data.tokenId.toRawId(),
								check?.mustOfferOnSeller ? realmsp.bignumber : BigNumber.from(0),
								amountUsd.eth.bignumber,
								{
									value,
									from: address,
								},
							),
							amount: value,
						};
					}
					return {
						tx: nuggft.populateTransaction['offer(uint24,uint24,uint16)'](
							selectedNuggForItem.toRawId(),
							data.nuggToBuyFrom.toRawId(),
							data.tokenId.toRawId(),
							{
								value,
								from: address,
							},
						),
						amount: value,
					};
				}
			} else {
				return {
					tx: nuggft.populateTransaction['offer(uint24)'](data.tokenId.toRawId(), {
						from: address,
						value,
					}),
					amount: value,
				};
			}
		}

		return undefined;
	}, [nuggft, paymentUsd, address, data, msp, check, amountUsd, selectedNuggForItem, increments]);

	const estimation = useMemoizedAsyncState(
		() => {
			if (populatedTransaction && network) {
				return Promise.all([
					estimate(populatedTransaction.tx),
					network?.getGasPrice(),
				]).then((_data) => ({
					gasLimit: _data[0] || BigNumber.from(0),
					gasPrice: new EthInt(_data[1] || 0),
					mul: new EthInt((_data[0] || BigNumber.from(0)).mul(_data[1] || 0)),
					amount: populatedTransaction.amount,
				}));
			}

			return undefined;
		},
		[populatedTransaction, network, epoch, increments] as const,
		(prev, curr) => {
			if (
				prev[3].first() !== curr[3].first() &&
				((prev[0] && curr[0] && prev[0].amount.eq(curr[0].amount)) ?? false)
			) {
				return false;
			}
			return (
				prev[2] !== curr[2] ||
				((prev[0] && curr[0] && prev[0].amount.eq(curr[0].amount)) ?? false)
			);
		},
	);

	const calculating = React.useMemo(() => {
		if (parseFloat(amount) === 0 || Number.isNaN(parseFloat(amount))) return false;
		if (estimateError) return false;
		if (populatedTransaction && estimation) {
			if (populatedTransaction.amount.eq(estimation.amount)) return false;
		}
		if (isUndefinedOrNullOrObjectEmpty(selectedNuggForItem) && data.isItem()) {
			return false;
		}
		return true;
	}, [
		populatedTransaction,
		estimation,
		amount,
		estimateError,
		selectedNuggForItem,
		data,
		increments,
	]);

	React.useEffect(() => {
		if (check && check.nextUserOffer && amount === '0') {
			wrappedSetAmount(
				new EthInt(check.currentLeaderOffer).increaseToFixedStringRoundingUp(
					increments.first(),
					5,
				),
				`${increments.first()}`,
			);
			// setAmount(new EthInt(check.nextUserOffer).toFixedStringRoundingUp(5));
			// setLastPressed(`${increments.first()}`);
		}
	}, [amount, check, increments, selectedNuggForItem]);

	React.useEffect(() => {
		if (
			check &&
			!isUndefinedOrNull(lastPressed) &&
			increments.first() > BigInt(lastPressed) &&
			(data.tokenId.isNuggId() || selectedNuggForItem)
		) {
			wrappedSetAmount(
				new EthInt(check.currentLeaderOffer).increaseToFixedStringRoundingUp(
					increments.first(),
					5,
				),
				`${increments.first()}`,
			);
		}
	}, [increments, lastPressed, check?.nextUserOffer, selectedNuggForItem]);

	const [showNotice, setShowNotice] = useState(false);

	const minNextBid = React.useMemo(() => {
		if (!check?.nextUserOffer) return 0;
		return Number(new EthInt(check.nextUserOffer).toFixedStringRoundingUp(5));
	}, [check?.nextUserOffer]);

	const currentBid = useUsdPair(check?.currentUserOffer);
	const noBids = React.useMemo(() => {
		return v2 === undefined || v2.numOffers === 0;
	}, [epoch, v2, data.tokenId]);

	const butcaller = React.useCallback(
		(increment: bigint) => {
			// if (increment === increments[0]) {
			// 	wrappedSetAmount(minNextBid.toString(), null);
			// 	return;
			// }
			const a =
				(check?.currentLeaderOffer &&
					new EthInt(check.currentLeaderOffer).increaseToFixedStringRoundingUp(
						increment,
						5,
					)) ||
				'0';
			wrappedSetAmount(a, `${increment}`);
		},
		[check?.currentLeaderOffer, minNextBid, wrappedSetAmount],
	);

	const [shifter] = packages.spring.useSpring(
		() => ({
			to: {
				translateX: (incrementers.length - increments.length) * -80,
			},
		}),
		[increments],
	);

	const [viewing, setViewing] = React.useState(1);

	const Page1 = React.useMemo(() => {
		return (
			<>
				{data.isItem() && !data.nuggToBuyFor && (
					<GodListHorizontal
						itemHeight={135}
						data={myNuggs}
						label={t`pick one of your nuggs to offer on this item`}
						labelStyle={{
							color: lib.colors.textColor,
						}}
						extraData={undefined}
						RenderItem={MyNuggRenderItem}
						action={setSelectedNugg}
						style={{
							width: '100%',
							background: lib.colors.transparentDarkGrey2,
							height: '140px',
							padding: '0rem .4rem',
							borderRadius: lib.layout.borderRadius.medium,
							display: data.isItem() ? 'auto' : 'none',
						}}
					/>
				)}
				<div
					style={{
						...styles.inputContainer,
						...(!data.isItem() || selectedNuggForItem ? {} : globalStyles.displayNone),
					}}
				>
					<DualCurrencyInput
						warning={estimateError && lib.errors.prettify('offer-modal', estimateError)}
						shouldFocus
						style={styles.input}
						styleHeading={styles.heading}
						styleInputContainer={styles.inputCurrency}
						label={t`Enter amount`}
						setValue={wrappedSetAmount}
						value={amount}
						code
						currencyPref={currencyPref}
						className="placeholder-white"
						rightToggles={[
							<CurrencyToggler
								pref={currencyPref}
								setPref={setCurrencyPref}
								containerStyle={{ zIndex: 0 }}
							/>,
						]}
					/>
					<div
						style={{
							display: 'flex',
							width: '100%',
							justifyContent: 'flex-start',
							padding: '20px 10px',
							overflowX: 'scroll',
							overflowY: 'hidden',
						}}
					>
						<animated.div style={{ overflow: 'visible', ...shifter, display: 'flex' }}>
							<Butter
								tint={lib.colors.textColor}
								hasNoBids={noBids}
								onClick={butcaller}
								currIncrement={increments[0]}
								increment={BigInt(5)}
								toggled={
									lastPressed === BigInt(5).toString() ||
									(BigInt(5) === increments[0] && lastPressed === null)
								}
								endingEpoch={data.endingEpoch || 0}
							/>
							<Butter
								tint={lib.colors.textColor}
								hasNoBids={noBids}
								currIncrement={increments[0]}
								onClick={butcaller}
								increment={BigInt(10)}
								toggled={
									lastPressed === BigInt(10).toString() ||
									(BigInt(10) === increments[0] && lastPressed === null)
								}
								endingEpoch={data.endingEpoch || 0}
							/>
							<Butter
								tint={lib.colors.textColor}
								hasNoBids={noBids}
								currIncrement={increments[0]}
								onClick={butcaller}
								increment={BigInt(15)}
								toggled={
									lastPressed === BigInt(15).toString() ||
									(BigInt(15) === increments[0] && lastPressed === null)
								}
								endingEpoch={data.endingEpoch || 0}
							/>
							<Butter
								tint={lib.colors.textColor}
								hasNoBids={noBids}
								currIncrement={increments[0]}
								onClick={butcaller}
								increment={BigInt(20)}
								toggled={
									lastPressed === BigInt(20).toString() ||
									(BigInt(20) === increments[0] && lastPressed === null)
								}
								endingEpoch={data.endingEpoch || 0}
							/>
							<Butter
								tint={lib.colors.textColor}
								hasNoBids={noBids}
								currIncrement={increments[0]}
								onClick={butcaller}
								increment={BigInt(25)}
								toggled={
									lastPressed === BigInt(25).toString() ||
									(BigInt(25) === increments[0] && lastPressed === null)
								}
								endingEpoch={data.endingEpoch || 0}
							/>
							<Butter
								tint={lib.colors.textColor}
								hasNoBids={noBids}
								currIncrement={increments[0]}
								onClick={butcaller}
								increment={BigInt(30)}
								toggled={
									lastPressed === BigInt(30).toString() ||
									(BigInt(30) === increments[0] && lastPressed === null)
								}
								endingEpoch={data.endingEpoch || 0}
							/>
							<Butter
								tint={lib.colors.textColor}
								hasNoBids={noBids}
								currIncrement={increments[0]}
								onClick={butcaller}
								increment={BigInt(35)}
								toggled={
									lastPressed === BigInt(35).toString() ||
									(BigInt(35) === increments[0] && lastPressed === null)
								}
								endingEpoch={data.endingEpoch || 0}
							/>
							<Butter
								tint={lib.colors.textColor}
								hasNoBids={noBids}
								currIncrement={increments[0]}
								onClick={butcaller}
								increment={BigInt(40)}
								toggled={
									lastPressed === BigInt(40).toString() ||
									(BigInt(40) === increments[0] && lastPressed === null)
								}
								endingEpoch={data.endingEpoch || 0}
							/>
							<Butter
								tint={lib.colors.textColor}
								hasNoBids={noBids}
								currIncrement={increments[0]}
								onClick={butcaller}
								increment={BigInt(45)}
								toggled={
									lastPressed === BigInt(45).toString() ||
									(BigInt(45) === increments[0] && lastPressed === null)
								}
								endingEpoch={data.endingEpoch || 0}
							/>
							<Butter
								tint={lib.colors.textColor}
								hasNoBids={noBids}
								currIncrement={increments[0]}
								onClick={butcaller}
								increment={BigInt(50)}
								toggled={
									lastPressed === BigInt(50).toString() ||
									(BigInt(50) === increments[0] && lastPressed === null)
								}
								endingEpoch={data.endingEpoch || 0}
							/>
						</animated.div>
					</div>
				</div>
				<div
					style={{
						width: '100%',
						height: '1rem',
						marginBottom: '.5rem',
						// display: userBalance ? 'auto' : 'none',
						...(!data.isItem() || selectedNuggForItem ? {} : globalStyles.displayNone),
					}}
				>
					<Text
						type="text"
						textStyle={{
							...styles.text,
						}}
					>
						{t`You currently have ${userBalance?.decimal
							.toNumber()
							.toPrecision(5)} ETH`}
					</Text>
				</div>
				<div
					style={{
						...styles.subContainer,
						...(!data.isItem() || selectedNuggForItem ? {} : globalStyles.displayNone),
					}}
				>
					<FeedbackButton
						className="mobile-pressable-div-shallow"
						timeout={
							data.isItem() &&
							!isUndefinedOrNullOrBooleanFalse(check?.mustOfferOnSeller)
								? 0
								: undefined
						}
						overrideFeedback
						disabled={
							calculating ||
							!!estimateError ||
							(!selectedNuggForItem && data.isItem())
						}
						feedbackText={t`Check Wallet...`}
						buttonStyle={styles.button}
						label={`${
							data.isItem() && !selectedNuggForItem
								? t`Select a nugg`
								: check &&
								  check.currentUserOffer &&
								  check.currentUserOffer.toString() !== '0'
								? !check.canOffer
									? t`You cannot place an offer`
									: t`Review`
								: t`Review`
						}`}
						onClick={() => {
							// if (populatedTransaction) {
							if (
								data.isItem() &&
								!isUndefinedOrNullOrBooleanFalse(check?.mustOfferOnSeller)
							) {
								setShowNotice(true);
							} else {
								setViewing(2);
								// void send(populatedTransaction.tx);
							}
							// }
						}}
						rightIcon={
							calculating
								? ((
										<div style={{ position: 'absolute', right: '.7rem' }}>
											<Loader color="white" />
										</div>
								  ) as JSX.Element)
								: undefined
						}
					/>
				</div>
			</>
		);
	}, [
		amount,
		butcaller,
		calculating,
		check,
		// populatedTransaction,
		data,
		currencyPref,
		increments,
		lastPressed,
		// send,
		shifter,
		selectedNuggForItem,
		estimateError,
		noBids,
		myNuggs,
		wrappedSetAmount,
		userBalance?.decimal,
		setViewing,
	]);

	const Page2 = React.useMemo(
		() => (
			<>
				<div
					style={{
						display: 'flex',
						flexDirection: 'column',
						width: '100%',
						alignItems: 'center',
						justifyContent: 'space-around',
					}}
				>
					{currentBid.eth.number !== 0 && (
						<div
							style={{
								background: lib.colors.transparentWhite,
								borderRadius: lib.layout.borderRadius.medium,
								padding: '.5rem',
								marginTop: '1rem',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
							}}
						>
							<Text
								size="large"
								weight="bold"
								textStyle={{ paddingRight: '.5rem', color: lib.colors.textColor }}
							>
								{t`my current bid`}
							</Text>
							<CurrencyText
								unitOverride={currencyPref}
								forceEth
								size="large"
								stopAnimation
								value={currentBid}
								textStyle={{ color: lib.colors.textColor }}
							/>
						</div>
					)}

					<div
						style={{
							background: lib.colors.transparentWhite,
							borderRadius: lib.layout.borderRadius.mediumish,
							padding: '.5em',
							marginTop: '1rem',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
						}}
					>
						<Text
							size="large"
							weight="bold"
							textStyle={{ paddingRight: '.5rem', color: lib.colors.textColor }}
						>
							{t`my desired bid`}
						</Text>
						<CurrencyText
							unitOverride={currencyPref}
							forceEth
							size="large"
							stopAnimation
							value={amountUsd}
							textStyle={{ color: lib.colors.textColor }}
						/>
					</div>
					{check?.mustOfferOnSeller && (
						<div
							style={{
								background: lib.colors.transparentWhite,
								borderRadius: lib.layout.borderRadius.medium,
								padding: '.5rem',
								marginTop: '1rem',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
							}}
						>
							<Text
								size="large"
								weight="bold"
								textStyle={{ paddingRight: '.5rem', color: lib.colors.textColor }}
							>
								{t`bid on ${data.nuggToBuyFrom?.toPrettyId()}`}
							</Text>
							<CurrencyText
								unitOverride={currencyPref}
								forceEth
								size="large"
								stopAnimation
								value={mspUsd}
								textStyle={{ color: lib.colors.textColor }}
							/>
						</div>
					)}
					<div
						style={{
							background: lib.colors.transparentWhite,
							borderRadius: lib.layout.borderRadius.medium,
							padding: '.5rem',
							marginTop: '1rem',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
						}}
					>
						<Text
							size="large"
							weight="bold"
							textStyle={{ paddingRight: '.5rem', color: lib.colors.textColor }}
						>
							{t`payment`}
						</Text>
						<CurrencyText
							unitOverride={currencyPref}
							forceEth
							size="large"
							stopAnimation
							value={paymentUsd}
							textStyle={{ color: lib.colors.textColor }}
						/>
					</div>
				</div>
				<div
					style={{
						display: 'flex',
						alignItems: 'center',
						width: '100%',
						justifyContent: 'center',
						marginTop: '20px',
					}}
				>
					<PeerButtonMobile
						style={{
							width: '100%',
							alignItems: 'center',
							display: 'flex',
							justifyContent: 'center',
							background: lib.colors.textColor,
						}}
						className="mobile-pressable-div-shallow"
						text="click to finalize on"
						onClick={() => {
							if (!populatedTransaction) return;
							void send(populatedTransaction.tx, () => setViewing(3));
						}}
					/>
				</div>
			</>
		),
		[
			amountUsd,
			paymentUsd,
			send,
			populatedTransaction,
			currentBid,
			data.tokenId,
			data.nuggToBuyFrom,
			mspUsd,
			check?.mustOfferOnSeller,
			currencyPref,
			closeModal,
		],
	);

	const Page3 = React.useMemo(() => {
		return (
			<div style={{ marginTop: '1rem', width: '100%' }}>
				<div
					style={{
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						width: '100%',
					}}
				>
					<Text
						size="larger"
						textStyle={{ color: lib.colors.textColor }}
					>{t`👀 looking...`}</Text>
					<Loader color={lib.colors.textColor} style={{ marginLeft: '.5rem' }} />
				</div>
				{!transaction?.response && error && (
					<Text textStyle={{ color: lib.colors.primaryColor }}>
						Error: {error.message}
					</Text>
				)}
				<Button
					buttonStyle={{
						borderRadius: lib.layout.borderRadius.large,
						background: lib.colors.textColor,
						marginTop: '20px',
					}}
					textStyle={{
						color: lib.colors.white,
					}}
					size="large"
					onClick={() => {
						closeModal();
						addToast({
							duration: 0,
							error: true,
							title: t`Transaction not found`,
							message: t`Click to look on etherscan`,
							loading: false,
							action: (setClose) => {
								if (chainId && address) {
									gotoEtherscan(chainId, 'address', address);
								}
								if (setClose) {
									setClose(true);
								}
							},
							id: `${Math.random() * 100}`,
							index: 0,
						});
					}}
					label={t`Ok, I confirmed it`}
				/>
			</div>
		);
	}, [hash, closeModal, data.tokenId, transaction]);

	return (
		<>
			{viewing !== 1 && (
				<Button
					className="mobile-pressable-div-shallow"
					buttonStyle={{
						backgroundColor: lib.colors.transparentWhite,
						boxShadow: lib.layout.boxShadow.basic,
						color: lib.colors.textColor,
						borderRadius: lib.layout.borderRadius.large,
						marginBottom: '.4rem',
						alignItems: 'center',
						position: 'absolute',
						top: '1rem',
						left: '1rem',
					}}
					label={t`back`}
					leftIcon={
						<IoIosArrowDropleftCircle
							color={lib.colors.textColor}
							style={{ marginRight: '.3rem' }}
							size={20}
						/>
					}
					onClick={() => {
						setViewing(viewing - 1);
					}}
				/>
			)}
			<div
				style={{
					...styles.container,
					...(showNotice && globalStyles.hidden),
					// position: 'absolute',
					transition: `all .3s ${lib.layout.animation}`,
				}}
			>
				<div style={{ marginBottom: '.5rem', textAlign: 'center' }}>
					<Text textStyle={{ color: lib.colors.textColor }}>
						{`${
							noBids ? t`Offer on` : t`Update offer for`
						} ${data.tokenId.toPrettyId()}`}
					</Text>
					<Text
						textStyle={{
							color: lib.colors.textColor,
							display: data.isItem() ? 'auto' : 'none',
						}}
						type="text"
						size="smaller"
					>
						<i>{t`on sale by ${data.nuggToBuyFrom?.toPrettyId()}`}</i>
					</Text>
				</div>
				<AnimatedCard>
					<TokenViewer
						tokenId={data.tokenId}
						showcase
						disableOnClick
						style={{
							...(data.tokenId.isItemId() ? { height: '350px', width: '350px' } : {}),
						}}
					/>
				</AnimatedCard>
				{viewing === 1 ? Page1 : viewing === 2 ? Page2 : Page3}
			</div>

			<div
				style={{
					...styles.container,
					...(!showNotice && globalStyles.hidden),
					position: 'absolute',
					padding: '1rem',
					justifyContent: 'space-between',
					top: 0,
					right: 0,
					...globalStyles.fillHeight,
					transition: `all .3s ${lib.layout.animation}`,
				}}
			>
				<div
					style={{
						...styles.container,
						padding: '3rem',
						...globalStyles.fillHeight,
						justifyContent: 'space-evenly',
					}}
				>
					<Text
						size="larger"
						textStyle={{
							textAlign: 'center',
							color: lib.colors.textColor,
						}}
					>
						one sec
					</Text>
					<div style={{ width: '80%', marginTop: '2rem' }}>
						<Text
							size="medium"
							textStyle={{ marginTop: '1rem', color: lib.colors.textColor }}
						>
							<b>{data.nuggToBuyFrom?.toPrettyId()}</b>{' '}
							{t`has never been bid on, they must be bid on before they can sell`}{' '}
							<b>{data.tokenId.toPrettyId()}</b>
						</Text>

						<Text
							size="medium"
							textStyle={{ marginTop: '1rem', color: lib.colors.textColor }}
						>
							{t`if you move forward, your transaction will include both a minimum bid on`}{' '}
							<b>{data.nuggToBuyFrom?.toPrettyId()}</b>
							{t`, and your desired bid for`} <b>{data.tokenId.toPrettyId()}</b>
						</Text>
					</div>
					<div
						style={{
							textAlign: 'center',
							color: lib.colors.textColor,
							marginTop: '3rem',
						}}
					>
						<Text size="larger" textStyle={{ marginTop: 10 }}>
							{t`added cost`}
						</Text>

						<CurrencyText
							unitOverride={pref}
							// forceEth
							stopAnimation
							size="larger"
							value={mspUsd}
						/>
					</div>
				</div>
				<div
					style={{
						...globalStyles.centeredSpaceBetween,
						...globalStyles.fillWidth,
						marginBottom: '1rem',
					}}
				>
					<Button
						onClick={() => {
							closeModal();
							// setShowNotice(false);
						}}
						label={t`Nah`}
						buttonStyle={{
							...styles.button,
							background: lib.colors.white,
							color: lib.colors.textColor,
							width: '40%',
						}}
					/>
					<Button
						buttonStyle={{ ...styles.button, width: '40%' }}
						label={t`I got it`}
						onClick={() => {
							setViewing(2);
							setShowNotice(false);
							// if (populatedTransaction) {
							// 	void send(populatedTransaction.tx);
							// }
						}}
					/>
				</div>
			</div>
		</>
	);
};

const MyNuggRenderItem: FC<GodListRenderItemProps<FormatedMyNuggsData, undefined, NuggId>> = ({
	item,
	selected,
	action,
}) => {
	const disabled = React.useMemo(() => {
		if (item) {
			if (item.activeSwap) return t`currenlty for sale`;
			if (item.lastBid === 'unable-to-bid') return t`previous claim pending for this item`;
		}
		return undefined;
	}, [item]);

	const [screenType] = useDimensions();
	return (
		<div
			role="button"
			style={{
				background: selected ? lib.colors.transparentWhite : lib.colors.transparent,
				borderRadius: lib.layout.borderRadius.medium,
				transition: '.2s background ease',
				padding: '.7rem',
				cursor: 'pointer',
				width: '125px',
			}}
			aria-hidden="true"
			className="mobile-pressable-div-shallow"
			onClick={() => action && action(item?.tokenId)}
		>
			{item && (
				<TokenViewer
					tokenId={item.tokenId}
					style={
						screenType !== 'phone'
							? { width: '80px', height: '80px' }
							: { width: '60px', height: '60px' }
					}
					showLabel
					disableOnClick
				/>
			)}
			{disabled && <Label text={disabled} containerStyles={{ background: 'transparent' }} />}
		</div>
	);
};

export default OfferModal;
