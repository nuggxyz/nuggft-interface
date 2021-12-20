import React, { FunctionComponent, useState } from 'react';

import { fromEth } from '../../../../lib/conversion';
import SwapDispatches from '../../../../state/swap/dispatches';
import SwapSelectors from '../../../../state/swap/selectors';
import Button from '../../../general/Buttons/Button/Button';
import CurrencyInput from '../../../general/TextInputs/CurrencyInput/CurrencyInput';
import Text from '../../../general/Texts/Text/Text';
import TokenViewer from '../../TokenViewer';

import styles from './OfferModal.styles';

type Props = {};

const OfferModal: FunctionComponent<Props> = () => {
    const [amount, setAmount] = useState('');
    const minimum = SwapSelectors.eth();
    const nugg = SwapSelectors.nugg();

    return (
        <div style={styles.container}>
            <TokenViewer tokenId={nugg.id} showLabel labelColor="white" />
            <CurrencyInput
                style={styles.input}
                styleHeading={styles.heading}
                styleInput={styles.inputCurrency}
                label="Enter amount"
                setValue={setAmount}
                value={amount}
                code
                className="placeholder-white"
            />
            <div style={styles.subContainer}>
                <Text textStyle={styles.text}>
                    Offer must be greater than {minimum ? fromEth(minimum) : 0}{' '}
                    ETH
                </Text>
                <Button
                    buttonStyle={styles.button}
                    label="Place offer"
                    onClick={() => {
                        SwapDispatches.placeOffer({
                            tokenId: nugg.id,
                            amount: amount,
                        });
                    }}
                />
            </div>
        </div>
    );
};

export default OfferModal;
