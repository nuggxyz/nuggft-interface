import React, { FunctionComponent, MemoExoticComponent, useMemo } from 'react';
import { plural, t } from '@lingui/macro';

import lib, { parseTokenIdSmart } from '@src/lib';
import Text from '@src/components/general/Texts/Text/Text';
import TokenViewer from '@src/components/nugg/TokenViewer';
import web3 from '@src/web3';
import client from '@src/client';
import useTokenQuery from '@src/client/hooks/useTokenQuery';
import globalStyles from '@src/lib/globalStyles';
import { EthInt, Fraction } from '@src/classes/Fraction';
import TheRing from '@src/components/nugg/TheRing/TheRing';
import OfferButton from '@src/components/nugg/RingAbout/OfferButton';
import useLifecycle from '@src/client/hooks/useLifecycle';
import useRemaining from '@src/client/hooks/useRemaining';
import { Lifecycle, OfferData } from '@src/client/interfaces';
import CurrencyText from '@src/components/general/Texts/CurrencyText/CurrencyText';
import useAsyncState from '@src/hooks/useAsyncState';
import { useNuggftV1 } from '@src/contracts/useContract';
import { Address } from '@src/classes/Address';
import OffersList from '@src/components/nugg/RingAbout/OffersList';

import MyNuggActions from './MyNuggActions';
import SwapListPhone from './SwapListPhone';
import { ItemListPhone } from './ItemList';

type Props = { MobileBackButton?: MemoExoticComponent<() => JSX.Element> };

const Info = ({ tokenId }: { tokenId?: TokenId }) => {
    const token = client.live.token(tokenId);
    const totalNuggs = client.live.totalNuggs();

    const observedRarity = useMemo(() => {
        if (!token || token.type === 'nugg') return new Fraction(0);
        return new Fraction(token.count, totalNuggs);
    }, [token, totalNuggs]);

    return token && token.type === 'item' ? (
        <div
            style={{
                width: '100%',
                padding: '1rem 0rem',
                // margin: '.25rem 0rem',
                flexDirection: 'column',
                ...globalStyles.centered,
            }}
        >
            <Text>rarity: {(token.rarity.number * 10000).toFixed(0)} / 10k</Text>
            <Text>observed rarity: {(observedRarity.number * 10000).toFixed(0)} / 10k</Text>
        </div>
    ) : null;
};

