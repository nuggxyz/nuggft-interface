import React, { FunctionComponent, useMemo } from 'react';
import { t } from '@lingui/macro';

import FeedbackButton from '@src/components/general/Buttons/FeedbackButton/FeedbackButton';
import web3 from '@src/web3';
import client from '@src/client';
import { useNuggftV1, useTransactionManager } from '@src/contracts/useContract';
import { NuggftV1 } from '@src/typechain';

import styles from './ClaimTab.styles';

type Props = Record<string, never>;

export const useMultiClaimArgs = () => {
    const unclaimedOffers = client.live.myUnclaimedOffers();

    return useMemo(() => {
        const hello = unclaimedOffers.reduce(
            (
                prev: {
                    sellingTokenIds: string[];
                    addresses: string[];
                    buyingTokenIds: string[];
                    itemIds: string[];
                },
                curr,
            ) => {
                return {
                    sellingTokenIds: [
                        ...prev.sellingTokenIds,
                        curr.claimParams.sellingTokenId.toRawId(),
                    ],
                    addresses: [...prev.addresses, curr.claimParams.address],
                    buyingTokenIds: [
                        ...prev.buyingTokenIds,
                        curr.claimParams.buyingTokenId.toRawId(),
                    ],
                    itemIds: [...prev.itemIds, curr.claimParams.itemId.toRawId()],
                };
            },
            { sellingTokenIds: [], addresses: [], buyingTokenIds: [], itemIds: [] },
        );

        return Object.values(hello) as Parameters<NuggftV1['claim']>;
    }, [unclaimedOffers]);
};

const MultiClaimButton: FunctionComponent<Props> = () => {
    const sender = web3.hook.usePriorityAccount();
    const provider = web3.hook.usePriorityProvider();

    const chainId = web3.hook.usePriorityChainId();

    const nuggft = useNuggftV1(provider);

    const unclaimedOffers = client.live.myUnclaimedOffers();

    const args = useMultiClaimArgs();

    const { send } = useTransactionManager();

    return unclaimedOffers?.length > 0 ? (
        <FeedbackButton
            feedbackText="Check Wallet..."
            buttonStyle={styles.multiClaimButton}
            textStyle={styles.multiClaimButtonText}
            label={t`Claim All`}
            onClick={() => {
                if (sender && chainId && provider) {
                    void send(nuggft.populateTransaction.claim(...args));
                }
            }}
        />
    ) : null;
};

export default MultiClaimButton;
