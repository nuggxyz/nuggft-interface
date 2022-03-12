import React, { FunctionComponent, useEffect, useState } from 'react';

import {
    extractItemId,
    isUndefinedOrNullOrStringEmptyOrZeroOrStringZero,
    parseTokenId,
} from '@src/lib';
import { toEth } from '@src/lib/conversion';
import CurrencyInput from '@src/components/general/TextInputs/CurrencyInput/CurrencyInput';
import Text from '@src/components/general/Texts/Text/Text';
import TokenViewer from '@src/components/nugg/TokenViewer';
import FeedbackButton from '@src/components/general/Buttons/FeedbackButton/FeedbackButton';
import AnimatedCard from '@src/components/general/Cards/AnimatedCard/AnimatedCard';
import web3 from '@src/web3';
import state from '@src/state';
import { TokenId } from '@src/client/router';
import WalletState from '@src/state/wallet';
import Button from '@src/components/general/Buttons/Button/Button';
import client from '@src/client';

import styles from './SellNuggOrItemModal.styles';

type Props = {
    tokenId: TokenId;
};

const SellNuggOrItemModal: FunctionComponent<Props> = ({ tokenId }) => {
    // const [swapError, clearError] = useHandleError('GAS_ERROR');
    const [amount, setAmount] = useState('');
    const address = web3.hook.usePriorityAccount();
    const stake = client.static.stake();

    const provider = web3.hook.usePriorityProvider();
    const chainId = web3.hook.usePriorityChainId();

    const { targetId, type } = state.app.select.modalData();

    const [stableType, setType] = useState(type);
    const [stableId, setId] = useState<TokenId | undefined>(targetId);

    useEffect(() => {
        type && setType(type);
        targetId && setId(targetId);
    }, [type, targetId]);

    return stableId && chainId && provider && address ? (
        <div style={styles.container}>
            <Text textStyle={{ color: 'white' }}>
                {`${stableType === 'SellNugg' ? 'Sell' : 'Sell Item:'} ${parseTokenId(
                    stableId,
                    true,
                )}`}
            </Text>
            <AnimatedCard>
                <TokenViewer tokenId={stableId} showcase />
            </AnimatedCard>
            <div style={styles.inputContainer}>
                {stake ? (
                    <CurrencyInput
                        // warning={swapError && 'Invalid input'}
                        shouldFocus
                        style={styles.input}
                        styleHeading={styles.heading}
                        styleInputContainer={styles.inputCurrency}
                        label="Enter floor"
                        setValue={setAmount}
                        value={amount}
                        code
                        className="placeholder-white"
                        rightToggles={[
                            stableType === 'SellNugg' ? (
                                <Button
                                    onClick={() => setAmount(stake.eps.decimal.toPrecision(5))}
                                    label="Min"
                                    size="small"
                                    buttonStyle={styles.minButton}
                                />
                            ) : (
                                <Text type="code">ETH</Text>
                            ),
                        ]}
                    />
                ) : null}
            </div>
            <div style={styles.break} />
            <div style={styles.subContainer}>
                <FeedbackButton
                    overrideFeedback
                    disabled={isUndefinedOrNullOrStringEmptyOrZeroOrStringZero(amount)}
                    feedbackText="Check Wallet..."
                    buttonStyle={styles.button}
                    label={`${stableType === 'SellNugg' ? 'Sell Nugg' : 'Sell Item'}`}
                    onClick={() =>
                        WalletState.dispatch.initSale({
                            tokenId: stableType === 'SellNugg' ? stableId : tokenId,
                            floor: toEth(amount),
                            chainId,
                            provider,
                            address,
                            itemId: stableType === 'SellNugg' ? undefined : extractItemId(stableId),
                        })
                    }
                />
            </div>
        </div>
    ) : null;
};

export default SellNuggOrItemModal;
