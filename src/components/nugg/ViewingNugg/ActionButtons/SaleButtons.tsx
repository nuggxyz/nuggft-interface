import React, { FunctionComponent } from 'react';
import { t } from '@lingui/macro';
import { IoArrowDown, IoSync } from 'react-icons/io5';

import lib from '@src/lib';
import Button from '@src/components/general/Buttons/Button/Button';
import web3 from '@src/web3';
import styles from '@src/components/nugg/ViewingNugg/ViewingNugg.styles';
import {
	usePrioritySendTransaction,
	useNuggftV1,
	useTransactionManager2,
} from '@src/contracts/useContract';

type Props = { tokenId: string; reclaim?: boolean };

const SaleButtons: FunctionComponent<Props> = ({ tokenId, reclaim = false }) => {
	const chainId = web3.hook.usePriorityChainId();
	const provider = web3.hook.usePriorityProvider();
	const sender = web3.hook.usePriorityAccount();
	const nuggft = useNuggftV1(provider);
	const [send, , hash, , ,] = usePrioritySendTransaction();

	useTransactionManager2(provider, hash);

	return sender && provider && chainId ? (
		<div style={styles.ownerButtonContainer}>
			<Button
				textStyle={styles.textBlack}
				size="medium"
				type="text"
				buttonStyle={styles.button}
				label={reclaim ? t`Reclaim` : t`Claim`}
				leftIcon={
					reclaim ? (
						<IoSync
							color={lib.colors.nuggBlueText}
							size={25}
							// style={{ marginRight: '.75rem' }}
						/>
					) : (
						<IoArrowDown
							color={lib.colors.nuggBlueText}
							size={25}
							// style={{ marginRight: '.75rem' }}
						/>
					)
				}
				onClick={() => {
					void send(
						nuggft.populateTransaction.claim([tokenId.toRawId()], [sender], [0], [0]),
					);
				}}
			/>
		</div>
	) : null;
};

export default SaleButtons;
