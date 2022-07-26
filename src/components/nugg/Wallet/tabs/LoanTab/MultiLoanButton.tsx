import React, { FunctionComponent, useMemo } from 'react';
import { t } from '@lingui/macro';

import FeedbackButton from '@src/components/general/Buttons/FeedbackButton/FeedbackButton';
import web3 from '@src/web3';
import client from '@src/client';
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
	const unclaimedOffers = client.user.useNuggs();

	const nuggft = useNuggftV1();

	const [send, , hash, , ,] = usePrioritySendTransaction();
	useTransactionManager2(provider, hash);

	const { tokenIds } = useMemo(() => {
		const _tokenIds: string[] = [];
		unclaimedOffers.forEach((x) => {
			if (!x.activeLoan && !x.activeSwap && !x.pendingClaim) _tokenIds.push(x.tokenId);
		});
		return { tokenIds: _tokenIds };
	}, [unclaimedOffers]);

	return unclaimedOffers?.length > 0 ? (
		<FeedbackButton
			feedbackText="Check Wallet..."
			buttonStyle={styles.multiLoanButton}
			textStyle={styles.multiLoanButtonText}
			label={t`Loan all (${tokenIds.length})`}
			onClick={() => {
				if (address && chainId && provider)
					void send(nuggft.populateTransaction.loan(tokenIds));
			}}
		/>
	) : null;
};

export default MultiLoanButton;
