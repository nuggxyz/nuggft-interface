import { animated, config as springConfig, useSpring } from '@react-spring/web';
import React, { FunctionComponent, useMemo } from 'react';
import { IoOpenOutline } from 'react-icons/io5';
import { t } from '@lingui/macro';

import lib from '@src/lib';
import CurrencyText from '@src/components/general/Texts/CurrencyText/CurrencyText';
import Text from '@src/components/general/Texts/Text/Text';
import { Lifecycle, OfferData } from '@src/client/interfaces';
import web3 from '@src/web3';
import client from '@src/client';
import Button from '@src/components/general/Buttons/Button/Button';

import styles from './RingAbout.styles';

type Props = Record<string, unknown>;

const HighestOffer: FunctionComponent<Props> = () => {
    const tokenId = client.live.lastSwap.tokenId();
    const leader = client.live.offers(tokenId).first() as unknown as OfferData;
    const token = client.live.token(tokenId);

    const chainId = web3.hook.usePriorityChainId();
    const provider = web3.hook.usePriorityProvider();
    // const tx = web3.hook.usePriorityTx(leader?.txhash || '');
    const ens = web3.hook.usePriorityAnyENSName(
        token && token.type === 'item' ? 'nugg' : provider,
        leader?.user || '',
    );

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

    const shouldShow = useMemo(() => {
        if (
            chainId &&
            token &&
            leader &&
            token.lifecycle !== Lifecycle.Bench &&
            token.lifecycle !== Lifecycle.Tryout &&
            token.lifecycle !== Lifecycle.Stands
        ) {
            if (token.type === 'item') {
                return token.activeSwap?.owner.toLowerCase() !== leader.user.toLowerCase();
            }
            return true;
        }
        return false;
    }, [token, leader, chainId]);

    return shouldShow ? (
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
                    <Text size="smaller">{ens}</Text>
                </div>
                <Button
                    buttonStyle={styles.etherscanBtn}
                    onClick={() =>
                        chainId && web3.config.gotoEtherscan(chainId, 'tx', leader.txhash)
                    }
                    rightIcon={<IoOpenOutline color={lib.colors.nuggBlueText} size={14} />}
                />
            </animated.div>
        </div>
    ) : null;
};

export default HighestOffer;
