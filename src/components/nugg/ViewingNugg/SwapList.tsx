import { Web3Provider } from '@ethersproject/providers';
import React, { FunctionComponent, useMemo } from 'react';

import { LiveItem } from '@src/client/hooks/useLiveItem';
import { LiveNugg, LiveSwap } from '@src/client/hooks/useLiveNugg';
import Text from '@src/components/general/Texts/Text/Text';
import Colors from '@src/lib/colors';
import { Address } from '@src/classes/Address';
import { CONTRACTS } from '@src/web3/config';
import StickyList from '@src/components/general/List/StickyList';
import web3 from '@src/web3';
import Button from '@src/components/general/Buttons/Button/Button';
import CurrencyText from '@src/components/general/Texts/CurrencyText/CurrencyText';
import { fromEth } from '@src/lib/conversion';
import client from '@src/client';
import { ListRenderItemProps } from '@src/components/general/List/List';
import { Chain } from '@src/web3/core/interfaces';
import { TokenId } from '@src/client/router';

import styles from './ViewingNugg.styles';

type SwapListProps = {};

const SwapList: FunctionComponent<SwapListProps> = ({}) => {
    const chainId = web3.hook.usePriorityChainId();
    const provider = web3.hook.usePriorityProvider();
    const lastView__tokenId = client.live.lastView__tokenId();

    const { token, epoch } = client.hook.useLiveToken(lastView__tokenId);

    const listData = useMemo(() => {
        let res = [];
        let tempSwaps = token?.swaps ? [...token?.swaps] : [];
        if (token?.activeSwap.id) {
            res.push({ title: 'Ongoing Sale', items: [token.activeSwap] });
            //@ts-ignore
            tempSwaps = tempSwaps.smartRemove(token.activeSwap, 'id');
        }
        if (
            token?.swaps?.find((swap) => swap.endingEpoch === null) &&
            lastView__tokenId.startsWith('item-')
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
    }, [token]);

    return (
        <StickyList
            data={listData}
            TitleRenderItem={SwapTitle}
            ChildRenderItem={SwapItem}
            extraData={{ chainId, provider, token, epoch, tokenId: lastView__tokenId }}
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

const SwapItem: FunctionComponent<
    ListRenderItemProps<
        LiveSwap,
        {
            chainId: Chain;
            provider: Web3Provider;
            token: LiveNugg | LiveItem;
            epoch: number;
            tokenId: TokenId;
        }
    >
> = ({ item, index, extraData }) => {
    const awaitingBid = item?.endingEpoch === null;
    const ens = web3.hook.usePriorityAnyENSName(extraData?.provider, item.owner.id);

    const blocknum = client.live.blocknum();
    return (
        <div style={{ padding: '.25rem 1rem' }}>
            <Button
                key={index}
                buttonStyle={styles.swap}
                onClick={() => client.actions.routeTo(extraData.tokenId, false)}
                rightIcon={
                    <>
                        <div style={styles.swapButton}>
                            <Text>
                                {awaitingBid
                                    ? 'Awaiting bid!'
                                    : `Swap ending in ${item.epoch.endblock - blocknum} blocks`}
                            </Text>
                            <CurrencyText image="eth" value={+fromEth(item.eth)} />
                        </div>
                        <div>
                            <Text
                                type="text"
                                size="smaller"
                                textStyle={{
                                    color: Colors.textColor,
                                }}
                            >
                                {awaitingBid
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
                                item.owner.id === CONTRACTS[extraData?.chainId]?.NuggftV1
                                    ? 'NuggftV1'
                                    : extraData?.token
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
