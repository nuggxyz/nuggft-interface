import React from 'react';

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
import useDimensions from '@src/client/hooks/useDimensions';
import lib from '@src/lib';
import Label from '@src/components/general/Label/Label';
import useLifecycleEnhanced from '@src/client/hooks/useLifecycleEnhanced';
import { useUsdPair } from '@src/client/usd';

import styles from './RingAbout.styles';

const OfferTextMobile = ({ tokenId }: { tokenId?: TokenId }) => {
    const token = client.live.token(tokenId);

    const swap = React.useMemo(() => {
        return token?.activeSwap;
    }, [token?.activeSwap]);
    const lifecycle = useLifecycleEnhanced(tokenId);

    const { isPhone } = useDimensions();

    // const hasBids = client.live.offers(tokenId).length !== 0;

    // const text = useMemo(() => {
    //     if (!token || !lifecycle) return '';
    //     if (lifecycle === Lifecycle.Tryout) {
    //         return t`Select a nugg to buy this item from`;
    //     }
    //     if (lifecycle === Lifecycle.Deck || lifecycle === Lifecycle.Bat) {
    //         return hasBids ? t`Highest offer` : t`Place the first offer!`;
    //     }
    //     if (lifecycle === Lifecycle.Bench) {
    //         return t`Place offer to begin auction`;
    //     }
    //     if (lifecycle === Lifecycle.Shower) {
    //         return hasBids ? t`Winner` : t`This sale is over`;
    //     }
    //     return '';
    // }, [token, hasBids, lifecycle]);

    const dynamicTextColor = React.useMemo(() => {
        if (isPhone && swap?.endingEpoch === null) {
            return lib.colors.primaryColor;
        }
        return lib.colors.white;
    }, [swap, isPhone]);

    return tokenId &&
        token &&
        (lifecycle?.lifecycle === 'bunt' || lifecycle?.lifecycle === 'bat') ? (
        <BuntOfferTextMobile tokenId={tokenId} />
    ) : (
        <>
            {lifecycle && (
                <Label
                    // type="text"
                    containerStyles={{
                        background: 'transparent',
                    }}
                    size="small"
                    textStyle={{
                        color: dynamicTextColor,

                        position: 'relative',
                    }}
                    text={lifecycle?.label}
                    leftDotColor={lifecycle.color}
                />
            )}
        </>
    );
};

export const BuntOfferTextMobile = ({ tokenId }: { tokenId: TokenId }) => {
    const nuggft = useNuggftV1();
    const token = client.live.token(tokenId);
    const lifecycle = useLifecycleEnhanced(tokenId);

    const provider = web3.hook.usePriorityProvider();

    const swap = React.useMemo(() => {
        return token?.activeSwap;
    }, [token?.activeSwap]);

    const vfo = useAsyncState(() => {
        if (token && provider && tokenId && lifecycle?.lifecycle === Lifecycle.Bunt) {
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
    const { isPhone } = useDimensions();

    const dynamicTextColor = React.useMemo(() => {
        if (isPhone && swap?.endingEpoch === null) {
            return lib.colors.primaryColor;
        }
        return lib.colors.white;
    }, [swap, isPhone]);

    const leader = React.useMemo(() => {
        return offers.first() as unknown as OfferData;
    }, [offers]);

    const leaderEns = web3.hook.usePriorityAnyENSName(
        token && token.type === 'item' ? 'nugg' : provider,
        leader?.user || '',
    );

    const leaderCurrency = useUsdPair(leader?.eth || vfo?.number || 0);

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
                marginTop: '-20px',
            }}
        >
            {lifecycle && (
                <Label
                    // type="text"
                    containerStyles={{
                        background: 'transparent',
                    }}
                    size="small"
                    textStyle={{
                        color: dynamicTextColor,

                        position: 'relative',
                    }}
                    text={lifecycle?.label}
                    leftDotColor={lifecycle.color}
                />
            )}
            <CurrencyText
                textStyle={{ color: dynamicTextColor, fontSize: '28px' }}
                // image="eth"
                value={leaderCurrency}
                // decimals={0}
            />
            <Text textStyle={{ fontSize: '13px', color: dynamicTextColor, marginTop: 5 }}>
                {`${
                    leader?.eth ? `${leaderEns || leader?.user || ''} is leading` : 'starting price'
                } | ${offers.length} offers`}
            </Text>
        </div>
    );
};

export default OfferTextMobile;
