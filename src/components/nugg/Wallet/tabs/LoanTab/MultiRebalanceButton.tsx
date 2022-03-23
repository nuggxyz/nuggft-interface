import React, { FunctionComponent, useMemo } from 'react';

import FeedbackButton from '@src/components/general/Buttons/FeedbackButton/FeedbackButton';
import web3 from '@src/web3';
import client from '@src/client';
import state from '@src/state';

import styles from './LoanTab.styles';

type Props = Record<string, never>;

const MultiRebalanceButton: FunctionComponent<Props> = () => {
    const address = web3.hook.usePriorityAccount();
    const provider = web3.hook.usePriorityProvider();

    const chainId = web3.hook.usePriorityChainId();
    const unclaimedOffers = client.live.myNuggs();

    const { tokenIds } = useMemo(() => {
        const _tokenIds: string[] = [];
        unclaimedOffers.forEach((x) => {
            if (x.activeLoan) _tokenIds.push(x.tokenId);
        });
        return { tokenIds: _tokenIds };
    }, [unclaimedOffers]);

    return unclaimedOffers?.length > 0 ? (
        <FeedbackButton
            feedbackText="Check Wallet..."
            buttonStyle={styles.multiLoanButton}
            textStyle={styles.multiLoanButtonText}
            label={`Rebalance all (${tokenIds.length})`}
            onClick={() =>
                address &&
                chainId &&
                provider &&
                state.wallet.dispatch.extend({
                    address,
                    chainId,
                    provider,
                    tokenIds,
                })
            }
        />
    ) : null;
};

export default MultiRebalanceButton;
