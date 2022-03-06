import React, { FunctionComponent, useEffect, useState } from 'react';

import {
    extractItemId,
    isUndefinedOrNullOrStringEmpty,
    isUndefinedOrNullOrStringEmptyOrZeroOrStringZero,
    parseTokenId,
} from '@src/lib';
import { toEth } from '@src/lib/conversion';
import TokenState from '@src/state/token';
import CurrencyInput from '@src/components/general/TextInputs/CurrencyInput/CurrencyInput';
import Text from '@src/components/general/Texts/Text/Text';
import TokenViewer from '@src/components/nugg/TokenViewer';
import FeedbackButton from '@src/components/general/Buttons/FeedbackButton/FeedbackButton';
import AnimatedCard from '@src/components/general/Cards/AnimatedCard/AnimatedCard';
import useHandleError from '@src/hooks/useHandleError';
import web3 from '@src/web3';
import state from '@src/state';

import styles from './SellNuggOrItemModal.styles';

type Props = {};

const SellNuggOrItemModal: FunctionComponent<Props> = () => {
    const [swapError, clearError] = useHandleError('GAS_ERROR');
    const [amount, setAmount] = useState('');
    const address = web3.hook.usePriorityAccount();
    const tokenId = TokenState.select.tokenId();

    const provider = web3.hook.usePriorityProvider();
    const chainId = web3.hook.usePriorityChainId();

    const { targetId, type } = state.app.select.modalData();

    const [stableType, setType] = useState(type);
    const [stableId, setId] = useState(targetId);
    useEffect(() => {
        if (!isUndefinedOrNullOrStringEmpty(type)) {
            setType(type);
        }
        if (!isUndefinedOrNullOrStringEmpty(targetId)) {
            setId(targetId);
        }
    }, [type, targetId]);

    return (
        <div style={styles.container}>
            <Text textStyle={{ color: 'white' }}>
                {`${type === 'StartSale' ? 'Sell' : 'Sell Item:'} ${parseTokenId(stableId, true)}`}
            </Text>
            <AnimatedCard>
                <TokenViewer tokenId={stableId} showcase />
            </AnimatedCard>
            <div style={styles.inputContainer}>
                <CurrencyInput
                    warning={swapError && 'Invalid input'}
                    shouldFocus
                    style={styles.input}
                    styleHeading={styles.heading}
                    styleInputContainer={styles.inputCurrency}
                    label="Enter floor"
                    setValue={(text: string) => {
                        setAmount(text);
                        clearError();
                    }}
                    value={amount}
                    code
                    className="placeholder-white"
                    rightToggles={[<Text type="code">ETH</Text>]}
                />
            </div>
            <div
                style={{
                    width: '100%',
                    height: '1rem',
                    marginBottom: '.5rem',
                }}
            ></div>
            <div style={styles.subContainer}>
                <FeedbackButton
                    overrideFeedback
                    disabled={isUndefinedOrNullOrStringEmptyOrZeroOrStringZero(amount)}
                    feedbackText="Check Wallet..."
                    buttonStyle={styles.button}
                    label={`${stableType === 'StartSale' ? 'Sell Nugg' : 'Sell Item'}`}
                    onClick={() =>
                        TokenState.dispatch.initSale({
                            tokenId: stableType === 'StartSale' ? stableId : tokenId,
                            floor: toEth(amount),
                            chainId,
                            provider,
                            address,
                            itemId:
                                stableType === 'StartSale' ? undefined : extractItemId(stableId),
                        })
                    }
                />
            </div>
        </div>
    );
};

export default SellNuggOrItemModal;
