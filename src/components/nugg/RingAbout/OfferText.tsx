import React, { FunctionComponent, useMemo } from 'react';
import { t } from '@lingui/macro';

import Text from '@src/components/general/Texts/Text/Text';
import lib from '@src/lib';
import state from '@src/state';
import client from '@src/client';
import { Lifecycle } from '@src/client/interfaces';
import { useNuggftV1 } from '@src/contracts/useContract';
import useAsyncState from '@src/hooks/useAsyncState';
import { EthInt } from '@src/classes/Fraction';
import CurrencyText from '@src/components/general/Texts/CurrencyText/CurrencyText';
import Loader from '@src/components/general/Loader/Loader';
import { Address } from '@src/classes/Address';
import web3 from '@src/web3';

import styles from './RingAbout.styles';

type Props = Record<string, unknown>;

const OfferText: FunctionComponent<Props> = () => {
    const tokenId = client.live.lastSwap.tokenId();
    const token = client.live.token(tokenId);

    const screenType = state.app.select.screenType();

    const hasBids = client.live.offers(tokenId).length !== 0;

    const text = useMemo(() => {
        if (!token) return '';
        if (token.lifecycle === Lifecycle.Tryout) {
            return t`Select a nugg to buy this item from`;
        }
        if (token.lifecycle === Lifecycle.Deck || token.lifecycle === Lifecycle.Bat) {
            return hasBids ? t`Highest offer` : t`Place the first offer!`;
        }
        if (token.lifecycle === Lifecycle.Bench) {
            return t`Place offer to begin auction`;
        }
        if (token.lifecycle === Lifecycle.Shower) {
            return hasBids ? t`Winner` : t`This sale is over`;
        }
        return '';
    }, [token, hasBids]);

    return tokenId && token && token.lifecycle === 'bunt' ? (
        <BuntOfferText tokenId={tokenId} />
    ) : (
        <Text
            textStyle={{
                ...styles.title,
                ...(screenType === 'phone' && {
                    color: lib.colors.nuggBlueText,
                }),
            }}
        >
            {text}
        </Text>
    );
};

const BuntOfferText = ({ tokenId }: { tokenId: string }) => {
    const nuggft = useNuggftV1();
    const token = client.live.token(tokenId);
    const provider = web3.hook.usePriorityProvider();

    const vfo = useAsyncState(() => {
        if (token && provider && tokenId && token.lifecycle === Lifecycle.Bunt) {
            return nuggft
                .connect(provider)
                ['vfo(address,uint160)'](Address.NULL.hash, tokenId)
                .then((x) => {
                    return new EthInt(x);
                });
        }
        return undefined;
    }, [token, nuggft, tokenId, provider]);
    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {vfo ? (
                <CurrencyText textStyle={styles.title} value={vfo?.number || 0} />
            ) : (
                <>
                    <Loader color="white" />
                    <Text
                        textStyle={{
                            ...styles.title,
                        }}
                    >
                        calculating
                    </Text>
                </>
            )}
            <Text
                textStyle={{
                    ...styles.title,

                    marginRight: '3px',
                }}
            >
                starting offer
            </Text>
        </div>
    );
};

export default OfferText;
