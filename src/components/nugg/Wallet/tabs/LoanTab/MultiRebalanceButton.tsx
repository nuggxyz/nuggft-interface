import React, { FunctionComponent, useMemo } from 'react';
import { t } from '@lingui/macro';

import FeedbackButton from '@src/components/general/Buttons/FeedbackButton/FeedbackButton';
import web3 from '@src/web3';
import client from '@src/client';
import Text from '@src/components/general/Texts/Text/Text';
import {
	useNuggftV1,
	usePrioritySendTransaction,
	useTransactionManager2,
} from '@src/contracts/useContract';

import styles from './LoanTab.styles';
import { isUndefinedOrNullOrArrayEmpty } from '@src/lib';
import { useMemoizedAsyncState } from '@src/hooks/useAsyncState';
import { BigNumber } from '@ethersproject/bignumber';

type Props = Record<string, never>;

const MultiRebalanceButton: FunctionComponent<Props> = () => {
	const address = web3.hook.usePriorityAccount();
	const provider = web3.hook.usePriorityProvider();
	const nuggft = useNuggftV1(provider);

	const [send, , hash, , ,] = usePrioritySendTransaction();
	useTransactionManager2(provider, hash);
	const chainId = web3.hook.usePriorityChainId();
	const nuggs = client.user.useNuggs();

	const [loanedNuggs] = useMemo(() => {
		const _loanedNuggs: string[] = [];
		nuggs.forEach((x) => {
			if (x.activeLoan) {
				_loanedNuggs.push(x.tokenId.toRawId());
			}
		});
		return [_loanedNuggs];
	}, [nuggs]);

	const amount = useMemoizedAsyncState(() => {
		if (!isUndefinedOrNullOrArrayEmpty(loanedNuggs)) {
			return nuggft.vfr(loanedNuggs);
		}
		return undefined;
	}, [loanedNuggs, nuggft]);

	return nuggs?.length > 0 ? (
		<FeedbackButton
			disabled={loanedNuggs.length === 0}
			feedbackText="Check Wallet..."
			buttonStyle={styles.multiLoanButton}
			textStyle={styles.multiLoanButtonText}
			label={t`Extend all`}
			onClick={() => {
				if (address && chainId && provider && amount) {
					void send(
						nuggft.populateTransaction.rebalance(loanedNuggs, {
							value: amount.reduce((acc, val) => acc.add(val), BigNumber.from(0)),
						}),
					);
				}
			}}
			rightIcon={
				<Text textStyle={styles.multiLoanButtonText}>{`(${loanedNuggs.length})`}</Text>
			}
		/>
	) : null;
};

export default MultiRebalanceButton;
