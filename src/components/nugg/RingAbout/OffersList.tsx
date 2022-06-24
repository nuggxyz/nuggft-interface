import React, { FC, useEffect, useState } from 'react';
import { animated, config as springConfig, useSpring } from '@react-spring/web';
import { IoAdd, IoCheckmarkDoneOutline, IoRemove } from 'react-icons/io5';
import { t } from '@lingui/macro';

import useLifecycle from '@src/client/hooks/useLifecycle';
import client from '@src/client';
import web3 from '@src/web3';
import lib from '@src/lib';
import Button from '@src/components/general/Buttons/Button/Button';
import Text from '@src/components/general/Texts/Text/Text';
import { Lifecycle, OfferData } from '@src/client/interfaces';
import CurrencyText from '@src/components/general/Texts/CurrencyText/CurrencyText';
import useDimensions from '@src/client/hooks/useDimensions';
import { Fraction } from '@src/classes/Fraction';
import SimpleList, { SimpleListRenderItemProps } from '@src/components/general/List/SimpleList';

import styles from './RingAbout.styles';

const OfferRenderItem: FC<SimpleListRenderItemProps<OfferData, undefined, undefined>> = ({
    item,
}) => {
    const provider = web3.hook.usePriorityProvider();
    const leader = client.ens.useEnsOrNuggId(provider, item.account);

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
                        item.txhash &&
                        web3.config.gotoEtherscan(web3.config.DEFAULT_CHAIN, 'tx', item.txhash)
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
    const token = client.live.token(tokenId);

    const swap = React.useMemo(() => {
        return token?.activeSwap;
    }, [token?.activeSwap]);

    const [leader, ...others] = client.live.offers(tokenId);
    const lifecycle = useLifecycle(tokenId);
    const chainId = web3.hook.usePriorityChainId();
    const provider = web3.hook.usePriorityProvider();
    const { screen: screenType, isPhone } = useDimensions();

    const [open, setOpen] = useState(screenType === 'tablet');

    const leaderEth = client.usd.useUsdPair(leader?.eth);

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
        pointerEvents: open ? ('auto' as const) : ('none' as const),
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
        (swap && leader?.account) || undefined,
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
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'row',
                                justifyContent: 'center',
                                alignItems: 'flex-between',
                                background: lib.colors.transparentWhite,
                                borderRadius: lib.layout.borderRadius.smallish,
                                padding: '.5rem .6rem',
                                marginRight: '.5rem',
                            }}
                        >
                            <CurrencyText
                                size="small"
                                image="eth"
                                textStyle={{
                                    ...styles.leadingOffer,
                                    ...(isPhone && { color: lib.colors.primaryColor }),
                                }}
                                value={leaderEth}
                            />
                            {leader.incrementX64 && (
                                <Text
                                    textStyle={{
                                        background: isPhone
                                            ? lib.colors.primaryColor
                                            : lib.colors.nuggBlueText,
                                        color: 'white',
                                        borderRadius: lib.layout.borderRadius.medium,
                                        padding: '.15rem .25rem',
                                        fontWeight: lib.layout.fontWeight.thicc,
                                        marginLeft: 5,
                                    }}
                                    size="smaller"
                                >
                                    +{Fraction.fromX64(leader.incrementX64).percentString(0)}
                                </Text>
                            )}
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
                            {/* {distribution && (
                                <div>
                                    <Text>Distribution:</Text>
                                    <Text>
                                        {ownerEns}: {new EthInt(distribution.owner).number}
                                    </Text>
                                    <Text>Protocol: {new EthInt(distribution.proto).number}</Text>
                                    <Text>Staked: {new EthInt(distribution.stake).number}</Text>
                                </div>
                            )} */}
                            <SimpleList
                                data={others}
                                RenderItem={OfferRenderItem}
                                extraData={undefined}
                            />
                        </animated.div>
                    </>
                ))}
        </>
    ) : null;
};
