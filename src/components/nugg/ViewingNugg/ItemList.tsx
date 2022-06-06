import React, { FC, FunctionComponent } from 'react';
import { IoArrowRedo, IoPricetagsOutline, IoSync } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';
import { t } from '@lingui/macro';

import TokenViewer from '@src/components/nugg/TokenViewer';
import lib, { formatItemSwapIdForSend, sortByField } from '@src/lib';
import constants from '@src/lib/constants';
import Button from '@src/components/general/Buttons/Button/Button';
import globalStyles from '@src/lib/globalStyles';
import { LiveNuggItem } from '@src/client/interfaces';
import Text from '@src/components/general/Texts/Text/Text';
import client from '@src/client';
import { ModalEnum } from '@src/interfaces/modals';
import {
    useNuggftV1,
    usePrioritySendTransaction,
    useTransactionManager2,
} from '@src/contracts/useContract';
import web3 from '@src/web3';
import { Address } from '@src/classes/Address';
import List from '@src/components/general/List/List';
import Label from '@src/components/general/Label/Label';
import { buildTokenIdFactory } from '@src/prototypes';

import styles from './ViewingNugg.styles';

interface ExtraData {
    tokenId: NuggId;
    isOwner: boolean;
}

interface Props extends ExtraData {
    items: LiveNuggItem[];
    tokenId: NuggId;
}

