import React, { FC, FunctionComponent } from 'react';
import { IoPricetagsOutline, IoSync } from 'react-icons/io5';

import TokenViewer from '@src/components/nugg/TokenViewer';
import Label from '@src/components/general/Label/Label';
import {
    createItemId,
    formatItemSwapIdForSend,
    padToAddress,
    parseTokenId,
    sortByField,
} from '@src/lib';
import constants from '@src/lib/constants';
import Button from '@src/components/general/Buttons/Button/Button';
import AppState from '@src/state/app';
import globalStyles from '@src/lib/globalStyles';
import Colors from '@src/lib/colors';
import List, { ListRenderItemProps } from '@src/components/general/List/List';
import WalletState from '@src/state/wallet';
import { DefaultExtraData, LiveNuggItem } from '@src/client/interfaces';

import styles from './ViewingNugg.styles';

interface ExtraData extends DefaultExtraData {
    tokenId: string;
    isOwner: boolean;
}

interface Props extends ExtraData {
    items: LiveNuggItem[];
    tokenId: string;
}

const Item: FC<ListRenderItemProps<LiveNuggItem, ExtraData, undefined>> = ({ item, extraData }) => {
    return (
        <div style={styles.itemListItem}>
            <div style={{ ...globalStyles.centeredSpaceBetween }}>
                <TokenViewer
                    tokenId={createItemId((item.feature << 8) | item.position)}
                    style={styles.listItemSvg}
                    // data={item.dotnuggRawCache}
                    disableOnClick
                />

                <Label text={parseTokenId(createItemId((item.feature << 8) | item.position))} />
            </div>
            {+item.feature !== constants.FEATURE_BASE &&
                extraData.isOwner &&
                (!item.activeSwap ? (
                    <Button
                        label="Sell"
                        buttonStyle={styles.itemListButton}
                        leftIcon={<IoPricetagsOutline color={Colors.white} />}
                        textStyle={styles.itemListButtonText}
                        type="text"
                        onClick={() => {
                            AppState.dispatch.setModalOpen({
                                name: 'SellNuggOrItemModal',
                                modalData: {
                                    targetId: createItemId((item.feature << 8) | item.position),
                                    type: 'SellItem',
                                    data: {
                                        tokenId: extraData.tokenId,
                                    },
                                },
                            });
                        }}
                    />
                ) : (
                    <Button
                        label="Reclaim"
                        buttonStyle={styles.itemListButton}
                        leftIcon={<IoSync color={Colors.white} />}
                        textStyle={styles.itemListButtonText}
                        type="text"
                        onClick={() => {
                            if (item.activeSwap)
                                WalletState.dispatch.claim({
                                    ...extraData,
                                    address: padToAddress(extraData.sender),
                                    tokenId: formatItemSwapIdForSend(item.activeSwap).toString(),
                                });
                        }}
                    />
                ))}
        </div>
    );
};

const ItemList: FunctionComponent<Props> = ({
    items,
    chainId,
    provider,
    sender,
    tokenId,
    isOwner,
}) => {
    return (
        <List
            style={{ padding: '1rem' }}
            data={sortByField(items, 'feature', false)}
            RenderItem={Item}
            extraData={{ sender, provider, chainId, tokenId, isOwner }}
            action={() => undefined}
        />
    );
};

export default ItemList;
