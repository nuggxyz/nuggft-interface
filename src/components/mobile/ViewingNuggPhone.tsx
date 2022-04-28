import React, { FunctionComponent, useMemo } from 'react';
import { plural, t } from '@lingui/macro';

import lib from '@src/lib';
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
import { Lifecycle } from '@src/client/interfaces';
import CurrencyText from '@src/components/general/Texts/CurrencyText/CurrencyText';
import useAsyncState from '@src/hooks/useAsyncState';
import { useNuggftV1 } from '@src/contracts/useContract';
import { Address } from '@src/classes/Address';
import OffersList from '@src/components/nugg/RingAbout/OffersList';
import Caboose from '@src/components/nugg/RingAbout/Caboose';
import SideCar from '@src/components/nugg/RingAbout/SideCar';
import Label from '@src/components/general/Label/Label';
import useLifecycleEnhanced from '@src/client/hooks/useLifecycleEnhanced';
import { useGetNuggsThatHoldQuery } from '@src/gql/types.generated';
import NuggListRenderItemMobile, {
    NuggListRenderItemMobileBig,
} from '@src/components/mobile/NuggListRenderItemMobile';
import MyNuggActions from '@src/components/nugg/ViewingNugg/MyNuggActions';
import SwapListPhone from '@src/components/nugg/ViewingNugg/SwapListPhone';
import { ItemListPhone } from '@src/components/nugg/ViewingNugg/ItemList';

import BradPitt from './BradPitt';

// type Props = { MobileBackButton?: MemoExoticComponent<() => JSX.Element> };

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

const NextSwap = ({ tokenId }: { tokenId: ItemId }) => {
    const token = client.live.token(tokenId);

    const text = useMemo(() => {
        if (token && token.tryout && token.tryout.count && token.tryout.count > 0)
            return t`accept a nugg's asking price`;
        if (token && token.tokenId.toRawIdNum() < 1000) return `bases are non transferable`;
        return t`accept a nugg's asking price`;
    }, [token]);
    return (
        <div
            style={{
                height: 'auto',
                width: '100%',
                alignItems: 'center',
                justifyContent: 'center',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            {token && token.tryout.min && (
                <div
                    style={{
                        alignItems: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        marginBottom: '20px',
                        marginTop: '10px',
                    }}
                >
                    <CurrencyText
                        textStyle={{
                            color: lib.colors.primaryColor,
                            fontSize: '28px',
                        }}
                        image="eth"
                        value={token.tryout.min.eth.number || 0}
                        decimals={3}
                    />
                    <Text
                        textStyle={{
                            fontSize: '13px',
                            color: lib.colors.primaryColor,
                        }}
                    >
                        {t`minimum price`}
                    </Text>
                </div>
            )}
            <Text textStyle={{ color: lib.colors.primaryColor }}>{text}</Text>
            <SideCar tokenId={tokenId} />
            <Caboose tokenId={tokenId} />
        </div>
    );
};

const ActiveSwap = ({ tokenId }: { tokenId: TokenId }) => {
    const token = client.live.token(tokenId);
    const swap = client.swaps.useSwap(tokenId);
    const lifecycle = useLifecycle(token);

    const { minutes } = useRemaining(token?.activeSwap?.epoch);
    const provider = web3.hook.usePriorityProvider();

    const leaderEns = web3.hook.usePriorityAnyENSName(
        token && token.type === 'item' ? 'nugg' : provider,
        swap?.leader || '',
    );

    const nuggft = useNuggftV1();

    const vfo = useAsyncState(() => {
        if (swap && provider && tokenId && lifecycle === Lifecycle.Bunt) {
            return nuggft
                .connect(provider)
                ['vfo(address,uint24)'](Address.NULL.hash, tokenId.toRawId())
                .then((x) => {
                    return new EthInt(x);
                });
        }
        return undefined;
    }, [swap, nuggft, tokenId, provider]);
    return (
        <>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-around',
                    width: '100%',
                    alignItems: 'center',
                }}
            >
                {lifecycle === Lifecycle.Bench ? (
                    <div
                        style={{
                            alignItems: 'center',
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                    >
                        <CurrencyText
                            textStyle={{
                                color: lib.colors.primaryColor,
                                fontSize: '28px',
                            }}
                            forceEth
                            image="eth"
                            value={swap?.eth?.number || 0}
                            decimals={3}
                        />
                        <Text
                            textStyle={{
                                fontSize: '13px',
                                color: lib.colors.primaryColor,
                            }}
                        >
                            asking price
                        </Text>
                        <Text
                            size="large"
                            textStyle={{
                                paddingTop: '1rem',
                                color: lib.colors.primaryColor,
                            }}
                        >
                            {`for sale by ${leaderEns || Address.ZERO.hash}`}
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
                                color: lib.colors.primaryColor,
                                fontSize: '28px',
                            }}
                            forceEth
                            image="eth"
                            value={swap?.eth?.number || vfo?.number || 0}
                            decimals={3}
                        />
                        <Text
                            textStyle={{
                                fontSize: '13px',
                                color: lib.colors.primaryColor,
                            }}
                        >
                            {leaderEns && swap?.leader !== Address.ZERO.hash
                                ? `${leaderEns} is leading`
                                : 'starting price'}
                        </Text>
                    </div>
                )}
                {swap?.endingEpoch && (
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
                                color: lib.colors.primaryColor,
                            }}
                        >
                            ending in about
                        </Text>
                        <Text
                            textStyle={{
                                color: lib.colors.primaryColor,
                                fontSize: '28px',
                            }}
                        >{`${minutes} ${plural(minutes, {
                            1: 'minute',
                            other: 'minutes',
                        })}`}</Text>
                    </div>
                )}
            </div>
            {(swap?.offers.length || 0) > 0 && lifecycle !== Lifecycle.Bench && (
                <div style={{ width: '100%', padding: '20px 10px ' }}>
                    <OffersList tokenId={tokenId} />
                </div>
            )}
            <div style={{ width: '100%', padding: '0rem 20px', paddingTop: '.8rem' }}>
                <OfferButton tokenId={tokenId} inOverlay />
            </div>
        </>
    );
};

