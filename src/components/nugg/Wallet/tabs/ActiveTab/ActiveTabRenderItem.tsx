import React from 'react';
import { IoSearch } from 'react-icons/io5';

import { InfiniteListRenderItemProps } from '@src/components/general/List/InfiniteList';
import TokenViewer from '@src/components/nugg/TokenViewer';
import globalStyles from '@src/lib/globalStyles';
import Text from '@src/components/general/Texts/Text/Text';
import lib, { parseTokenIdSmart } from '@src/lib';
import Button from '@src/components/general/Buttons/Button/Button';
import client from '@src/client';
import CurrencyText from '@src/components/general/Texts/CurrencyText/CurrencyText';
import { SwapData } from '@src/client/interfaces';

import styles from './ActiveTab.styles';

export default ({ item, style }: InfiniteListRenderItemProps<SwapData, undefined, unknown>) => {
    const routeTo = client.mutate.routeTo();

    return item ? (
        <div
            style={{
                ...styles.myNuggItemContainer,
                ...style,
            }}
        >
            <div style={globalStyles.centered}>
                <TokenViewer tokenId={item.tokenId} style={globalStyles.listNugg} />

                <Text textStyle={styles.textRed}>{parseTokenIdSmart(item.tokenId || '')}</Text>
                <CurrencyText textStyle={styles.textRed} value={item.eth.number} />
            </div>

            <Button
                key={JSON.stringify(item)}
                onClick={() => {
                    routeTo(item.tokenId, true);
                }}
                buttonStyle={styles.searchButton}
                rightIcon={<IoSearch color={lib.colors.white} />}
            />
        </div>
    ) : null;
};
