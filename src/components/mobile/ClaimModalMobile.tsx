/* eslint-disable react/jsx-props-no-spreading */
import React, { startTransition } from 'react';
import { animated, config, useSpring, useTransition } from '@react-spring/web';
import { BigNumber } from '@ethersproject/bignumber/lib/bignumber';
import { IoChevronBackCircle } from 'react-icons/io5';
import { t } from '@lingui/macro';

import lib from '@src/lib';
import Text from '@src/components/general/Texts/Text/Text';
import web3 from '@src/web3';
import Button from '@src/components/general/Buttons/Button/Button';
import client from '@src/client';
import { ClaimModalData } from '@src/interfaces/modals';
import { useNuggftV1, usePrioritySendTransaction } from '@src/contracts/useContract';
import { EthInt } from '@src/classes/Fraction';
import { useUsdPair } from '@src/client/usd';
import useAsyncState from '@src/hooks/useAsyncState';
import CurrencyToggler, {
	useCurrencyTogglerState,
} from '@src/components/general/Buttons/CurrencyToggler/CurrencyToggler';
import Label from '@src/components/general/Label/Label';
import CurrencyText from '@src/components/general/Texts/CurrencyText/CurrencyText';
import Loader from '@src/components/general/Loader/Loader';
import { useMultiClaimArgs } from '@src/components/nugg/Wallet/tabs/ClaimTab/MultiClaimButton';
import TransactionVisualConfirmation from '@src/components/nugg/TransactionVisualConfirmation';

