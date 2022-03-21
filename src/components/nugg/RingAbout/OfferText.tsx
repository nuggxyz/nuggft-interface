import React, { FunctionComponent, useMemo } from 'react';

import Text from '@src/components/general/Texts/Text/Text';
import lib from '@src/lib';
import state from '@src/state';
import client from '@src/client';
import { Lifecycle } from '@src/client/hooks/useLiveToken';

import styles from './RingAbout.styles';

type Props = Record<string, unknown>;

const OfferText: FunctionComponent<Props> = () => {
    const screenType = state.app.select.screenType();

    const tokenId = client.live.lastSwap.tokenId();

    const { lifecycle } = client.hook.useLiveToken(tokenId);
    // const lifecycle = client.live.activeLifecycle();

    const hasBids = client.live.offers(tokenId).length !== 0;

    const text = useMemo(() => {
        if (lifecycle === Lifecycle.Tryout) {
            return 'Select a nugg to buy this item from';
        }
        if (lifecycle === Lifecycle.Deck || lifecycle === Lifecycle.Bat) {
            return hasBids ? 'Highest Offer' : 'No offers yet...';
        }
        if (lifecycle === Lifecycle.Bench) {
            return 'Place offer to begin auction';
        }
        if (lifecycle === Lifecycle.Shower) {
            return hasBids ? 'Winner' : 'This sale is over';
        }
        return '';
    }, [lifecycle, hasBids]);

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