const ActiveSwap = ({ tokenId }: { tokenId: TokenId }) => {
    const token = client.live.token(tokenId);
    const lifecycle = useLifecycle(token);
    const leader = client.live.offers(tokenId).first() as unknown as OfferData;

    const { minutes } = useRemaining(token?.activeSwap?.epoch);
    const provider = web3.hook.usePriorityProvider();

    const leaderEns = web3.hook.usePriorityAnyENSName(
        token && token.type === 'item' ? 'nugg' : provider,
        leader?.user || '',
    );
    const nuggft = useNuggftV1();

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
    return (
        <>
            <div style={{ width: '100%', padding: '0 40px', marginBottom: '20px' }}>
                <OfferButton tokenId={tokenId} inOverlay />
            </div>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-around',
                    width: '100%',
                    alignItems: 'center',
                }}
            >
                {leader && lifecycle === Lifecycle.Bench ? (
                    <div
                        style={{
                            alignItems: 'flex-end',
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                    >
                        <CurrencyText
                            textStyle={{
                                color: 'white',
                                fontSize: '28px',
                                textShadow: lib.layout.boxShadow.dark,
                            }}
                            image="eth"
                            value={leader?.eth?.number}
                            decimals={3}
                        />
                        <Text
                            textStyle={{
                                fontSize: '13px',
                                color: 'white',
                                textShadow: lib.layout.boxShadow.dark,
                            }}
                        >
                            {`${leaderEns || ''} is selling`}
                        </Text>
                    </div>
                ) : lifecycle === Lifecycle.Tryout &&
                  token &&
                  token.type === 'item' &&
                  token.tryout.min ? (
                    <div
                        style={{
                            alignItems: 'flex-end',
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                    >
                        <CurrencyText
                            textStyle={{
                                color: 'white',
                                fontSize: '28px',
                                textShadow: lib.layout.boxShadow.dark,
                            }}
                            image="eth"
                            value={token.tryout.min.eth.number || 0}
                            decimals={3}
                        />
                        <Text
                            textStyle={{
                                fontSize: '13px',
                                color: 'white',
                                textShadow: lib.layout.boxShadow.dark,
                            }}
                        >
                            {t`minimum price`}
                        </Text>
                    </div>
                ) : (
                    <div
                        style={{
                            alignItems: 'flex-start',
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                    >
                        <CurrencyText
                            textStyle={{
                                color: 'white',
                                fontSize: '28px',
                                textShadow: lib.layout.boxShadow.dark,
                            }}
                            image="eth"
                            value={leader?.eth?.number || vfo?.number || 0}
                            decimals={0}
                        />
                        <Text
                            textStyle={{
                                fontSize: '13px',
                                color: 'white',
                                textShadow: lib.layout.boxShadow.dark,
                            }}
                        >
                            {leaderEns ? `${leaderEns} is leading` : 'starting price'}
                        </Text>
                    </div>
                )}
                <div
                    style={{
                        alignItems: 'flex-end',
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    <Text
                        textStyle={{
                            fontSize: '13px',
                            color: 'white',
                            textShadow: lib.layout.boxShadow.dark,
                        }}
                    >
                        ending in about
                    </Text>
                    <Text
                        textStyle={{
                            color: 'white',
                            fontSize: '28px',
                            textShadow: lib.layout.boxShadow.dark,
                        }}
                    >{`${minutes} ${plural(minutes, {
                        1: 'minute',
                        other: 'minutes',
                    })}`}</Text>
                </div>
            </div>
            <div style={{ width: '100%', padding: '20px 10px ' }}>
                <OffersList tokenId={tokenId} />
            </div>
        </>
    );
};

const ViewingNuggPhone: FunctionComponent<Props> = () => {
    const epoch = client.live.epoch.id();

    const tokenId = client.viewscreen.useViewScreenTokenId();

    const sender = web3.hook.usePriorityAccount();

    const tokenQuery = useTokenQuery();

    React.useEffect(() => {
        if (tokenId) void tokenQuery(tokenId);
    }, [tokenId, tokenQuery]);

    // const chainId = web3.hook.usePriorityChainId();
    const provider = web3.hook.usePriorityProvider();

    const token = client.live.token(tokenId);

    return provider && epoch && tokenId && token ? (
        <>
            <div
                style={{
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    //   borderRadius: lib.layout.borderRadius.mediumish,
                    //   background: lib.colors.transparentGrey,
                    width: '100%',
                    alignItems: 'center',
                    justifyContent: 'start',
                    backdropFilter: 'blur(5px)',
                    WebkitBackdropFilter: 'blur(5px)',
                    height: '100%',
                    overflow: 'scroll',
                    //   paddingTop: '150px',
                    //   marginBottom: '400px',
                }}
            >
                <div
                    style={{
                        position: 'relative',
                        width: '100%',
                        top: 0,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'flex-end',
                        zIndex: 1000,
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            width: '100%',
                            height: '100%',
                            paddingTop: '20px',
                        }}
                    >
                        {token.activeSwap ? (
                            <div
                                style={{
                                    width: '100%',
                                    height: '375px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    // marginBottom: '-10px',
                                    marginTop: '-30px',
                                }}
                            >
                                <TheRing
                                    circleWidth={1000}
                                    strokeWidth={10}
                                    disableClick
                                    manualTokenId={tokenId}
                                    disableHover
                                    tokenStyle={{ width: '275px', height: '275px' }}
                                />
                            </div>
                        ) : (
                            <TokenViewer tokenId={tokenId} showcase disableOnClick />
                        )}
                    </div>
                </div>

                <Text
                    textStyle={{
                        textShadow: lib.layout.boxShadow.dark,
                        color: 'white',
                        padding: '1rem',
                        // background: darkmode
                        //     ? lib.colors.nuggBlueTransparent
                        //     : lib.colors.transparentGrey,
                        borderRadius: lib.layout.borderRadius.medium,
                    }}
                    size="larger"
                >
                    {tokenId && parseTokenIdSmart(tokenId)}
                </Text>

                {token.activeSwap && (
                    <>
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'flex-start',
                                alignItems: 'flex-start',
                                textAlign: 'left',
                                width: '100%',
                                padding: '10px',
                            }}
                        >
                            <Text
                                size="larger"
                                textStyle={{
                                    color: 'white',
                                    textShadow: lib.layout.boxShadow.dark,
                                }}
                            >
                                Active Swap
                            </Text>
                        </div>
                        <ActiveSwap tokenId={tokenId} />
                    </>
                )}

                {token.type === 'item' && (
                    <>
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'flex-start',
                                alignItems: 'flex-start',
                                textAlign: 'left',
                                width: '100%',
                                padding: '10px',
                            }}
                        >
                            <Text
                                size="larger"
                                textStyle={{
                                    color: 'white',
                                    textShadow: lib.layout.boxShadow.dark,
                                }}
                            >
                                Info
                            </Text>
                        </div>
                        <Info tokenId={tokenId} />{' '}
                    </>
                )}
                {token.type === 'nugg' && token.owner === sender && (
                    <>
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'flex-start',
                                alignItems: 'flex-start',
                                textAlign: 'left',
                                width: '100%',
                                padding: '10px',
                            }}
                        >
                            <Text
                                size="larger"
                                textStyle={{
                                    color: 'white',
                                    textShadow: lib.layout.boxShadow.dark,
                                }}
                            >
                                My Nugg
                            </Text>
                        </div>
                        <MyNuggActions />
                    </>
                )}

                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'flex-start',
                        alignItems: 'flex-start',
                        textAlign: 'left',
                        width: '100%',
                        padding: '10px',
                    }}
                >
                    <Text
                        size="larger"
                        textStyle={{ color: 'white', textShadow: lib.layout.boxShadow.dark }}
                    >
                        Items
                    </Text>
                </div>
                {tokenId.isNuggId() && <ItemListPhone tokenId={tokenId} />}
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'flex-start',
                        alignItems: 'flex-start',
                        textAlign: 'left',
                        width: '100%',
                        padding: '10px',
                    }}
                >
                    <Text
                        size="larger"
                        textStyle={{ color: 'white', textShadow: lib.layout.boxShadow.dark }}
                    >
                        Previous Swaps
                    </Text>
                </div>

                <SwapListPhone token={token} />

                <div
                    style={{
                        width: '100%',
                        marginTop: '400px',
                        position: 'relative',
                        display: 'flex',
                    }}
                />
            </div>
        </>
    ) : null;
};

export default React.memo(ViewingNuggPhone);
