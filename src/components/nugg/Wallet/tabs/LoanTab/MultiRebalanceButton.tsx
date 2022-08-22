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

const MultiRebalanceButton: FunctionComponent<Props> = () => {
	const address = web3.hook.usePriorityAccount();
	const provider = web3.hook.usePriorityProvider();
	const nuggft = useNuggftV1();

	const [send, , hash, , ,] = usePrioritySendTransaction();
	useTransactionManager2(provider, hash);
	const chainId = web3.hook.usePriorityChainId();
	const unclaimedOffers = client.user.useNuggs();

	const { tokenIds } = useMemo(() => {
		const _tokenIds: string[] = [];
		unclaimedOffers.forEach((x) => {
			if (x.activeLoan) _tokenIds.push(x.tokenId.toRawId());
		});
		return { tokenIds: _tokenIds };
	}, [unclaimedOffers]);

	return unclaimedOffers?.length > 0 ? (
		<FeedbackButton
			disabled={tokenIds.length === 0}
			feedbackText="Check Wallet..."
			buttonStyle={styles.multiLoanButton}
			textStyle={styles.multiLoanButtonText}
			label={t`Rebalance all`}
			onClick={() => {
				if (address && chainId && provider)
					void send(nuggft.populateTransaction.rebalance(tokenIds));
			}}
			rightIcon={<Text textStyle={styles.multiLoanButtonText}>{`(${tokenIds.length})`}</Text>}
		/>
	) : null;
};

export default MultiRebalanceButton;
