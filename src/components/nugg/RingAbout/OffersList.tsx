import React, { FC, useEffect, useState } from 'react';
import { animated, config as springConfig, useSpring } from '@react-spring/web';
import { IoAdd, IoCheckmarkDoneOutline, IoRemove } from 'react-icons/io5';
import { t } from '@lingui/macro';
import { Web3Provider } from '@ethersproject/providers';

import useLifecycle from '@src/client/hooks/useLifecycle';
import List, { ListRenderItemProps } from '@src/components/general/List/List';
import client from '@src/client';
import web3 from '@src/web3';
import lib from '@src/lib';
import Button from '@src/components/general/Buttons/Button/Button';
import Text from '@src/components/general/Texts/Text/Text';
import { Lifecycle, OfferData } from '@src/client/interfaces';
import CurrencyText from '@src/components/general/Texts/CurrencyText/CurrencyText';
import { Chain } from '@src/web3/core/interfaces';
import useDistribution from '@src/client/hooks/useDistribution';
import useDimentions from '@src/client/hooks/useDimentions';

import styles from './RingAbout.styles';

type OfferExtraData = {
    chainId?: Chain;
    provider?: Web3Provider;
    type?: 'item' | 'nugg';
};

const OfferRenderItem: FC<ListRenderItemProps<OfferData, OfferExtraData, undefined>> = ({
    item,
    extraData,
}) => {
    const leader = web3.hook.usePriorityAnyENSName(
        extraData.type === 'nugg' ? 'nugg' : extraData.provider,
        item?.user || '',
    );
    return (
        <div style={styles.offerAmount}>
            <CurrencyText image="eth" value={item.eth.decimal.toNumber()} stopAnimation />
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

export default ({ tokenId, sellingNuggId }: { tokenId?: TokenId; sellingNuggId?: NuggId }) => {
    const offers = client.live.offers(tokenId);
    const token = client.live.token(tokenId);
    const lifecycle = useLifecycle(token);
    const type = client.live.lastSwap.type();
    const chainId = web3.hook.usePriorityChainId();
    const provider = web3.hook.usePriorityProvider();
    const { screen: screenType } = useDimentions();

    const [open, setOpen] = useState(screenType === 'tablet');

    const { leader, others, swap } = React.useMemo(() => {
        const tmp =
            token?.type === 'item'
                ? offers.filter((x) => {
                      return (
                          x.tokenId.isItemId() &&
                          x.sellingTokenId === (sellingNuggId || token.activeSwap?.owner)
                      );
                  })
                : [...offers];

        const theSwap =
            token?.type === 'item' && sellingNuggId
                ? token?.swaps.find((x) => x.owner === sellingNuggId)
                : token?.activeSwap;
        return {
            leader: tmp.shift(),
            others: tmp,
            swap: theSwap,
        };
    }, [offers, token, sellingNuggId]);

    const { distribution, ownerEns } = useDistribution(swap);

    useEffect(() => {
        if (offers && offers.length === 1 && open && screenType !== 'tablet') {
            setOpen(false);
        }
    }, [open, offers, screenType]);

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
        token ? (token.type === 'item' ? 'nugg' : provider) : undefined,
        (token && leader?.user) || '',
    );

    return token &&
        lifecycle &&
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
                                value={leader?.eth?.decimal?.toNumber()}
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
            {others.length > 0 &&
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
                                        {ownerEns}: {distribution.owner.number}
                                    </Text>
                                    <Text>Protocol: {distribution.proto.number}</Text>
                                    <Text>Staked: {distribution.stake.number}</Text>
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