const Item: FC<{ item: LiveNuggItem; extraData: ExtraData }> = ({ item, extraData }) => {
    const openModal = client.modal.useOpenModal();

    const provider = web3.hook.usePriorityProvider();
    const sender = web3.hook.usePriorityAccount();

    const nuggft = useNuggftV1(provider);

    const { send, hash } = usePrioritySendTransaction();

    useTransactionManager2(provider, hash);

    return (
        <div style={styles.itemListItem}>
            <div style={globalStyles.centeredSpaceBetween}>
                <TokenViewer
                    tokenId={item.tokenId}
                    style={styles.listItemSvg}
                    // data={item.dotnuggRawCache}
                />
                <Text type="text">{item.tokenId.toPrettyId()}</Text>
            </div>
            {Number(item.feature) !== constants.FEATURE_BASE &&
                extraData.isOwner &&
                (!item.activeSwap ? (
                    <Button
                        label="Sell"
                        buttonStyle={styles.itemListButton}
                        leftIcon={<IoPricetagsOutline color={lib.colors.white} />}
                        textStyle={styles.itemListButtonText}
                        type="text"
                        onClick={() => {
                            openModal(
                                buildTokenIdFactory({
                                    modalType: ModalEnum.Sell as const,
                                    tokenId: item.tokenId,
                                    sellingNuggId: extraData.tokenId,
                                }),
                            );
                        }}
                    />
                ) : (
                    <Button
                        label="Reclaim"
                        buttonStyle={styles.itemListButton}
                        leftIcon={<IoSync color={lib.colors.white} />}
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

// const SwapButton = ({
//     item,
//     epoch,
//     tokenId,
// }: {
//     item: LiveSwap | undefined;
//     epoch: number;
//    tokenId: string;
// }) => {

//     const navigate = useNavigate()

//     if (!item) return null;

//     return (item.type === 'item' && item.isTryout) ||
//         !item.endingEpoch ||
//         (!isUndefinedOrNull(item.epoch) && epoch <= item.endingEpoch) ? (
//         <Button
//             buttonStyle={styles.goToSwap}
//             textStyle={{
//                 ...styles.goToSwapGradient,
//                 background: !item.epoch ? lib.colors.gradient : lib.colors.gradient3,
//                 paddingRight: '.5rem',
//             }}
//             label={t`Go to swap`}
//             rightIcon={
//                 <IoArrowRedo
//                     color={!item.epoch ? lib.colors.gradientGold : lib.colors.gradientPink}
//                 />
//             }
//             onClick={() => navigate(`/swap/${tokenId}`)}
//         />
//     ) : null;
// };

export const ItemPhone: FC<{ item: LiveNuggItem; isOwner: boolean; nuggId: NuggId }> = ({
    item,
    isOwner,
    nuggId,
}) => {
    const navigate = useNavigate();
    const openModal = client.modal.useOpenModal();
    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                position: 'relative',

                width: '140px',
                height: '140px',

                flexDirection: 'column',
                justifyContent: 'center',
                marginBottom: '1.5rem',
                background: item.activeSwap
                    ? lib.colors.gradient3Transparent
                    : lib.colors.transparentWhite,
                borderRadius: lib.layout.borderRadius.mediumish,
            }}
        >
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '.3rem',
                    borderRadius: lib.layout.borderRadius.large,
                    position: 'absolute',
                    top: '.1rem',
                    right: '.1rem',
                    paddingBottom: 5,
                }}
            >
                <Label
                    type="text"
                    size="small"
                    textStyle={{
                        color: lib.colors.transparentDarkGrey,
                        // marginLeft: '.5rem',
                        fontSize: '10px',
                        fontWeight: 'bold',
                        // paddingBottom: 5,
                        position: 'relative',
                    }}
                    text={item.tokenId.toPrettyId()}
                />
            </div>

            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '.3rem',
                    borderRadius: lib.layout.borderRadius.large,
                    position: 'absolute',
                    top: '.1rem',
                    left: '.1rem',
                    paddingBottom: 5,
                }}
            >
                <Label
                    type="text"
                    size="small"
                    textStyle={{
                        color: lib.colors.transparentDarkGrey,
                        // marginLeft: '.5rem',
                        fontSize: '10px',
                        fontWeight: 'bold',
                        // paddingBottom: 5,
                        position: 'relative',
                    }}
                    text={item.displayed ? 'on' : 'off'}
                    leftDotColor={item.displayed ? lib.colors.green : lib.colors.red}
                />
            </div>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}
            >
                <TokenViewer
                    tokenId={item.tokenId}
                    style={{
                        height: '90px',
                        width: '90px',
                    }}
                />
            </div>

            {item.activeSwap ? (
                <div
                    style={{
                        position: 'absolute',
                        bottom: 5,
                        right: 2,
                        display: 'flex',
                        flexDirection: 'row',
                        width: '100%',
                        justifyContent: 'center',
                        alignItems: 'end',
                        textAlign: 'center',
                    }}
                >
                    <Button
                        buttonStyle={{
                            ...styles.goToSwap,
                        }}
                        textStyle={{
                            ...styles.goToSwapGradient,
                            padding: '.2rem',
                            fontSize: '10px',
                            fontWeight: lib.layout.fontWeight.thicc,
                        }}
                        label={t`for sale`}
                        rightIcon={<IoArrowRedo color={lib.colors.gradientPink} />}
                        onClick={() => navigate(`/swap/${item.tokenId}`)}
                    />
                </div>
            ) : (!item.displayed || item.count > 1) && isOwner ? (
                <div
                    style={{
                        position: 'absolute',
                        bottom: 5,
                        display: 'flex',
                        flexDirection: 'row',
                        width: '100%',
                        justifyContent: 'center',
                        alignItems: 'end',
                        textAlign: 'center',
                    }}
                >
                    <Button
                        buttonStyle={{
                            ...styles.goToSwap,
                        }}
                        textStyle={{
                            ...styles.goToSwapGradient,
                            padding: '.2rem',
                            fontSize: '10px',
                        }}
                        label={t`sell this item`}
                        // rightIcon={<IoArrowRedo color={lib.colors.gradientPink} />}
                        onClick={() => {
                            openModal(
                                buildTokenIdFactory({
                                    modalType: ModalEnum.Sell as const,
                                    tokenId: item.tokenId,
                                    sellingNuggId: nuggId,
                                }),
                            );
                        }}
                    />
                </div>
            ) : null}
            {/* {Number(item.feature) !== constants.FEATURE_BASE &&
                extraData.isOwner &&
                (!item.activeSwap ? (
                    <Button
                        label="Sell"
                        buttonStyle={{
                            borderRadius: lib.layout.borderRadius.large,
                            background: lib.colors.gradient2Transparent,
                            position: 'absolute',
                            right: '1rem',
                        }}
                        leftIcon={<IoPricetagsOutline color={lib.colors.white} />}
                        textStyle={{
                            color: lib.colors.white,
                            marginLeft: '.5rem',
                        }}
                        type="text"
                        onClick={() => {
                            openModal({
                                modalType: ModalEnum.Sell,
                                tokenId: item.id,
                                tokenType: 'item',
                                sellingNuggId: extraData.tokenId,
                            });
                        }}
                    />
                ) : (
                    <Button
                        label="Reclaim"
                        buttonStyle={{
                            borderRadius: lib.layout.borderRadius.large,
                            background: lib.colors.gradient2Transparent,
                            position: 'absolute',
                            right: '1rem',
                        }}
                        leftIcon={<IoSync color={lib.colors.white} />}
                        textStyle={{
                            color: lib.colors.white,
                            marginLeft: '.5rem',
                        }}
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
                ))} */}
        </div>
    );
};

export const ItemListPhone: FunctionComponent<{ tokenId: NuggId }> = ({ tokenId }) => {
    const token = client.live.token(tokenId);
    const address = web3.hook.usePriorityAccount();

    if (!token || !token?.isNugg()) return null;

    return (
        <div
            style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                width: '100%',
                display: 'flex',
                justifyContent: 'space-evenly',
                overflow: 'visible',
                marginTop: '1rem',
            }}
        >
            {[...token.items]
                .sort((a, b) => (a.feature < b.feature ? -1 : 1))
                .map((x, i) => (
                    <ItemPhone
                        item={x}
                        isOwner={token.owner === address}
                        nuggId={tokenId}
                        key={`${token.tokenId}-${i}`}
                    />
                ))}
        </div>
    );
};

export default ItemList;
