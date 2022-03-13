import React, { FunctionComponent } from 'react';

import FeedbackButton from '@src/components/general/Buttons/FeedbackButton/FeedbackButton';
import state from '@src/state';
import web3 from '@src/web3';

import styles from './HomeTab.styles';

type Props = Record<string, unknown>;

const MintNuggButton: FunctionComponent<Props> = () => {
    const address = web3.hook.usePriorityAccount();
    const provider = web3.hook.usePriorityProvider();
    const chainId = web3.hook.usePriorityChainId();
    return (
        <FeedbackButton
            feedbackText="Check Wallet..."
            buttonStyle={styles.mintNuggButton}
            textStyle={styles.mintNuggButtonText}
            label="Mint a Nugg"
            onClick={() =>
                address &&
                provider &&
                chainId &&
                state.wallet.dispatch.mintNugg({ chainId, provider, address })
            }
        />
    );
};

export default MintNuggButton;
