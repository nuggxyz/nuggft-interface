import React from 'react';
import { t } from '@lingui/macro';

import Text from '@src/components/general/Texts/Text/Text';
import client from '@src/client';
import state from '@src/state';
import { useDarkMode } from '@src/client/hooks/useDarkMode';
import lib from '@src/lib';

import styles from './RingAbout.styles';
import OffersList from './OffersList';
import OfferButton from './OfferButton';

export default () => {
    const screenType = state.app.select.screenType();
    const darkmode = useDarkMode();

    const tokenId = client.live.lastSwap.tokenId();
    const token = client.live.token(tokenId);

    return token && token.type === 'item' && token.upcomingActiveSwap ? (
        <div
            style={{
                ...(darkmode ? styles.containerDark : styles.container),
                ...(screenType === 'phone' && {
                    ...styles.mobile,
                }),
                marginTop: '20px',
            }}
        >
            <div style={styles.leadingOfferAmountUser}>
                <Text
                    textStyle={{
                        color: lib.colors.white,
                        paddingBottom: '10px',
                    }}
                >{t`Coming Up`}</Text>
            </div>
            <OffersList tokenId={tokenId} sellingNuggId={token.upcomingActiveSwap.sellingNuggId} />
            <OfferButton tokenId={tokenId} sellingNuggId={token.upcomingActiveSwap.sellingNuggId} />
        </div>
    ) : null;
};
