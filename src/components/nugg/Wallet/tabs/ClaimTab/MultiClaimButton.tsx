import React, { FunctionComponent, useMemo } from 'react';

import FeedbackButton from '@src/components/general/Buttons/FeedbackButton/FeedbackButton';
import web3 from '@src/web3';
import client from '@src/client';
import state from '@src/state';

import styles from './ClaimTab.styles';

type Props = Record<string, unknown>;

const MultiClaimButton: FunctionComponent<Props> = () => {
    const sender = web3.hook.usePriorityAccount();
    const provider = web3.hook.usePriorityProvider();

    const chainId = web3.hook.usePriorityChainId();
    const unclaimedOffers = client.live.myUnclaimedOffers();

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
            label="Claim all"
            onClick={() =>
                sender &&
                chainId &&
                provider &&
                state.wallet.dispatch.multiClaim({
                    addresses,
                    sender,
                    chainId,
                    provider,
                    tokenIds,
                })
            }
        />
    ) : null;
};

export default MultiClaimButton;
