import React, { FunctionComponent, useMemo } from 'react';

import Text from '@src/components/general/Texts/Text/Text';
import lib from '@src/lib';
import state from '@src/state';
import client from '@src/client';
import { Lifecycle } from '@src/client/interfaces';

import styles from './RingAbout.styles';

type Props = Record<string, unknown>;

const OfferText: FunctionComponent<Props> = () => {
    const tokenId = client.live.lastSwap.tokenId();
    const token = client.live.token(tokenId);

    const screenType = state.app.select.screenType();

    const hasBids = client.live.offers(tokenId).length !== 0;

    const text = useMemo(() => {
        if (!token) return '';
        if (token.lifecycle === Lifecycle.Tryout) {
            return 'Select a nugg to buy this item from';
        }
        if (token.lifecycle === Lifecycle.Deck || token.lifecycle === Lifecycle.Bat) {
            return hasBids ? 'Highest Offer' : 'No offers yet...';
        }
        if (token.lifecycle === Lifecycle.Bench) {
            return 'Place offer to begin auction';
        }
        if (token.lifecycle === Lifecycle.Shower) {
            return hasBids ? 'Winner' : 'This sale is over';
        }
        return '';
    }, [token, hasBids]);

    return (
        <Text
            textStyle={{
                ...styles.title,
                ...(screenType === 'phone' && {
                    color: lib.colors.nuggBlueText,
                }),
            }}
        >
            {text}
        </Text>
    );
};

export default OfferText;
