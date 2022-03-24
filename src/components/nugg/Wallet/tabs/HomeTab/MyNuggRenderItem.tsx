import React, { FunctionComponent } from 'react';
import { IoSearch } from 'react-icons/io5';
import { t } from '@lingui/macro';

import { MyNuggsData } from '@src/client/interfaces';
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
    const routeTo = client.mutate.routeTo();

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
            {item.activeLoan || item.activeSwap ? (
                <Text textStyle={styles.badge} size="smaller" type="text">
                    {/* eslint-disable-next-line no-nested-ternary */}
                    {item.recent
                        ? t`New`
                        : !isUndefinedOrNullOrObjectEmpty(item.activeLoan)
                        ? t`Loaned`
                        : t`On sale`}
                </Text>
            ) : null}
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

export default MyNuggRenderItem;