import PeerButtonMobile from './PeerButtonMobile';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ClaimModalMobile = ({ data }: { data: ClaimModalData }) => {
	const isOpen = client.modal.useOpen();
	const unclaimedOffers = client.user.useUnclaimedOffersFilteredByEpoch();
	const network = web3.hook.useNetworkProvider();
	const nuggft = useNuggftV1(network);
	const closeModal = client.modal.useCloseModal();
	const [page, setPage] = client.modal.usePhase();
	const [send, [estimate, estimateError], hash] = usePrioritySendTransaction();
	const args = useMultiClaimArgs();

	const populatedTransaction = React.useMemo(() => {
		return { amount: args[0].length, tx: nuggft.populateTransaction.claim(...args) };
	}, [nuggft, args]);

	const estimation = useAsyncState(() => {
		if (network) {
			return Promise.all([estimate(populatedTransaction.tx), network?.getGasPrice()]).then(
				(_data) => ({
					gasLimit: _data[0] || BigNumber.from(0),
					gasPrice: new EthInt(_data[1] || 0),
					mul: new EthInt((_data[0] || BigNumber.from(0)).mul(_data[1] || 0)),
					amount: args[0].length,
				}),
			);
		}

		return undefined;
	}, [populatedTransaction, network]);

	const [tabFadeTransition] = useTransition(
		page,
		{
			from: () => ({
				opacity: 0,
			}),
			expires: 500,
			enter: { opacity: 1 },
			leave: () => {
				return {
					opacity: 0,
				};
			},
			keys: (item) => `tabFadeTransition${item}5`,
			config: config.stiff,
		},
		[page, isOpen],
	);

	const containerStyle = useSpring({
		to: {
			transform: isOpen ? 'scale(1.0)' : 'scale(0.9)',
		},
		config: config.default,
	});

	const calculating = React.useMemo(() => {
		if (estimateError) return false;
		if (estimation) {
			if (populatedTransaction.amount === estimation.amount) return false;
		}
		return true;
	}, [populatedTransaction, estimation, estimateError]);

	const globalCurrencyPref = client.usd.useCurrencyPreferrence();

	const [localCurrencyPref, setLocalCurrencyPref] = useCurrencyTogglerState(globalCurrencyPref);

	const ethclaims = React.useMemo(() => {
		return unclaimedOffers.reduce((prev, curr) => {
			return prev.add(curr.leader ? 0 : curr.eth);
		}, new EthInt(0));
	}, [unclaimedOffers]);

	const ethclaimsUsd = useUsdPair(ethclaims);
	const estimatedGasUsd = useUsdPair(estimation?.mul);

	const Page1 = React.useMemo(
		() =>
			isOpen && page === 1 ? (
				<>
					{/* <StupidMfingHack /> */}

					<Text
						size="large"
						textStyle={{
							marginTop: 10,
							marginBottom: 4,
							...lib.layout.presets.font.main.thicc,
						}}
					>
						{t`new nugg claims`}
					</Text>
					<CurrencyText
						size="larger"
						stopAnimation
						showUnit={false}
						value={0}
						str={`${unclaimedOffers.filter((x) => x.isNugg() && x.leader).length}`}
					/>

					<Text
						size="large"
						textStyle={{
							marginTop: 10,
							marginBottom: 4,
							...lib.layout.presets.font.main.thicc,
						}}
					>
						{t`new item claims`}
					</Text>
					<CurrencyText
						size="larger"
						stopAnimation
						showUnit={false}
						value={0}
						str={`${unclaimedOffers.filter((x) => x.isItem() && x.leader).length}`}
					/>

					<Text
						size="large"
						textStyle={{
							marginTop: 10,
							marginBottom: 4,
							...lib.layout.presets.font.main.thicc,
						}}
					>
						{t`eth claims`}
					</Text>
					<CurrencyText
						unitOverride={localCurrencyPref}
						forceEth
						size="larger"
						stopAnimation
						value={ethclaimsUsd}
					/>

					<Text
						size="large"
						textStyle={{
							marginTop: 10,
							marginBottom: 4,
							...lib.layout.presets.font.main.thicc,
						}}
					>
						{t`estimated gas price`}
					</Text>
					<CurrencyText
						unitOverride={localCurrencyPref}
						forceEth
						size="larger"
						stopAnimation
						value={estimatedGasUsd}
					/>

					<div
						style={{
							display: 'flex',
							justifyContent: 'center',
							alignItems: 'center',
							width: '100%',
							marginTop: 20,
						}}
					>
						{calculating ? (
							<Loader style={{ color: lib.colors.primaryColor }} />
						) : estimateError ? (
							<Label
								size="medium"
								containerStyles={{
									background: lib.colors.red,
									padding: '.5rem .8rem',
								}}
								textStyle={{
									color: 'white',
									...lib.layout.presets.font.main.thicc,
								}}
								text={lib.errors.prettify('claim-modal', estimateError)}
							/>
						) : (
							<Label
								size="medium"
								containerStyles={{
									background: lib.colors.green,
									padding: '.5rem .8rem',
								}}
								textStyle={{
									color: 'white',
									...lib.layout.presets.font.main.thicc,
								}}
								text="transaction should succeed"
							/>
						)}
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
							text="tap to finalize on"
							onClick={(event) => {
								event.preventDefault();
								event.stopPropagation();
								if (!populatedTransaction) return;
								void send(populatedTransaction.tx, () => {
									setPage(2);
								});
							}}
						/>
					</div>
				</>
			) : null,
		[
			setPage,
			isOpen,
			send,
			page,
			populatedTransaction,
			estimatedGasUsd,
			ethclaimsUsd,
			unclaimedOffers,
			localCurrencyPref,
			calculating,
			estimateError,
		],
	);

	const Page2 = React.useMemo(() => {
		return isOpen ? (
			<TransactionVisualConfirmation
				hash={hash}
				onDismiss={() => {
					closeModal();
					startTransition(() => {
						setTimeout(() => {
							setPage(0);
						}, 2000);
					});
				}}
			/>
		) : null;
	}, [isOpen, closeModal, setPage, hash]);

	return (
		<>
			{tabFadeTransition((sty, pager) => {
				return (
					<animated.div
						style={{
							// position: 'relative',
							position: 'absolute',
							display: 'flex',
							justifyContent: 'center',
							width: '100%',
							margin: 20,
						}}
					>
						<animated.div
							style={{
								width: '93%',
								padding: '25px',
								position: 'relative',
								// pointerEvents: 'none',
								// ...sty,
								background: lib.colors.transparentWhite,
								transition: `.2s all ${lib.layout.animation}`,

								borderRadius: lib.layout.borderRadius.largish,
								boxShadow: lib.layout.boxShadow.basic,
								margin: '0rem',
								justifyContent: 'flex-start',
								backdropFilter: 'blur(10px)',
								WebkitBackdropFilter: 'blur(10px)',
								...containerStyle,
								...sty,
							}}
						>
							<>{pager === 0 ? Page1 : pager === 1 ? Page1 : Page2}</>{' '}
							{(pager === 1 || pager === 0) && (
								<>
									<Button
										className="mobile-pressable-div"
										size="small"
										buttonStyle={{
											position: 'absolute',
											left: 3,
											bottom: -50,
											borderRadius: lib.layout.borderRadius.mediumish,
											background: lib.colors.transparentWhite,
											WebkitBackdropFilter: 'blur(30px)',
											backdropFilter: 'blur(30px)',
											boxShadow: lib.layout.boxShadow.basic,
										}}
										leftIcon={
											<IoChevronBackCircle
												size={24}
												color={lib.colors.primaryColor}
												style={{
													marginRight: 5,
													marginLeft: -5,
												}}
											/>
										}
										textStyle={{
											color: lib.colors.primaryColor,
											fontSize: 18,
										}}
										label="go back"
										onClick={() => (pager === 0 ? closeModal() : setPage(0))}
									/>{' '}
									<CurrencyToggler
										pref={localCurrencyPref}
										setPref={setLocalCurrencyPref}
										containerStyle={{
											position: 'absolute',
											right: 3,
											bottom: -45,
										}}
										floaterStyle={{
											background: lib.colors.transparentWhite,
											boxShadow: lib.layout.boxShadow.basic,
										}}
									/>
								</>
							)}
						</animated.div>
					</animated.div>
				);
			})}
		</>
	);
};

export default ClaimModalMobile;
