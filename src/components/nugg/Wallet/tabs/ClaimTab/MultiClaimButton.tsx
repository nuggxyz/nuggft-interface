import React, { FunctionComponent, useMemo } from 'react';
import { t } from '@lingui/macro';

import FeedbackButton from '@src/components/general/Buttons/FeedbackButton/FeedbackButton';
import web3 from '@src/web3';
import client from '@src/client';
import { useNuggftV1, useTransactionManager } from '@src/contracts/useContract';

import styles from './ClaimTab.styles';

type Props = Record<string, never>;

const MultiClaimButton: FunctionComponent<Props> = () => {
    const sender = web3.hook.usePriorityAccount();
    const provider = web3.hook.usePriorityProvider();

    const chainId = web3.hook.usePriorityChainId();
    const unclaimedOffers = client.live.myUnclaimedOffers();

    const nuggft = useNuggftV1(provider);

    const { send } = useTransactionManager();

    const { tokenIds, addresses } = useMemo(() => {
        const _addresses: string[] = [];
        const _tokenIds: string[] = [];
        unclaimedOffers.forEach((x) => {
            _tokenIds.push(x.claimParams.tokenId);
            _addresses.push(x.claimParams.address);
        });
        return { tokenIds: _tokenIds, addresses: _addresses };
    }, [unclaimedOffers]);

    return unclaimedOffers?.length > 0 ? (
        <FeedbackButton
            feedbackText="Check Wallet..."
            buttonStyle={styles.multiClaimButton}
            textStyle={styles.multiClaimButtonText}
            label={t`Claim All`}
            onClick={() => {
                if (sender && chainId && provider) {
                    void send(
                        nuggft.populateTransaction['claim(uint160[],address[])'](
                            tokenIds,
                            addresses,
                        ),
                    );
                }
            }}
        />
    ) : null;
};

export default MultiClaimButton;
