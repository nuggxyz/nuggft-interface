import React, { FunctionComponent, useMemo } from 'react';
import { t } from '@lingui/macro';

import { DefaultExtraData, UnclaimedOffer } from '@src/client/interfaces';
import globalStyles from '@src/lib/globalStyles';
import TokenViewer from '@src/components/nugg/TokenViewer';
import NLStaticImage from '@src/components/general/NLStaticImage';
import Text from '@src/components/general/Texts/Text/Text';
import { parseTokenId } from '@src/lib';
import FeedbackButton from '@src/components/general/Buttons/FeedbackButton/FeedbackButton';
import state from '@src/state';
import { ListRenderItemProps } from '@src/components/general/List/List';

import styles from './ClaimTab.styles';

const ClaimRenderItem: FunctionComponent<
    ListRenderItemProps<UnclaimedOffer, DefaultExtraData, undefined>
> = ({ item, index, extraData }) => {
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
                    state.wallet.dispatch.claim({
                        ...item.claimParams,
                        ...extraData,
                    });
                }}
            />
        </div>
    );
};

export default ClaimRenderItem;
