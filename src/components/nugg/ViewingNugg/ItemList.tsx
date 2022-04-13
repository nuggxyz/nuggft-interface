import React, { FC, FunctionComponent } from 'react';
import { IoPricetagsOutline, IoSync } from 'react-icons/io5';

import TokenViewer from '@src/components/nugg/TokenViewer';
import { formatItemSwapIdForSend, parseTokenId, sortByField } from '@src/lib';
import constants from '@src/lib/constants';
import Button from '@src/components/general/Buttons/Button/Button';
import globalStyles from '@src/lib/globalStyles';
import Colors from '@src/lib/colors';
import { LiveNuggItem } from '@src/client/interfaces';
import Text from '@src/components/general/Texts/Text/Text';
import client from '@src/client';
import { ModalEnum } from '@src/interfaces/modals';
import { useNuggftV1, useTransactionManager } from '@src/contracts/useContract';
import web3 from '@src/web3';
import { Address } from '@src/classes/Address';
import List from '@src/components/general/List/List';

import styles from './ViewingNugg.styles';

interface ExtraData {
    tokenId: string;
    isOwner: boolean;
}

interface Props extends ExtraData {
    items: LiveNuggItem[];
    tokenId: string;
}

const Item: FC<{ item: LiveNuggItem; extraData: ExtraData }> = ({ item, extraData }) => {
    const openModal = client.modal.useOpenModal();

    const provider = web3.hook.usePriorityProvider();
    const sender = web3.hook.usePriorityAccount();

    const nuggft = useNuggftV1(provider);

    const { send } = useTransactionManager();

    return (
        <div style={styles.itemListItem}>
            <div style={globalStyles.centeredSpaceBetween}>
                <TokenViewer
                    tokenId={item.id}
                    style={styles.listItemSvg}
                    // data={item.dotnuggRawCache}
                />
                <Text type="text">{parseTokenId(item.id)}</Text>
            </div>
            {Number(item.feature) !== constants.FEATURE_BASE &&
                extraData.isOwner &&
                (!item.activeSwap ? (
                    <Button
                        label="Sell"
                        buttonStyle={styles.itemListButton}
                        leftIcon={<IoPricetagsOutline color={Colors.white} />}
                        textStyle={styles.itemListButtonText}
                        type="text"
                        onClick={() => {
                            openModal({
                                type: ModalEnum.Sell,
                                tokenId: item.id,
                                tokenType: 'item',
                                sellingNuggId: extraData.tokenId,
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
                            if (item.activeSwap && sender)
                                void send(
                                    nuggft.populateTransaction.claim(
                                        [formatItemSwapIdForSend(item.activeSwap).sellingNuggId],
                                        [Address.ZERO.hash],
                                        [sender],
                                        [formatItemSwapIdForSend(item.activeSwap).itemId],
                                    ),
                                );
                        }}
                    />
                ))}
        </div>
    );
};

const ItemList: FunctionComponent<Props> = ({ items, tokenId, isOwner }) => {
    return (
        <List
            style={{ padding: '1rem' }}
            data={sortByField([...items], 'feature', false)}
            RenderItem={Item}
            extraData={{ tokenId, isOwner }}
            action={() => undefined}
        />
    );
};

export const ItemListPhone: FunctionComponent<Props> = ({ items, tokenId, isOwner }) => {
    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                width: '80%',
                alignItems: 'center',
                // justifyContent: 'center',
            }}
        >
            {items.map((x) => (
                <Item item={x} extraData={{ tokenId, isOwner }} />
            ))}
        </div>
    );
};

export default ItemList;
