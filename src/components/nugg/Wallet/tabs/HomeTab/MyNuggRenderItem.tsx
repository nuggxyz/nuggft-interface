import React, { FunctionComponent } from 'react';
import { IoSearch } from 'react-icons/io5';

import { MyNuggsData } from '@src/client/core';
import { InfiniteListRenderItemProps } from '@src/components/general/List/InfiniteList';
import TokenViewer from '@src/components/nugg/TokenViewer';
import globalStyles from '@src/lib/globalStyles';
import Text from '@src/components/general/Texts/Text/Text';
import lib, { isUndefinedOrNullOrObjectEmpty } from '@src/lib';
import Button from '@src/components/general/Buttons/Button/Button';
import client from '@src/client';

import styles from './HomeTab.styles';

const MyNuggRenderItem: FunctionComponent<
    InfiniteListRenderItemProps<MyNuggsData, undefined, unknown>
> = ({ item, style }) => {
    return item ? (
        <div
            style={{
                ...styles.myNuggItemContainer,
                ...style,
            }}
        >
            <div style={globalStyles.centered}>
                <TokenViewer tokenId={item.tokenId || ''} style={globalStyles.listNugg} />

                <Text textStyle={styles.textRed}>Nugg {item.tokenId || ''}</Text>
            </div>
            {!isUndefinedOrNullOrObjectEmpty(item.activeLoan) ||
            !isUndefinedOrNullOrObjectEmpty(item.activeSwap) ? (
                <Text textStyle={styles.badge} size="smaller" type="text">
                    {!isUndefinedOrNullOrObjectEmpty(item.activeLoan) ? 'Loaned' : 'On sale'}
                </Text>
            ) : null}
            <Button
                key={JSON.stringify(item)}
                onClick={() => {
                    client.actions.routeTo(item.tokenId, true);
                }}
                buttonStyle={styles.searchButton}
                rightIcon={<IoSearch color={lib.colors.white} />}
            />
        </div>
    ) : null;
};

export default MyNuggRenderItem;
