import React, { FC, useEffect, useState } from 'react';
import { animated, config as springConfig, useSpring } from '@react-spring/web';
import { IoAdd, IoCheckmarkDoneOutline, IoRemove } from 'react-icons/io5';
import { t } from '@lingui/macro';

import useLifecycle from '@src/client/hooks/useLifecycle';
import List, { ListRenderItemProps } from '@src/components/general/List/List';
import client from '@src/client';
import web3 from '@src/web3';
import lib from '@src/lib';
import Button from '@src/components/general/Buttons/Button/Button';
import Text from '@src/components/general/Texts/Text/Text';
import { Lifecycle } from '@src/client/interfaces';
import CurrencyText from '@src/components/general/Texts/CurrencyText/CurrencyText';
import { Chain } from '@src/web3/core/interfaces';
import useDistribution from '@src/client/hooks/useDistribution';
import useDimensions from '@src/client/hooks/useDimensions';
import { SwapData } from '@src/client/swaps';
import useAggregatedOffers from '@src/client/hooks/useAggregatedOffers';
import { CustomWeb3Provider } from '@src/web3/classes/CustomWeb3Provider';
import { EthInt } from '@src/classes/Fraction';

import styles from './RingAbout.styles';

type OfferExtraData = {
    chainId?: Chain;
    provider?: CustomWeb3Provider;
    type?: 'item' | 'nugg';
};

const OfferRenderItem: FC<
    ListRenderItemProps<SwapData['offers'][number], OfferExtraData, undefined>
> = ({ item, extraData }) => {
    const leader = web3.hook.usePriorityAnyENSName(
        extraData.type === 'nugg' ? 'nugg' : extraData.provider,
        item?.account || '',
    );

    const amount = client.usd.useUsdPair(item.eth);
    return (
        <div style={styles.offerAmount}>
            <CurrencyText image="eth" value={amount} stopAnimation />
            {leader ? (
                <Text type="text" size="smaller" textStyle={{ color: lib.colors.textColor }}>
                    {leader}
                </Text>
            ) : null}

            {item.txhash && (
                <Button
                    buttonStyle={styles.etherscanBtn}
                    onClick={() =>
                        extraData.chainId &&
                        item.txhash &&
                        web3.config.gotoEtherscan(extraData.chainId, 'tx', item.txhash)
                    }
                    rightIcon={<IoCheckmarkDoneOutline color={lib.colors.green} size={14} />}
                />
            )}
        </div>
    );
};

export default ({
    tokenId,
    onlyLeader,
}: {
    tokenId?: TokenId;
    sellingNuggId?: NuggId;
    onlyLeader?: boolean;
}) => {
    const swap = client.swaps.useSwap(tokenId);

    const [leader, ...others] = useAggregatedOffers(tokenId);
    const token = client.live.token(tokenId);
    const lifecycle = useLifecycle(token);
    const type = client.live.lastSwap.type();
    const chainId = web3.hook.usePriorityChainId();
    const provider = web3.hook.usePriorityProvider();
    const { screen: screenType } = useDimensions();

    const [open, setOpen] = useState(screenType === 'tablet');

    const leaderEth = client.usd.useUsdPair(leader?.eth);

    const { distribution, ownerEns } = useDistribution(swap);

    useEffect(() => {
        if (Array.isArray(others) && others.length === 0 && open && screenType !== 'tablet') {
            setOpen(false);
        }
    }, [open, others, screenType]);

    const springStyle = useSpring({
        ...styles.offersContainer,
        height: open ? (screenType === 'tablet' ? '100%' : '300px') : '0px',
        opacity: open ? 1 : 0,
        padding: open ? '0.75rem' : '0rem',
    });

    const [flashStyle] = useSpring(() => {
        return {
            to: [
                {
                    ...styles.leadingOfferAmount,
                    background: lib.colors.transparentWhite,
                },
                {
                    ...styles.leadingOfferAmount,
                    background: lib.colors.transparentLightGrey,
                },
            ],
            from: {
                ...styles.leadingOfferAmount,
                background: lib.colors.transparentLightGrey,
            },
            config: springConfig.molasses,
        };
    });

    const leaderEns = web3.hook.usePriorityAnyENSName(
        swap ? (swap.type === 'item' ? 'nugg' : provider) : undefined,
        (swap && leader?.account) || '',
    );

    return token &&
        lifecycle &&
        lifecycle !== Lifecycle.Concessions &&
        lifecycle !== Lifecycle.Bench &&
        lifecycle !== Lifecycle.Tryout &&
        lifecycle !== Lifecycle.Stands ? (
        <>
            {leader && chainId && token ? (
                <div style={styles.leadingOfferAmountContainer}>
                    <animated.div style={flashStyle}>
                        <div style={styles.leadingOfferAmountBlock}>
                            <CurrencyText
                                size="small"
                                image="eth"
                                textStyle={styles.leadingOffer}
                                value={leaderEth}
                            />
                        </div>
                        <div style={styles.leadingOfferAmountUser}>
                            <Text size="smaller" type="text">
                                {t`from`}
                            </Text>
                            <Text size="smaller">{leaderEns}</Text>
                        </div>
                        {leader.txhash && (
                            <Button
                                buttonStyle={styles.etherscanBtn}
                                onClick={() =>
                                    chainId &&
                                    leader.txhash &&
                                    web3.config.gotoEtherscan(chainId, 'tx', leader.txhash)
                                }
                                rightIcon={
                                    <IoCheckmarkDoneOutline color={lib.colors.green} size={14} />
                                }
                            />
                        )}
                    </animated.div>
                </div>
            ) : null}
            {!onlyLeader &&
                others.length > 0 &&
                (screenType === 'tablet' ? (
                    <Text
                        size="small"
                        type="text"
                        textStyle={{ color: 'white', ...styles.showMoreButton }}
                    >
                        {t`previous offers`}
                    </Text>
                ) : (
                    <>
                        <Button
                            size="small"
                            type="text"
                            textStyle={{ color: 'white' }}
                            label={open ? t`hide previous offers` : t`show previous offers`}
                            rightIcon={
                                <div style={styles.allOffersButton}>
                                    {open ? (
                                        <IoRemove color={lib.colors.nuggBlueText} size={14} />
                                    ) : (
                                        <IoAdd color={lib.colors.nuggBlueText} size={14} />
                                    )}
                                </div>
                            }
                            onClick={() => setOpen(!open)}
                            buttonStyle={styles.showMoreButton}
                        />
                        <animated.div style={springStyle}>
                            {distribution && (
                                <div>
                                    <Text>Distribution:</Text>
                                    <Text>
                                        {ownerEns}: {new EthInt(distribution.owner).number}
                                    </Text>
                                    <Text>Protocol: {new EthInt(distribution.proto).number}</Text>
                                    <Text>Staked: {new EthInt(distribution.stake).number}</Text>
                                </div>
                            )}
                            <List
                                data={others}
                                RenderItem={OfferRenderItem}
                                extraData={{ type, provider, chainId }}
                            />
                        </animated.div>
                    </>
                ))}
        </>
    ) : null;
};
