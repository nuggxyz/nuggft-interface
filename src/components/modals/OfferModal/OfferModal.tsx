import React, { FC, useMemo, useState } from 'react';
import { t } from '@lingui/macro';
import { BigNumber } from '@ethersproject/bignumber/lib/bignumber';

import { useMemoizedAsyncState } from '@src/hooks/useAsyncState';
import { DualCurrencyInput } from '@src/components/general/TextInputs/CurrencyInput/CurrencyInput';
import Text from '@src/components/general/Texts/Text/Text';
import TokenViewer from '@src/components/nugg/TokenViewer';
import FeedbackButton from '@src/components/general/Buttons/FeedbackButton/FeedbackButton';
import AnimatedCard from '@src/components/general/Cards/AnimatedCard/AnimatedCard';
import lib, { isUndefinedOrNullOrBooleanFalse, isUndefinedOrNullOrObjectEmpty } from '@src/lib';
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
import IncrementButton from '@src/components/modals/IncrementButton';
import CurrencyToggler from '@src/components/general/Buttons/CurrencyToggler/CurrencyToggler';
import { useUsdPair, useUsdPairWithCalculation } from '@src/client/usd';
import Loader from '@src/components/general/Loader/Loader';
import GodListHorizontal from '@src/components/general/List/GodListHorizontal';
import { GodListRenderItemProps } from '@src/components/general/List/GodList';
import CurrencyText from '@src/components/general/Texts/CurrencyText/CurrencyText';
import Button from '@src/components/general/Buttons/Button/Button';

import styles from './OfferModal.styles';

type FormatedMyNuggsData = MyNuggsData & { lastBid: EthInt | 'unable-to-bid' };

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

	const [send, [estimate, estimateError], hash, , ,] = usePrioritySendTransaction();

	useTransactionManager2(provider, hash, closeModal);

	const [lastPressed, setLastPressed] = React.useState<string | undefined>('5');
	const [selectedNuggForItem, setSelectedNugg] = useState<NuggId | undefined>(
		data?.nuggToBuyFor ?? undefined,
	);
	const [amount, setAmount] = useState('0');
	const pref = client.usd.useCurrencyPreferrence();
	const msp = client.stake.useMsp();
	const blocknum = client.block.useBlock();
	const [currencyPref, setCurrencyPref] = useState<'ETH' | 'USD'>(pref);

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
		(amt: string, _lastPressed?: string) => {
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
				if (selectedNuggForItem) {
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
	}, [nuggft, paymentUsd, address, data, msp, check, amountUsd, selectedNuggForItem]);

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
		[populatedTransaction, network, epoch] as const,
		(prev, curr) => {
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
	}, [populatedTransaction, estimation, amount, estimateError, selectedNuggForItem, data]);

	const [valueIsSet, setValue] = React.useReducer(() => true, false);

	React.useEffect(() => {
		if (
			check &&
			check.nextUserOffer &&
			(amount === '0' || lastPressed === undefined) &&
			!valueIsSet
		) {
			wrappedSetAmount(
				new EthInt(check.nextUserOffer).increaseToFixedStringRoundingUp(BigInt(5), 5),
				'5',
			);
			setValue();
		}
	}, [amount, check, valueIsSet]);

	const [showNotice, setShowNotice] = useState(false);

	return (
		<>
			<div
				style={{
					...styles.container,
					...(showNotice && globalStyles.hidden),
					transition: `all .3s ${lib.layout.animation}`,
				}}
			>
				<div style={{ marginBottom: '.5rem', textAlign: 'center' }}>
					<Text textStyle={{ color: lib.colors.textColor }}>
						{`${
							check &&
							check.currentUserOffer &&
							check.currentUserOffer.toString() !== '0'
								? t`Change offer for`
								: t`Offer on`
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
						<i>{t`On sale by ${data.nuggToBuyFrom?.toPrettyId()}`}</i>
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

				{/* {calculating ? (
					<Loader style={{ color: lib.colors.primaryColor }} />
				) : estimateError ? (
					<Label
						size="small"
						containerStyles={{ background: lib.colors.red }}
						textStyle={{ color: 'white' }}
						text={lib.errors.prettify('offer-modal', estimateError)}
					/>
				) : null} */}

				{data.isItem() && !data.nuggToBuyFor && (
					<GodListHorizontal
						itemHeight={135}
						data={myNuggs}
						label={t`Pick a nugg to offer on this item`}
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
				<div style={styles.inputContainer}>
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
							margin: '.7rem 0rem',
							width: '100%',
							...globalStyles.centeredSpaceBetween,
						}}
					>
						<IncrementButton
							increment={BigInt(5)}
							{...{
								lastPressed,
								wrappedSetAmount,
								amount: check?.nextUserOffer,
							}}
						/>
						<IncrementButton
							increment={BigInt(10)}
							{...{
								lastPressed,
								wrappedSetAmount,
								amount: check?.nextUserOffer,
							}}
						/>
						<IncrementButton
							increment={BigInt(15)}
							{...{
								lastPressed,
								wrappedSetAmount,
								amount: check?.nextUserOffer,
							}}
						/>
						<IncrementButton
							increment={BigInt(20)}
							{...{
								lastPressed,
								wrappedSetAmount,
								amount: check?.nextUserOffer,
							}}
						/>
						<IncrementButton
							increment={BigInt(25)}
							{...{
								lastPressed,
								wrappedSetAmount,
								amount: check?.nextUserOffer,
							}}
						/>
						<IncrementButton
							increment={BigInt(30)}
							{...{
								lastPressed,
								wrappedSetAmount,
								amount: check?.nextUserOffer,
							}}
						/>
						<IncrementButton
							increment={BigInt(35)}
							{...{
								lastPressed,
								wrappedSetAmount,
								amount: check?.nextUserOffer,
							}}
						/>
					</div>
				</div>
				<div
					style={{
						width: '100%',
						height: '1rem',
						marginBottom: '.5rem',
						// display: userBalance ? 'auto' : 'none',
					}}
				>
					<Text type="text" textStyle={styles.text}>
						{t`You currently have ${userBalance?.decimal
							.toNumber()
							.toPrecision(5)} ETH`}
					</Text>
				</div>
				<div style={styles.subContainer}>
					<FeedbackButton
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
									: t`Update offer`
								: t`Place offer`
						}`}
						onClick={() => {
							if (populatedTransaction) {
								if (
									data.isItem() &&
									!isUndefinedOrNullOrBooleanFalse(check?.mustOfferOnSeller)
								) {
									setShowNotice(true);
								} else {
									void send(populatedTransaction.tx);
								}
							}
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
			</div>

			<div
				style={{
					...styles.container,
					...(!showNotice && globalStyles.hidden),
					position: 'absolute',
					padding: '1rem',
					justifyContent: 'space-between',
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
						label={t`nah`}
						buttonStyle={{
							...styles.button,
							background: lib.colors.white,
							color: lib.colors.textColor,
							width: '40%',
						}}
					/>
					<FeedbackButton
						overrideFeedback
						disabled={
							calculating ||
							!!estimateError ||
							(!selectedNuggForItem && data.isItem())
						}
						feedbackText={t`Check Wallet...`}
						buttonStyle={{ ...styles.button, width: '40%' }}
						label={t`i got it`}
						onClick={() => {
							if (populatedTransaction) {
								void send(populatedTransaction.tx);
							}
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
