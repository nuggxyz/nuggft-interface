import React, { FC, FunctionComponent } from 'react';
import { IoPricetagsOutline, IoSync } from 'react-icons/io5';

import TokenViewer from '@src/components/nugg/TokenViewer';
import { createItemId, formatItemSwapIdForSend, parseTokenId, sortByField } from '@src/lib';
import constants from '@src/lib/constants';
import Button from '@src/components/general/Buttons/Button/Button';
import globalStyles from '@src/lib/globalStyles';
import Colors from '@src/lib/colors';
import List, { ListRenderItemProps } from '@src/components/general/List/List';
import { DefaultExtraData, LiveNuggItem } from '@src/client/interfaces';
import Text from '@src/components/general/Texts/Text/Text';
import client from '@src/client';
import { ModalEnum } from '@src/interfaces/modals';
import { useNuggftV1, useTransactionManager } from '@src/contracts/useContract';
import web3 from '@src/web3';
import { Address } from '@src/classes/Address';

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
    const openModal = client.modal.useOpenModal();

    const provider = web3.hook.usePriorityProvider();

    const nuggft = useNuggftV1(provider);

    const { send } = useTransactionManager();

    return (
        <div style={styles.itemListItem}>
            <div style={globalStyles.centeredSpaceBetween}>
                <TokenViewer
                    tokenId={createItemId((Number(item.feature) << 8) | item.position)}
                    style={styles.listItemSvg}
                    // data={item.dotnuggRawCache}
                />
                <Text type="text">
                    {parseTokenId(createItemId((Number(item.feature) << 8) | item.position))}
                </Text>

                {/* <Label
                    text={parseTokenId(createItemId((Number(item.feature) << 8) | item.position))}
                /> */}
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
                                tokenId: createItemId((item.feature << 8) | item.position),
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
                            if (item.activeSwap)
                                void send(
                                    nuggft.populateTransaction.claim(
                                        [formatItemSwapIdForSend(item.activeSwap).sellingNuggId],
                                        [Address.ZERO.hash],
                                        [extraData.sender],
                                        [formatItemSwapIdForSend(item.activeSwap).itemId],
                                    ),
                                );
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
            data={sortByField([...items], 'feature', false)}
            RenderItem={Item}
            extraData={{ sender, provider, chainId, tokenId, isOwner }}
            action={() => undefined}
        />
    );
};

export default ItemList;