const ViewingNuggPhone: FunctionComponent<{
    tokenId: TokenId | undefined;
}> = ({ tokenId }) => {
    const epoch = client.live.epoch.id();

    // const tokenId = client.viewscreen.useViewScreenTokenId();

    const sender = web3.hook.usePriorityAccount();

    const tokenQuery = useTokenQuery();

    React.useEffect(() => {
        if (tokenId) void tokenQuery(tokenId);
    }, [tokenId, tokenQuery]);

    // const chainId = web3.hook.usePriorityChainId();
    const provider = web3.hook.usePriorityProvider();

    const token = client.live.token(tokenId);
    const swap = client.swaps.useSwap(tokenId);
    const lifecycle = useLifecycleEnhanced(swap);

    const { data } = useGetNuggsThatHoldQuery({
        fetchPolicy: 'network-only',
        skip: !token || !token.isItem(),
        variables: {
            skip: 0,
            first: 1000,
            itemId: token?.tokenId.toRawId() || '',
        },
    });

    // const squishedData = useSquishedListData(
    //     data ? data.nuggItems.map((x) => x.nugg.id.toNuggId()) : [],
    // );
    // const [activeIndex, setActiveIndex] = React.useState(1);

    // const [headerRef, { width: WIDTH }] = useMeasure();

    // const selectionIndicatorSpring = useSpring({
    //     from: {
    //         x: 0,
    //         opacity: 1,
    //     },
    //     to: {
    //         opacity: 1,
    //         x: activeIndex * (WIDTH / 2) - 22.5,
    //     },
    //     config: config.default,
    // });

    const coreRef = React.useRef(null);

    return provider && epoch && tokenId && token ? (
        <>
            <div
                ref={coreRef}
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
                                    tokenStyle={{ width: '225px', height: '225px' }}
                                />
                            </div>
                        ) : (
                            <TokenViewer tokenId={tokenId} showcase disableOnClick />
                        )}
                    </div>
                </div>
                <div
                    style={{
                        marginTop: token.activeSwap ? -10 : '1rem',
                        // width: '95%',
                        display: 'flex',
                        // width: '90%',
                        justifyContent: 'center',
                        flexDirection: 'column',
                        alignItems: 'center',
                        background: lib.colors.transparentWhite,
                        borderRadius: lib.layout.borderRadius.medium,
                        padding: '.7rem .8rem',
                    }}
                >
                    <Text
                        textStyle={{
                            // textShadow: lib.layout.boxShadow.dark,
                            color: lib.colors.primaryColor,
                            // padding: '1rem',
                            // background: darkmode
                            //     ? lib.colors.nuggBlueTransparent
                            //     : lib.colors.transparentGrey,
                            borderRadius: lib.layout.borderRadius.large,
                        }}
                        size="larger"
                    >
                        {tokenId && tokenId.toPrettyId()}
                    </Text>
                    {lifecycle && (
                        <Label
                            // type="text"
                            containerStyles={{
                                background: 'transparent',
                            }}
                            size="small"
                            textStyle={{
                                color: lib.colors.primaryColor,

                                position: 'relative',
                            }}
                            text={lifecycle?.label}
                            leftDotColor={lifecycle.color}
                        />
                    )}
                </div>

                {/* <Button label="" /> */}

                {token.activeSwap &&
                    (token.activeSwap.endingEpoch || 0) <= epoch &&
                    lifecycle?.lifecycle !== Lifecycle.Cut && (
                        <>
                            <div
                                style={{
                                    // width: '95%',
                                    display: 'flex',
                                    width: '90%',
                                    justifyContent: 'center',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    background: lib.colors.transparentWhite,
                                    borderRadius: lib.layout.borderRadius.medium,
                                    padding: '1rem .5rem',
                                    marginTop: '1rem',
                                }}
                            >
                                <ActiveSwap tokenId={tokenId} />{' '}
                            </div>
                        </>
                    )}

                {token.type === 'item' && (
                    <>
                        {token.activeSwap && (
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'flex-start',
                                    alignItems: 'flex-start',
                                    textAlign: 'left',
                                    width: '100%',
                                    padding: '2rem 1rem 1rem 1.5rem',
                                }}
                            >
                                <Text
                                    size="larger"
                                    textStyle={{
                                        color: lib.colors.primaryColor,
                                    }}
                                >
                                    Start the next auction
                                </Text>
                            </div>
                        )}
                        <div
                            style={{
                                // width: '95%',
                                display: 'flex',
                                width: '90%',
                                justifyContent: 'center',
                                flexDirection: 'column',
                                alignItems: 'center',
                                background: lib.colors.transparentWhite,
                                borderRadius: lib.layout.borderRadius.medium,
                                padding: '1rem .5rem',
                                marginTop: '1rem',
                            }}
                        >
                            <NextSwap tokenId={token.tokenId} />
                        </div>
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'flex-start',
                                alignItems: 'flex-start',
                                textAlign: 'left',
                                width: '100%',
                                padding: '2rem 1rem 1rem 1.5rem',
                            }}
                        >
                            <Text
                                size="larger"
                                textStyle={{
                                    color: lib.colors.primaryColor,
                                    // textShadow: lib.layout.boxShadow.dark,
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
                                padding: '2rem 1rem 1rem 1.5rem',
                            }}
                        >
                            <Text
                                size="larger"
                                textStyle={{
                                    color: lib.colors.primaryColor,
                                    // textShadow: lib.layout.boxShadow.dark,
                                }}
                            >
                                My Nugg
                            </Text>
                        </div>
                        <MyNuggActions />
                    </>
                )}

                {tokenId.isNuggId() && (
                    <>
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'flex-start',
                                alignItems: 'flex-start',
                                textAlign: 'left',
                                width: '100%',
                                padding: '2rem 1rem 1rem 1.5rem',
                            }}
                        >
                            <Text
                                size="larger"
                                textStyle={{
                                    color: lib.colors.primaryColor,
                                    // textShadow: lib.layout.boxShadow.dark,
                                }}
                            >
                                Items
                            </Text>
                        </div>
                        <ItemListPhone tokenId={tokenId} />
                    </>
                )}
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'flex-start',
                        alignItems: 'flex-start',
                        textAlign: 'left',
                        width: '100%',
                        padding: '2rem 1rem 1rem 1.5rem',
                    }}
                >
                    <Text
                        size="larger"
                        textStyle={{
                            color: lib.colors.primaryColor,
                            // textShadow: lib.layout.boxShadow.dark,
                        }}
                    >
                        Previous Auctions
                    </Text>
                </div>

                <SwapListPhone token={token} />

                {token.isItem() ? (
                    <>
                        <BradPitt
                            listStyle={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                textAlign: 'left',
                                width: '100%',
                                padding: '2rem 1rem 1rem 1.5rem',
                            }}
                            style={{
                                position: 'relative',
                                width: '90%',
                                // display: 'flex',
                                overflow: undefined,
                                flexDirection: 'column',
                            }}
                            coreRef={coreRef}
                            itemHeightBig={340}
                            itemHeightSmall={160}
                            data={data?.nuggItems.map((x) => x.nugg.id.toNuggId()) || []}
                            RenderItemSmall={NuggListRenderItemMobile}
                            RenderItemBig={NuggListRenderItemMobileBig}
                            disableScroll
                            extraData={undefined}
                            Title={React.memo(() => (
                                <Text
                                    size="larger"
                                    textStyle={{
                                        color: lib.colors.primaryColor,
                                    }}
                                >
                                    Nuggs Holding
                                </Text>
                            ))}
                        />
                        {/* <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                textAlign: 'left',
                                width: '100%',
                                padding: '2rem 1rem 1rem 1.5rem',
                            }}
                        >
                            <Text
                                size="larger"
                                textStyle={{
                                    color: lib.colors.primaryColor,
                                }}
                            >
                                Nuggs Holding
                            </Text>

                            <div
                                ref={headerRef}
                                style={{
                                    display: 'flex',
                                    zIndex: 5,
                                    width: 90,
                                    justifyContent: 'space-around',
                                    position: 'relative',
                                }}
                            >
                                <animated.div
                                    style={{
                                        top: -5,
                                        width: `40px`,
                                        height: `40px`,
                                        ...selectionIndicatorSpring,
                                        position: 'absolute',
                                        zIndex: -1,
                                        // backgroundColor: 'rgba(80, 144, 234, 0.4)',
                                        background: lib.colors.transparentWhite,
                                        borderRadius: lib.layout.borderRadius.mediumish,
                                    }}
                                />
                                <IoLogoInstagram
                                    color={lib.colors.primaryColor}
                                    size={30}
                                    onClick={() => setActiveIndex(0)}
                                />
                                <IoGridOutline
                                    color={lib.colors.primaryColor}
                                    size={30}
                                    onClick={() => setActiveIndex(1)}
                                />
                            </div>
                        </div>

                        {squishedData.length > 0 &&
                            (activeIndex === 0 ? (
                                <InfiniteList
                                    startGap={10}
                                    id="nugg-list1"
                                    style={{
                                        position: 'relative',
                                        width: '90%',
                                        display: undefined,
                                        overflow: undefined,
                                    }}
                                    skipSelectedCheck
                                    data={data?.nuggItems.map((x) => x.nugg.id.toNuggId()) || []}
                                    RenderItem={NuggListRenderItemMobileBig}
                                    loading={false}
                                    interval={3}
                                    action={undefined}
                                    extraData={{ cardType: 'all' as const }}
                                    itemHeight={340}
                                    animationToggle={false}
                                    disableScroll
                                    endGap={50}
                                />
                            ) : (
                                <InfiniteList
                                    startGap={10}
                                    id="nugg-list2"
                                    style={{
                                        position: 'relative',
                                        width: '90%',
                                        display: undefined,
                                        overflow: undefined,
                                    }}
                                    skipSelectedCheck
                                    data={squishedData}
                                    RenderItem={NuggListRenderItemMobile}
                                    loading={false}
                                    interval={10}
                                    action={undefined}
                                    extraData={{ cardType: 'all' as const }}
                                    itemHeight={160}
                                    animationToggle={false}
                                    disableScroll
                                    squishFactor={0.5}
                                />
                            ))} */}
                    </>
                ) : (
                    <></>
                )}

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

export default ViewingNuggPhone;