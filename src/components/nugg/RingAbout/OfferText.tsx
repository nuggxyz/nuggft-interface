import React, { useMemo } from 'react';
import { t } from '@lingui/macro';

import Text from '@src/components/general/Texts/Text/Text';
import client from '@src/client';
import { Lifecycle, OfferData } from '@src/client/interfaces';
import { useNuggftV1 } from '@src/contracts/useContract';
import useAsyncState from '@src/hooks/useAsyncState';
import { EthInt } from '@src/classes/Fraction';
import CurrencyText from '@src/components/general/Texts/CurrencyText/CurrencyText';
import Loader from '@src/components/general/Loader/Loader';
import { Address } from '@src/classes/Address';
import web3 from '@src/web3';
import useLifecycle from '@src/client/hooks/useLifecycle';
import useDimentions from '@src/client/hooks/useDimentions';

import styles from './RingAbout.styles';

const OfferText = ({ tokenId }: { tokenId?: TokenId }) => {
    const token = client.live.token(tokenId);
    const lifecycle = useLifecycle(token);

    const hasBids = client.live.offers(tokenId).length !== 0;

    const text = useMemo(() => {
        if (!token || !lifecycle) return '';
        if (lifecycle === Lifecycle.Tryout) {
            return t`Select a nugg to buy this item from`;
        }
        if (lifecycle === Lifecycle.Deck || lifecycle === Lifecycle.Bat) {
            return hasBids ? t`Highest offer` : t`Place the first offer!`;
        }
        if (lifecycle === Lifecycle.Bench) {
            return t`Place offer to begin auction`;
        }
        if (lifecycle === Lifecycle.Shower) {
            return hasBids ? t`Winner` : t`This sale is over`;
        }
        return '';
    }, [token, hasBids, lifecycle]);

    return tokenId && token && lifecycle === 'bunt' ? (
        <BuntOfferText tokenId={tokenId} />
    ) : (
        <Text
            textStyle={{
                ...styles.title,
            }}
        >
            {text}
        </Text>
    );
};

export const BuntOfferText = ({ tokenId }: { tokenId: TokenId }) => {
    const nuggft = useNuggftV1();
    const token = client.live.token(tokenId);
    const lifecycle = useLifecycle(token);

    const provider = web3.hook.usePriorityProvider();

    const vfo = useAsyncState(() => {
        if (token && provider && tokenId && lifecycle === Lifecycle.Bunt) {
            return nuggft
                .connect(provider)
                ['vfo(address,uint24)'](Address.NULL.hash, tokenId.toRawId())
                .then((x) => {
                    return new EthInt(x);
                });
        }
        return undefined;
    }, [token, nuggft, tokenId, provider]);

    const offers = client.live.offers(tokenId);

    const leader = React.useMemo(() => {
        return offers.first() as unknown as OfferData;
    }, [offers]);

    const leaderEns = web3.hook.usePriorityAnyENSName(
        token && token.type === 'item' ? 'nugg' : provider,
        leader?.user || '',
    );
    const { isPhone } = useDimentions();

    return !isPhone ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {vfo ? (
                <CurrencyText textStyle={styles.title} value={vfo?.number || 0} stopAnimation />
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
    ) : (
        <div
            style={{
                alignItems: 'center',
                display: 'flex',
                flexDirection: 'column',
                marginTop: '-40px',
            }}
        >
            <CurrencyText
                textStyle={{ color: 'white', fontSize: '28px' }}
                image="eth"
                value={leader?.eth?.number || vfo?.number || 0}
                decimals={0}
            />
            <Text textStyle={{ fontSize: '13px', color: 'white', marginTop: 5 }}>
                {`${
                    leader?.eth?.number
                        ? `${leaderEns || leader?.user} is leading`
                        : 'starting price'
                } | ${offers.length} offers`}
            </Text>
        </div>
    );
};

export default OfferText;
