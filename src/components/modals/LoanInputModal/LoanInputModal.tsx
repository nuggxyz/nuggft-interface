import React, { useEffect, useState } from 'react';
import { t } from '@lingui/macro';

import useAsyncState from '@src/hooks/useAsyncState';
import { fromEth, toEth } from '@src/lib/conversion';
import { DualCurrencyInput } from '@src/components/general/TextInputs/CurrencyInput/CurrencyInput';
import Text from '@src/components/general/Texts/Text/Text';
import TokenViewer from '@src/components/nugg/TokenViewer';
import FeedbackButton from '@src/components/general/Buttons/FeedbackButton/FeedbackButton';
import AnimatedCard from '@src/components/general/Cards/AnimatedCard/AnimatedCard';
import lib, { isUndefinedOrNullOrStringEmpty } from '@src/lib';
import web3 from '@src/web3';
import { LoanInputModalData } from '@src/interfaces/modals';
import {
	useNuggftV1,
	usePrioritySendTransaction,
	useTransactionManager2,
} from '@src/contracts/useContract';
import client from '@src/client';
import CurrencyToggler from '@src/components/general/Buttons/CurrencyToggler/CurrencyToggler';
import Loader from '@src/components/general/Loader/Loader';

import styles from './LoanInputModal.styles';

const LoanInputModal = ({ data: { tokenId, actionType } }: { data: LoanInputModalData }) => {
	const [amount, setAmount] = useState('');
	const address = web3.hook.usePriorityAccount();

	const provider = web3.hook.usePriorityProvider();
	const chainId = web3.hook.usePriorityChainId();

	const userBalance = web3.hook.usePriorityBalance(provider);
	const nuggft = useNuggftV1(provider);
	const pref = client.usd.useCurrencyPreferrence();
	const [currencyPref, setCurrencyPref] = useState<'ETH' | 'USD'>(pref);
	const closeModal = client.modal.useCloseModal();

	const [send, , hash, , ,] = usePrioritySendTransaction();

	useTransactionManager2(provider, hash, closeModal);

	const amountFromChain = useAsyncState(() => {
		if (tokenId && chainId && provider) {
			if (actionType === 'liquidate') {
				return nuggft.vfl([tokenId.toRawId()]).then((v) => {
					console.log({ v });
					return v;
				});
			}
			return nuggft.vfr([tokenId.toRawId()]).then((v) => {
				return v;
			});
		}

		return Promise.resolve([]);
	}, [address, tokenId, actionType, chainId, provider]);

	useEffect(() => {
		if (amountFromChain && amountFromChain.length > 0) {
			setAmount(
				fromEth(
					amountFromChain[0]
						.div(10 ** 13)
						.add(1)
						.mul(10 ** 13),
				),
			);
		}
	}, [amountFromChain, setAmount, actionType]);

	return (
		<div style={styles.container}>
			<Text textStyle={{ color: lib.colors.textColor, marginBottom: '.3rem' }}>{`${
				actionType === 'liquidate' ? t`Payoff` : t`Extend`
			} ${tokenId.toPrettyId()}'s loan`}</Text>
			<AnimatedCard>
				<TokenViewer tokenId={tokenId} labelColor="white" showcase />
			</AnimatedCard>
			<div style={styles.inputContainer}>
				<DualCurrencyInput
					disabled
					shouldFocus
					style={styles.input}
					styleHeading={styles.heading}
					styleInputContainer={styles.inputCurrency}
					styleLabel={{ color: lib.colors.textColor }}
					label={t`Required amount`}
					setValue={setAmount}
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
			</div>
			<div
				style={{
					width: '100%',
					height: '1rem',
					marginBottom: '.5rem',
				}}
			>
				{userBalance ? (
					<Text type="text" size="small" textStyle={styles.text} weight="bolder">
						{t`You currently have ${userBalance.decimal.toNumber().toPrecision(5)} ETH`}
					</Text>
				) : null}
			</div>
			<div style={styles.subContainer}>
				<FeedbackButton
					className="mobile-pressable-div-shallow"
					feedbackText={t`Check Wallet`}
					buttonStyle={styles.button}
					disabled={isUndefinedOrNullOrStringEmpty(amount)}
					textStyle={{ color: 'white' }}
					label={`${actionType === 'liquidate' ? t`Payoff` : t`Extend`}`}
					onClick={() => {
						if (tokenId && chainId && provider && address)
							if (actionType === 'liquidate')
								void send(
									nuggft.populateTransaction.liquidate(tokenId.toRawId(), {
										value: toEth(amount),
									}),
								);
							else
								void send(
									nuggft.populateTransaction.rebalance([tokenId.toRawId()], {
										value: toEth(amount),
									}),
								);
					}}
					rightIcon={
						isUndefinedOrNullOrStringEmpty(amount)
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
	);
};

export default LoanInputModal;
