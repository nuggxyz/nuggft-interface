import React, { FunctionComponent, useMemo } from 'react';
import { t } from '@lingui/macro';

import { DefaultExtraData, UnclaimedOffer } from '@src/client/interfaces';
import globalStyles from '@src/lib/globalStyles';
import TokenViewer from '@src/components/nugg/TokenViewer';
import NLStaticImage from '@src/components/general/NLStaticImage';
import Text from '@src/components/general/Texts/Text/Text';
import FeedbackButton from '@src/components/general/Buttons/FeedbackButton/FeedbackButton';
import { ListRenderItemProps } from '@src/components/general/List/List';
import {
	useNuggftV1,
	usePrioritySendTransaction,
	useTransactionManager2,
} from '@src/contracts/useContract';
import web3 from '@src/web3';

import styles from './ClaimTab.styles';

const ClaimRenderItem: FunctionComponent<
	ListRenderItemProps<UnclaimedOffer, DefaultExtraData, undefined>
> = ({ item, index }) => {
	const provider = web3.hook.usePriorityProvider();

	const nuggft = useNuggftV1(provider);

	const [send, , hash, , ,] = usePrioritySendTransaction();

	useTransactionManager2(provider, hash);

	const swapText = useMemo(
		() =>
			item.tokenId.isItemId()
				? t`For ${item.nugg?.toPrettyId()}`
				: t`From epoch ${item.endingEpoch !== null ? item.endingEpoch : ''}`,
		[item],
	);

	return (
		<div key={index} style={styles.renderItemContainer}>
			<div style={globalStyles.centered}>
				{item.leader ? (
					<TokenViewer tokenId={item.tokenId} style={styles.renderItemToken} />
				) : (
					<NLStaticImage image="eth" style={styles.renderItemETH} />
				)}
				<div
					style={{
						display: 'flex',
						alignItems: 'flex-start',
						justifyContent: 'flex-start',
						flexDirection: 'column',
						marginLeft: '.5rem',
					}}
				>
					<Text textStyle={styles.textBlue} size="small">
						{item.leader
							? `${item.tokenId.toPrettyId()}`
							: `${item.eth.decimal.toNumber()} ETH`}
					</Text>
					<Text textStyle={styles.textDefault} size="smaller" type="text">
						{item.leader ? swapText : `${item.tokenId.toPrettyId()} | ${swapText}`}
					</Text>
				</div>
			</div>
			<FeedbackButton
				feedbackText={t`Check Wallet...`}
				textStyle={styles.textWhite}
				type="text"
				size="small"
				buttonStyle={styles.renderItemButton}
				label={t`Claim`}
				onClick={() => {
					void send(
						nuggft.populateTransaction.claim(
							[item.claimParams.sellingTokenId.toRawId()],
							[item.claimParams.address],
							[item.claimParams.buyingTokenId?.toRawId()],
							[item.claimParams.itemId?.toRawId()],
						),
					);
				}}
			/>
		</div>
	);
};

export default ClaimRenderItem;
