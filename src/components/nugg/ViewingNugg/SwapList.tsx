import { Web3Provider } from '@ethersproject/providers';
import React, { FunctionComponent, useMemo } from 'react';

import { LiveItem } from '@src/client/hooks/useLiveItem';
import { LiveNugg } from '@src/client/hooks/useLiveNugg';
import Text from '@src/components/general/Texts/Text/Text';
import { isUndefinedOrNullOrObjectEmpty, isUndefinedOrNullOrStringEmpty } from '@src/lib';
import Colors from '@src/lib/colors';
import { Address } from '@src/classes/Address';
import { CONTRACTS } from '@src/web3/config';
import StickyList from '@src/components/general/List/StickyList';
import web3 from '@src/web3';
import Button from '@src/components/general/Buttons/Button/Button';
import CurrencyText from '@src/components/general/Texts/CurrencyText/CurrencyText';
import { fromEth } from '@src/lib/conversion';
import client from '@src/client';
import { TokenId } from '@src/client/router';

import styles from './ViewingNugg.styles';

type SwapListProps = {
    chainId: number;
    provider: Web3Provider;
    swaps: NL.GraphQL.Fragments.Swap.Thumbnail[];
    token: LiveNugg | LiveItem;
    tokenIsItem: boolean;
    tokenId: TokenId;
};

const SwapList: FunctionComponent<SwapListProps> = ({
    chainId,
    provider,
    swaps,
    token,
    tokenIsItem,
    tokenId,
}) => {
    const listData = useMemo(() => {
        let res = [];
        let tempSwaps = swaps ? [...swaps] : [];
        if (!isUndefinedOrNullOrStringEmpty(token?.activeSwap.id)) {
            res.push({ title: 'Ongoing Sale', items: [token.activeSwap] });
            //@ts-ignore
            tempSwaps = tempSwaps.smartRemove(token.activeSwap, 'id');
        }
        if (
            !isUndefinedOrNullOrObjectEmpty(swaps?.find((swap) => swap.endingEpoch === null)) &&
            tokenIsItem
        ) {
            let tempTemp = [];
            let waiting = tempSwaps.reduce((acc, swap) => {
                if (swap.endingEpoch === null) {
                    acc.push(swap);
                } else {
                    tempTemp.push(swap);
                }
                return acc;
            }, []);
            tempSwaps = tempTemp;
            res.push({
                title: 'Awaiting An Offer',
                items: waiting,
            });
        }
        res.push({
            title: 'Previous Sales',
            items: tempSwaps,
        });

        return res;
    }, [swaps, token, tokenIsItem]);

    return (
        <StickyList
            data={listData}
            TitleRenderItem={SwapTitle}
            ChildRenderItem={SwapItem}
            extraData={[chainId, provider, token?.activeSwap?.id, tokenIsItem, tokenId]}
            style={styles.stickyList}
            styleRight={styles.stickyListRight}
        />
    );
};

const SwapTitle = ({ title }) => {
    return (
        <div style={{ display: 'flex' }}>
            <Text textStyle={styles.listTitle}>{title}</Text>
        </div>
    );
};

const SwapItem = ({ item, index, extraData }) => {
    const awaitingBid = item?.endingEpoch === null;
    const ens = web3.hook.usePriorityAnyENSName(extraData[1], item.owner.id);

    const router = client.router.useRouter();

    return (
        <div style={{ padding: '.25rem 1rem' }}>
            <Button
                key={index}
                buttonStyle={styles.swap}
                onClick={() => router.routeTo(extraData[4], false)}
                rightIcon={
                    <>
                        <div style={styles.swapButton}>
                            <Text>
                                {awaitingBid
                                    ? 'Awaiting bid!'
                                    : item.num === '0'
                                    ? 'Mint'
                                    : `Swap #${item.num}`}
                            </Text>
                            <CurrencyText image="eth" value={item.eth ? +fromEth(item.eth) : 0} />
                        </div>
                        <div>
                            <Text
                                type="text"
                                size="smaller"
                                textStyle={{
                                    color: Colors.textColor,
                                }}
                            >
                                {awaitingBid || item.id === extraData[2]
                                    ? 'On sale by'
                                    : item.leader.id === item.owner.id
                                    ? 'Reclaimed by'
                                    : 'Purchased from'}
                            </Text>
                            <Text
                                textStyle={{
                                    color: 'white',
                                }}
                            >
                                {item.owner.id === Address.ZERO.hash ||
                                item.owner.id === CONTRACTS[extraData[0]].NuggftV1
                                    ? 'NuggftV1'
                                    : extraData[3]
                                    ? `Nugg #${item.owner.id}`
                                    : ens}
                            </Text>
                        </div>
                    </>
                }
            />
        </div>
    );
};
export default SwapList;
