import React, { FunctionComponent } from 'react';
import { IoEllipsisHorizontal, IoSearch } from 'react-icons/io5';
import { t } from '@lingui/macro';

import { MyNuggsData } from '@src/client/interfaces';
import { InfiniteListRenderItemProps } from '@src/components/general/List/InfiniteList';
import TokenViewer from '@src/components/nugg/TokenViewer';
import globalStyles from '@src/lib/globalStyles';
import Text from '@src/components/general/Texts/Text/Text';
import lib from '@src/lib';
import Button from '@src/components/general/Buttons/Button/Button';
import Flyout from '@src/components/general/Flyout/Flyout';
import LoanButtons from '@src/components/nugg/ViewingNugg/FlyoutButtons/LoanButtons';
import OwnerButtons from '@src/components/nugg/ViewingNugg/FlyoutButtons/OwnerButtons';
import SaleButtons from '@src/components/nugg/ViewingNugg/FlyoutButtons/SaleButtons';
import useViewingNugg from '@src/client/hooks/useViewingNugg';

import styles from './HomeTab.styles';

const MyNuggRenderItem: FunctionComponent<
    InfiniteListRenderItemProps<MyNuggsData, undefined, unknown>
> = ({ item, style }) => {
    const { gotoViewingNugg } = useViewingNugg();

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
                    {item.recent ? t`New` : item.activeLoan ? t`Loaned` : t`On sale`}
                </Text>
            ) : null}
            <Flyout
                containerStyle={styles.flyout}
                style={{ right: '0rem', top: '2rem' }}
                button={
                    <div style={styles.flyoutButton}>
                        <IoEllipsisHorizontal color={lib.colors.white} />
                    </div>
                }
            >
                {item.tokenId &&
                    // eslint-disable-next-line no-nested-ternary
                    (item?.activeSwap ? (
                        <SaleButtons tokenId={item.tokenId} />
                    ) : item?.activeLoan ? (
                        <LoanButtons tokenId={item.tokenId} />
                    ) : (
                        <OwnerButtons tokenId={item.tokenId} />
                    ))}
            </Flyout>
            <Button
                key={JSON.stringify(item)}
                onClick={() => {
                    gotoViewingNugg(item.tokenId);
                }}
                buttonStyle={styles.searchButton}
                rightIcon={<IoSearch color={lib.colors.white} />}
            />
        </div>
    ) : null;
};

export default MyNuggRenderItem;
