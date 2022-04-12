import React, { FunctionComponent, useMemo } from 'react';
import { t } from '@lingui/macro';

import { DefaultExtraData, UnclaimedOffer } from '@src/client/interfaces';
import globalStyles from '@src/lib/globalStyles';
import TokenViewer from '@src/components/nugg/TokenViewer';
import NLStaticImage from '@src/components/general/NLStaticImage';
import Text from '@src/components/general/Texts/Text/Text';
import { parseTokenId } from '@src/lib';
import FeedbackButton from '@src/components/general/Buttons/FeedbackButton/FeedbackButton';
import { ListRenderItemProps } from '@src/components/general/List/List';
import { useNuggftV1, useTransactionManager } from '@src/contracts/useContract';
import web3 from '@src/web3';

import styles from './ClaimTab.styles';

const ClaimRenderItem: FunctionComponent<
    ListRenderItemProps<UnclaimedOffer, DefaultExtraData, undefined>
> = ({ item, index }) => {
    const provider = web3.hook.usePriorityProvider();

    const nuggft = useNuggftV1(provider);

    const { send } = useTransactionManager();

    const swapText = useMemo(
        () =>
            item.type === 'item'
                ? t`For Nugg ${item.nugg}`
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
                <div>
                    <Text textStyle={styles.textBlue} size="small">
                        {item.leader
                            ? `${parseTokenId(item.tokenId, true)}`
                            : `${item.eth.decimal.toNumber()} ETH`}
                    </Text>
                    <Text textStyle={styles.textDefault} size="smaller" type="text">
                        {item.leader
                            ? swapText
                            : `${parseTokenId(item.tokenId, true)} | ${swapText}`}
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
                            [item.claimParams.sellingTokenId],
                            [item.claimParams.address],
                            [item.claimParams.buyingTokenId],
                            [item.claimParams.itemId],
                        ),
                    );
                }}
            />
        </div>
    );
};

export default ClaimRenderItem;
