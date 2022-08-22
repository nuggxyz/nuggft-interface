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

type Props = Record<string, never>;

const MultiLoanButton: FunctionComponent<Props> = () => {
	const address = web3.hook.usePriorityAccount();
	const provider = web3.hook.usePriorityProvider();

	const chainId = web3.hook.usePriorityChainId();
	const nuggs = client.user.useNuggs();

	const nuggft = useNuggftV1();

	const [send, , hash, , ,] = usePrioritySendTransaction();
	useTransactionManager2(provider, hash);

	const [toBeLoaned, needsClaiming] = useMemo(() => {
		const _toBeLoaned: string[] = [];
		const _needsClaiming: string[] = [];
		nuggs.forEach((x) => {
			if (!x.activeLoan && !x.activeSwap) {
				_toBeLoaned.push(x.tokenId.toRawId());
				if (x.pendingClaim) {
					_needsClaiming.push(x.tokenId.toRawId());
				}
			}
		});
		return [_toBeLoaned, _needsClaiming];
	}, [nuggs]);

	return nuggs?.length > 0 ? (
		<FeedbackButton
			disabled={toBeLoaned.length === 0}
			feedbackText="Check Wallet..."
			buttonStyle={styles.multiLoanButton}
			textStyle={styles.multiLoanButtonText}
			label={t`Loan all`}
			onClick={() => {
				if (address && chainId && provider) {
					const claim = nuggft.populateTransaction.claim(
						needsClaiming,
						Array(needsClaiming.length).fill(address) as string[],
						Array(needsClaiming.length).fill(0) as number[],
						Array(needsClaiming.length).fill(0) as number[],
					);
					const loan = nuggft.populateTransaction.loan(toBeLoaned);

					const multi = async () => {
						return nuggft.populateTransaction.multicall([
							(await claim).data || '0x0',
							(await loan).data || '0x0',
						]);
					};
					void send(multi());
				}
			}}
			rightIcon={
				<Text textStyle={styles.multiLoanButtonText}>{`(${toBeLoaned.length})`}</Text>
			}
		/>
	) : null;
};

export default MultiLoanButton;
