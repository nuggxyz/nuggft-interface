import React, { FC, FunctionComponent } from 'react';
import { IoPricetagsOutline, IoSync } from 'react-icons/io5';
import { Web3Provider } from '@ethersproject/providers';

import TokenViewer from '@src/components/nugg/TokenViewer';
import Label from '@src/components/general/Label/Label';
import {
    createItemId,
    formatItemSwapIdForSend,
    isUndefinedOrNullOrStringEmpty,
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
import { LiveNuggItem } from '@src/client/hooks/useLiveNugg';

import styles from './ViewingNugg.styles';

type Props = {
    items: LiveNuggItem[];
    chainId: number;
    provider: Web3Provider;
    address: string;
    tokenId: string;
};

const ItemList: FunctionComponent<Props> = ({ items, chainId, provider, address, tokenId }) => {
    return (
        <List
            style={{ padding: '1rem' }}
            data={sortByField(items, 'feature', false)}
            RenderItem={Item}
            extraData={[address, provider, chainId, tokenId]}
        />
    );
};

const Item: FC<ListRenderItemProps<LiveNuggItem>> = ({ item, extraData }) => {
    return (
        <div style={styles.itemListItem}>
            <div style={{ ...globalStyles.centeredSpaceBetween }}>
                <TokenViewer
                    tokenId={createItemId((item.feature << 8) | item.position)}
                    style={styles.listItemSvg}
                    // data={item.dotnuggRawCache}
                />

                <Label text={parseTokenId(createItemId((item.feature << 8) | item.position))} />
            </div>
            {+item.feature !== constants.FEATURE_BASE &&
                (isUndefinedOrNullOrStringEmpty(item.activeSwap) ? (
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
                                    type: 'StartItemSale',
                                    data: {
                                        tokenId: extraData[3],
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
                            WalletState.dispatch.claim({
                                provider: extraData[1],
                                chainId: extraData[2],
                                tokenId: formatItemSwapIdForSend(item.activeSwap).toString(),
                                address: padToAddress(extraData[3]),
                                senderAddress: extraData[0],
                            });
                        }}
                    />
                ))}
        </div>
    );
};

export default ItemList;
