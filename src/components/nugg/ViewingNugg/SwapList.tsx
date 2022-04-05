import { Web3Provider } from '@ethersproject/providers';
import React, { FunctionComponent, useMemo } from 'react';
import { HiArrowRight } from 'react-icons/hi';
import { t } from '@lingui/macro';
import { useNavigate } from 'react-router-dom';

import Text from '@src/components/general/Texts/Text/Text';
import Colors from '@src/lib/colors';
import StickyList from '@src/components/general/List/StickyList';
import web3 from '@src/web3';
import CurrencyText from '@src/components/general/Texts/CurrencyText/CurrencyText';
import client from '@src/client';
import { ListRenderItemProps } from '@src/components/general/List/List';
import { Chain } from '@src/web3/core/interfaces';
import { TokenId } from '@src/client/router';
import lib from '@src/lib';
import { Address } from '@src/classes/Address';
import Button from '@src/components/general/Buttons/Button/Button';
import { LiveItemSwap, LiveSwap, LiveToken } from '@src/client/interfaces';

import styles from './ViewingNugg.styles';

const SwapTitle = ({ title }: { title: string }) => {
    return (
        <div style={{ display: 'flex' }}>
            <Text textStyle={styles.listTitle}>{title}</Text>
        </div>
    );
};

const SwapDesc = ({ item, epoch }: { item: LiveSwap; epoch: number }) => {
    const blocknum = client.live.blocknum();

    return epoch && blocknum ? (
        <Text textStyle={{ color: lib.colors.primaryColor }}>
            {/* eslint-disable-next-line no-nested-ternary */}
            {!item.epoch
                ? t`Awaiting bid!`
                : item.epoch.id < epoch
                ? t`Swap is over`
                : t`Swap ending in ${item.epoch.endblock - blocknum} blocks`}
        </Text>
    ) : null;
};

const SwapItem: FunctionComponent<
    ListRenderItemProps<
        LiveSwap,
        {
            chainId: Chain;
            provider: Web3Provider;
            token: LiveToken;
            epoch: number;
            tokenId: TokenId;
        },
        undefined
    >
> = ({ item, index, extraData }) => {
    const ownerEns = web3.hook.usePriorityAnyENSName(
        item.type === 'item' ? 'nugg' : extraData?.provider,
        item.owner || '',
    );

    const leaderEns = web3.hook.usePriorityAnyENSName(
        item.type === 'item' ? 'nugg' : extraData?.provider,
        item.leader,
    );

    const epoch = client.live.epoch.id();

    const navigate = useNavigate();
    return epoch ? (
        <div style={{ padding: '.25rem 1rem' }}>
            <div
                key={index}
                style={{
                    ...styles.swap,
                    background:
                        // eslint-disable-next-line no-nested-ternary
                        !item.epoch
                            ? lib.colors.gradient
                            : item.epoch.id < extraData.epoch
                            ? lib.colors.gradient3
                            : lib.colors.gradient2,
                }}
            >
                <div
                    style={{
                        ...styles.swapButton,
                    }}
                >
                    <SwapDesc item={item} epoch={epoch} />
                    <CurrencyText image="eth" value={item.eth.decimal.toNumber()} />
                </div>
                <div style={{ display: 'flex' }}>
                    <div style={{ marginRight: '10px' }}>
                        <Text
                            type="text"
                            size="smaller"
                            textStyle={{
                                color: Colors.textColor,
                            }}
                        >
                            {t`Sold by`}
                        </Text>
                        <Text
                            textStyle={{
                                color: 'white',
                            }}
                        >
                            {ownerEns}
                        </Text>
                    </div>
                    <div
                        style={{
                            justifyContent: 'center',
                            display: 'flex',
                            alignItems: 'center',
                            marginRight: '10px',
                        }}
                    >
                        <HiArrowRight color={lib.colors.primaryColor} />
                    </div>

                    {
                        // if this swap is awaiting a bid
                        item.endingEpoch === null ||
                        // if this swap is a minting swap and no one has bid on it
                        (item.owner === Address.ZERO.hash && item.leader === Address.ZERO.hash) ? (
                            <> </>
                        ) : (
                            <div>
                                <Text
                                    type="text"
                                    size="smaller"
                                    textStyle={{
                                        color: Colors.textColor,
                                    }}
                                >
                                    {item.endingEpoch >= epoch ? t`Leader` : t`Buyer`}
                                </Text>
                                <Text
                                    textStyle={{
                                        color: 'white',
                                    }}
                                >
                                    {leaderEns}
                                </Text>
                            </div>
                        )
                    }
                    {(!item.endingEpoch || epoch <= item.endingEpoch) && (
                        <Button label={t`goto swap`} onClick={() => navigate(`/swap/${item.id}`)} />
                    )}
                </div>
            </div>

            <div />
        </div>
    ) : null;
};

const SwapList: FunctionComponent<{ tokenId: TokenId | undefined }> = ({ tokenId }) => {
    const chainId = web3.hook.usePriorityChainId();
    const provider = web3.hook.usePriorityProvider();
    const token = client.live.token(tokenId);
    const epoch = client.live.epoch.id();

    const listData = useMemo(() => {
        const res: { title: string; items: LiveSwap[] }[] = [];
        let tempSwaps = token?.swaps ? [...token.swaps] : [];
        if (token && token.activeSwap && token.activeSwap.id) {
            // res.push({ title: 'Ongoing Sale', items: [token.activeSwap] });
            tempSwaps = tempSwaps.smartRemove(token.activeSwap, 'id');
        }
        if (
            token &&
            tokenId &&
            (token?.swaps as LiveSwap[]).find((swap) => swap.endingEpoch === null) &&
            token.type === 'item'
        ) {
            const tempTemp: LiveItemSwap[] = [] as LiveItemSwap[];

            tempSwaps = tempTemp.filter((x) => !x.isTryout);
        }
        res.push({
            title: 'Previous Sales',
            items: tempSwaps,
        });

        return res;
    }, [token, tokenId]);

    return chainId && provider && epoch && token && tokenId ? (
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%' }}>
            <StickyList
                data={listData}
                TitleRenderItem={SwapTitle}
                ChildRenderItem={React.memo(SwapItem)}
                extraData={{ chainId, provider, token, epoch, tokenId }}
                style={styles.stickyList}
                styleRight={styles.stickyListRight}
            />
        </div>
    ) : null;
};

export default SwapList;
