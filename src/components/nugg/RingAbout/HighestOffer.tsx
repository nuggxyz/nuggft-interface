import { animated, config as springConfig, useSpring } from '@react-spring/web';
import React, { FunctionComponent, useEffect, useMemo } from 'react';

import lib from '@src/lib';
import CurrencyText from '@src/components/general/Texts/CurrencyText/CurrencyText';
import Text from '@src/components/general/Texts/Text/Text';
import { OfferData } from '@src/client/core';
import { EthInt } from '@src/classes/Fraction';
import web3 from '@src/web3';
import Button from '@src/components/general/Buttons/Button/Button';
import client from '@src/client';
import { Lifecycle } from '@src/client/hooks/useLiveToken';

import styles from './RingAbout.styles';

type Props = Record<string, unknown>;

const HighestOffer: FunctionComponent<Props> = () => {
    const tokenId = client.live.lastSwap.tokenId();
    const leader = client.live.offers(tokenId).first() as unknown as OfferData;
    const { lifecycle, token } = client.hook.useLiveToken(tokenId);
    // const type = client.live.lastSwap.type();
    // const lifecycle = client.live.activeLifecycle();
    // const token = useAsyncState(async () => {
    //     if (tokenId) {
    //         return (await client.static.token(tokenId)).token;
    //     }
    //     return undefined;
    // }, [tokenId]);

    const chainId = web3.hook.usePriorityChainId();
    const provider = web3.hook.usePriorityProvider();
    const tx = web3.hook.usePriorityTx(leader?.txhash || '');
    const ens = web3.hook.usePriorityAnyENSName(
        token && token.type === 'item' ? 'nugg' : provider,
        leader?.user || '',
    );

    const [flashStyle, api] = useSpring(() => {
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

    useEffect(() => {
        api.start({
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
        });
    }, [leader]);

    const shouldShow = useMemo(() => {
        if (
            chainId &&
            leader &&
            token &&
            lifecycle &&
            lifecycle &&
            lifecycle !== Lifecycle.Bench &&
            lifecycle !== Lifecycle.Tryout &&
            lifecycle !== Lifecycle.Stands
        ) {
            if (token.type === 'item') {
                return token.activeSwap?.owner.toLowerCase() !== leader.user.toLowerCase();
            }
            return true;
        }
        return false;
    }, [token, leader, chainId, lifecycle]);
    return shouldShow ? (
        <Button
            buttonStyle={styles.leadingOfferAmountContainer}
            onClick={() => chainId && web3.config.gotoEtherscan(chainId, 'tx', leader.txhash)}
            rightIcon={
                <animated.div style={flashStyle}>
                    <div style={styles.leadingOfferAmountBlock}>
                        <CurrencyText
                            stopAnimation
                            size="small"
                            image="eth"
                            textStyle={styles.leadingOffer}
                            value={leader?.eth?.decimal?.toNumber()}
                        />
                        {tx && (
                            <div style={{ display: 'flex' }}>
                                ⛽️
                                <CurrencyText
                                    stopAnimation
                                    decimals={0}
                                    size="smaller"
                                    forceGwei
                                    value={EthInt.fromGwei(tx.gasUsed).decimal.toNumber()}
                                />
                            </div>
                        )}
                    </div>
                    <div style={styles.leadingOfferAmountUser}>
                        <Text size="smaller" type="text">
                            from
                        </Text>
                        <Text size="smaller">{ens}</Text>
                    </div>
                </animated.div>
            }
        />
    ) : null;
};

export default HighestOffer;
