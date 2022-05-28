import React, { useMemo } from 'react';
import { plural, t } from '@lingui/macro';
import { useNavigate } from 'react-router';
import { animated } from '@react-spring/web';

import lib from '@src/lib';
import Text from '@src/components/general/Texts/Text/Text';
import web3 from '@src/web3';
import client from '@src/client';
import useTokenQuery from '@src/client/hooks/useTokenQuery';
import globalStyles from '@src/lib/globalStyles';
import { EthInt, Fraction } from '@src/classes/Fraction';
import TheRing from '@src/components/nugg/TheRing/TheRing';
import useLifecycle from '@src/client/hooks/useLifecycle';
import { useRemainingTrueSeconds } from '@src/client/hooks/useRemaining';
import { Lifecycle, TryoutData } from '@src/client/interfaces';
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
import {
    NuggListRenderItemMobileBigHoldingItem,
    NuggListRenderItemMobileHolding,
} from '@src/components/mobile/NuggListRenderItemMobile';
import MyNuggActions from '@src/components/nugg/ViewingNugg/MyNuggActions';
import SwapListPhone from '@src/components/nugg/ViewingNugg/SwapListPhone';
import { ItemListPhone } from '@src/components/nugg/ViewingNugg/ItemList';
import BradPittList from '@src/components/general/List/BradPittList';
import { useUsdPair } from '@src/client/usd';
import useAggregatedOffers from '@src/client/hooks/useAggregatedOffers';
import { buildTokenIdFactory } from '@src/prototypes';
import { ModalEnum } from '@src/interfaces/modals';
import styles from '@src/components/nugg/ViewingNugg/ViewingNugg.styles';
import Button from '@src/components/general/Buttons/Button/Button';
import useMobileViewingNugg from '@src/client/hooks/useMobileViewingNugg';
import useAnimateOverlayBackdrop from '@src/hooks/useAnimateOverlayBackdrop';
import undefined from '@src/lib/dotnugg/util';
import useMountLogger from '@src/hooks/useMountLogger';

import NuggSnapshotListMobile from './NuggSnapshotItemMobile';
import MobileOfferButton from './MobileOfferButton';

const Ver = ({ left, right, label }: { left: number; right: number; label: string }) => {
    return (
        <div
            style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
            }}
        >
            <Label
                text={`"${label}"`}
                containerStyles={{
                    background: lib.colors.primaryColor,
                    padding: '.3rem .5rem',
                    borderRadius: lib.layout.borderRadius.medium,
                }}
                textStyle={{ color: 'white', fontSize: '16px' }}
            />
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-around',
                    width: '100%',
                    padding: '10px',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    <CurrencyText
                        forceEth
                        value={left}
                        percent
                        decimals={3}
                        textStyle={{ fontSize: '30px' }}
                    />
                    <Text>actual</Text>
                </div>
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    <CurrencyText
                        forceEth
                        value={right}
                        percent
                        decimals={3}
                        textStyle={{ fontSize: '30px' }}
                    />{' '}
                    <Text>predicted</Text>
                </div>
            </div>
        </div>
    );
};

const Info = ({ tokenId }: { tokenId?: ItemId }) => {
    const token = client.live.token(tokenId);
    const totalNuggs = client.live.totalNuggs();
    const featureTotals = client.live.featureTotals();

    const feature = React.useMemo(() => {
        return tokenId ? tokenId.toRawIdNum().toItemFeature() : 0;
    }, [tokenId]);

    const observedPositionRarity = useMemo(() => {
        if (!token) return 0;
        return new Fraction(token.count, featureTotals[feature]).number;
    }, [token, featureTotals, feature]);

    const positionRarity = useMemo(() => {
        if (!token) return 0;
        return token.rarity.number;
    }, [token]);

    const featureRarity = useMemo(() => {
        if (!token) return 0;
        return web3.config.FEATURE_RARITY[feature];
    }, [token, feature]);

    const observedFeatureRarity = useMemo(() => {
        if (!token) return 0;
        return new Fraction(featureTotals[feature], totalNuggs).number;
    }, [token, totalNuggs, featureTotals, feature]);

    // const [showPercent, setShowPercent] = React.useState<0 | 1>(0);
    if (!tokenId || !token) return null;

    return (
        <>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    textAlign: 'left',
                    width: '100%',
                    padding: '2rem 1rem 1rem 1.5rem',
                    // background: lib.colors.transparentWhite,
                    // borderRadius: lib.layout.borderRadius.medium,
                }}
            >
                <Text
                    size="larger"
                    textStyle={{
                        color: lib.colors.primaryColor,
                        // textShadow: lib.layout.boxShadow.dark,
                    }}
                >
                    Chances
                </Text>
                {/* <DualToggler
                    LeftIcon={BsPercent}
                    RightIcon={BsHash}
                    activeIndex={showPercent}
                    toggleActiveIndex={setShowPercent as (arg: 0 | 1) => undefined}
                /> */}
            </div>
            <div
                style={{
                    // width: '100%',
                    // padding: '1rem 0rem',
                    // margin: '.25rem 0rem',
                    flexDirection: 'column',
                    ...globalStyles.centered,
                    background: lib.colors.transparentWhite,
                    borderRadius: lib.layout.borderRadius.medium,
                    width: '90%',
                    height: '100%',
                    padding: '1rem .5rem',
                }}
            >
                <div style={{ width: '100%', marginTop: 15 }}> </div>{' '}
                <Ver
                    left={observedPositionRarity * observedFeatureRarity * 100}
                    right={featureRarity * positionRarity * 100}
                    label={`a new nugg has ${tokenId.toPrettyId().toLowerCase()}`}
                />
                <div style={{ width: '100%', marginTop: 20 }}> </div>
                <Ver
                    left={observedPositionRarity * 100}
                    right={positionRarity * 100}
                    label={`a given ${web3.config.FEATURE_NAMES[feature].toLowerCase()} is
            ${tokenId.toPrettyId().toLowerCase()}`}
                />
                <div style={{ width: '100%', marginTop: 20 }}> </div>
                <Ver
                    left={observedFeatureRarity * 100}
                    right={featureRarity * 100}
                    label={`a nugg is minted with ${web3.config.FEATURE_NAMES[
                        feature
                    ].toLowerCase()}`}
                />
            </div>
        </>
    );
};

const NextSwap = ({ tokenId }: { tokenId: ItemId }) => {
    const token = client.live.token(tokenId);

    const [selected, setSelected] = React.useState<TryoutData>();
    const [selectedMyNugg, setSelectedMyNugg] = React.useState<NuggId>();

    const [continued, setContinued] = React.useState<boolean>(false);

    const text = useMemo(() => {
        if (selected) return t`Continue to Start Auction`;
        if (token && token.tryout && token.tryout.count && token.tryout.count > 0)
            return t`accept a nugg's asking price`;
        if (token && token.tokenId.toRawIdNum() < 1000) return `bases are non transferable`;
        return undefined;
    }, [token, selected]);

    const currency = client.usd.useUsdPair(selected ? selected.eth : token?.tryout?.min?.eth);

    return text ? (
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
                            value={currency}
                            decimals={3}
                        />
                        <Text
                            textStyle={{
                                fontSize: '13px',
                                color: lib.colors.primaryColor,
                            }}
                        >
                            {selected
                                ? t`${selected.nugg.toPrettyId()}'s asking price`
                                : t`minimum price`}
                        </Text>
                    </div>
                )}
                <>
                    <Text textStyle={{ color: lib.colors.primaryColor }}>
                        {continued
                            ? !selectedMyNugg
                                ? t`which nugg should bid on your behalf?`
                                : t`you will bid as ${selectedMyNugg.toPrettyId()}`
                            : text}
                    </Text>
                    <SideCar tokenId={tokenId} />
                    <Caboose
                        tokenId={tokenId}
                        onSelectNugg={setSelected}
                        onSelectMyNugg={setSelectedMyNugg}
                        onContinue={() => {
                            setContinued(true);
                        }}
                    />
                </>
            </div>{' '}
        </div>
    ) : null;
};

const ActiveSwap = ({ tokenId }: { tokenId: TokenId }) => {
    const token = client.live.token(tokenId);
    const swap = client.swaps.useSwap(tokenId);
    const lifecycle = useLifecycle(token);

    const { minutes, seconds } = client.epoch.useEpoch(swap?.epoch?.id);
    const [leader] = useAggregatedOffers(tokenId);

    const trueSeconds = useRemainingTrueSeconds(seconds ?? 0);
    const provider = web3.hook.usePriorityProvider();

    const leaderEns = web3.hook.usePriorityAnyENSName(
        token && token.type === 'item' ? 'nugg' : provider,
        leader?.account || swap?.leader || '',
    );

    useMountLogger('activeSwap');
    const nuggft = useNuggftV1();

    const vfo = useAsyncState(() => {
        if (
            swap &&
            provider &&
            tokenId &&
            (lifecycle === Lifecycle.Bunt || lifecycle === Lifecycle.Minors)
        ) {
            return nuggft
                .connect(provider)
                ['vfo(address,uint24)'](Address.NULL.hash, tokenId.toRawId())
                .then((x) => {
                    return new EthInt(x);
                });
        }
        return undefined;
    }, [swap, nuggft, tokenId, provider]);

    const swapCurrency = useUsdPair(leader?.eth.gt(0) ? leader.eth : vfo);

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
                {lifecycle === Lifecycle.Minors ||
                lifecycle === Lifecycle.Bench ||
                lifecycle === Lifecycle.Concessions ? (
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
                            value={swapCurrency}
                            decimals={3}
                        />
                        <Text
                            textStyle={{
                                fontSize: '13px',
                                color: lib.colors.primaryColor,
                            }}
                        >
                            {lifecycle === Lifecycle.Minors ? 'starting price' : 'asking price'}
                        </Text>
                        {lifecycle !== Lifecycle.Minors && (
                            <div style={{ display: 'flex' }}>
                                <Text
                                    size="large"
                                    textStyle={{
                                        paddingTop: '1rem',
                                        paddingRight: '.5em',
                                        // color: lib.colors.primaryColor,
                                    }}
                                >
                                    {t`for sale by`}
                                </Text>
                                <Text
                                    loading={!leaderEns}
                                    size="large"
                                    textStyle={{
                                        paddingTop: '1rem',
                                    }}
                                >
                                    {leaderEns || 'XXXX...XXXX'}
                                </Text>
                            </div>
                        )}
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
                            value={swapCurrency}
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
                        >
                            {!minutes
                                ? `${plural(trueSeconds ?? 0, {
                                      1: '# second',
                                      other: '# seconds',
                                  })}`
                                : `${plural(minutes, {
                                      1: '# minute',
                                      other: '# minutes',
                                  })}`}
                        </Text>
                    </div>
                )}
            </div>
            {(swap?.offers.length || 0) > 0 &&
                lifecycle !== Lifecycle.Bench &&
                lifecycle !== Lifecycle.Minors && <OffersList tokenId={tokenId} />}
            <MobileOfferButton tokenId={tokenId} />
        </>
    );
};

export const ViewingNuggPhoneController = () => {
    const openViewScreen = client.viewscreen.useOpenViewScreen();
    const closeViewScreen = client.viewscreen.useCloseViewScreen();

    const { tokenId } = useMobileViewingNugg();

    const navigate = useNavigate();

    React.useEffect(() => {
        if (tokenId) openViewScreen(tokenId);
        return () => {
            closeViewScreen();
        };
    }, [tokenId, openViewScreen, closeViewScreen, navigate]);

    return null;
};

export const MemoizedViewingNuggPhone = () => {
    const { tokenId } = useMobileViewingNugg();
    return <ViewingNuggPhone tokenId={tokenId} />;
};

const ViewingNuggPhone = React.memo<{ tokenId?: TokenId }>(
    ({ tokenId }) => {
        const isOpen = client.viewscreen.useViewScreenOpen();

        const epoch = client.epoch.active.useId();
        const openModal = client.modal.useOpenModal();
        const sender = web3.hook.usePriorityAccount();

        const tokenQuery = useTokenQuery();

        React.useEffect(() => {
            if (tokenId) void tokenQuery(tokenId);
        }, [tokenId, tokenQuery]);

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
        // console.log('hello', swap, token);
        const coreRef = React.useRef(null);

        const ider = React.useId();

        const overlay = useAnimateOverlayBackdrop(isOpen);

        // console.log(swap, lifecycle);

        return (
            <animated.div
                style={{
                    // transition: 'all .3s ease-in',
                    animation: 'mobile-fade .3s ease-out',
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',

                    overflow: 'hidden',

                    flexDirection: 'column',
                    zIndex: 100000,
                    ...overlay,
                }}
            >
                <div
                    draggable="true"
                    style={{
                        height: '100%',
                        width: '100%',
                        borderTopLeftRadius: lib.layout.borderRadius.largish,
                        borderTopRightRadius: lib.layout.borderRadius.largish,
                        position: 'absolute',
                        justifyContent: 'flex-start',
                        alignItems: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        background: 'transparent',
                    }}
                >
                    {/* <BackButton /> */}
                    <div
                        ref={coreRef}
                        style={{
                            position: 'relative',
                            display: 'flex',
                            flexDirection: 'column',
                            width: '100%',
                            alignItems: 'center',
                            justifyContent: 'start',
                            backdropFilter: 'blur(5px)',
                            WebkitBackdropFilter: 'blur(5px)',
                            height: '100%',
                            overflow: 'scroll',
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
                                {/* {swap ? ( */}
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
                                {/* ) : (
                                    <TokenViewer tokenId={tokenId} showcase disableOnClick />
                                )} */}
                            </div>
                        </div>
                        <div
                            style={{
                                marginTop: swap ? -10 : '1rem',
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
                                    color: lib.colors.primaryColor,
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

                        {tokenId &&
                            swap &&
                            epoch &&
                            (swap.endingEpoch || 0) <= epoch + 1 &&
                            lifecycle &&
                            lifecycle.lifecycle !== Lifecycle.Cut && (
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

                        {token && token.type === 'item' && (
                            <>
                                {swap && (
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
                                <NextSwap tokenId={token.tokenId} />

                                {token.tokenId.isItemId() && <Info tokenId={token.tokenId} />}
                            </>
                        )}

                        {token && token.type === 'nugg' && token.owner === sender && (
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
                                        }}
                                    >
                                        My Nugg
                                    </Text>
                                </div>
                                <Button
                                    className="mobile-pressable-div"
                                    buttonStyle={{
                                        ...styles.goToSwap,
                                        position: 'relative',
                                    }}
                                    textStyle={{
                                        ...styles.goToSwapGradient,
                                        padding: '.2rem .5rem',
                                        fontSize: '24px',
                                    }}
                                    label={t`put up for sale`}
                                    // rightIcon={<IoArrowRedo color={lib.colors.gradientPink} />}
                                    onClick={() => {
                                        openModal(
                                            buildTokenIdFactory({
                                                modalType: ModalEnum.Sell as const,
                                                tokenId: token.tokenId,
                                                sellingNuggId: null,
                                            }),
                                        );
                                    }}
                                />
                                <MyNuggActions />
                            </>
                        )}

                        {tokenId && tokenId.isNuggId() && (
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
                                }}
                            >
                                Previous Auctions
                            </Text>
                        </div>

                        <SwapListPhone token={token} />

                        {token &&
                            (token.isItem() ? (
                                <>
                                    <BradPittList
                                        id={ider}
                                        listStyle={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            textAlign: 'left',
                                            width: '100%',
                                            padding: '.3rem 1rem 1rem 1.5rem',
                                        }}
                                        style={{
                                            position: 'relative',
                                            width: '100%',
                                            overflow: undefined,
                                            flexDirection: 'column',
                                        }}
                                        coreRef={coreRef}
                                        itemHeightBig={340}
                                        itemHeightSmall={160}
                                        endGap={100}
                                        data={
                                            data?.nuggItems.map((x) => ({
                                                tokenId: x.nugg.id.toNuggId(),
                                                since: Number(x?.displayedSinceUnix || 0),
                                            })) || []
                                        }
                                        RenderItemSmall={NuggListRenderItemMobileHolding}
                                        RenderItemBig={NuggListRenderItemMobileBigHoldingItem}
                                        disableScroll
                                        extraData={undefined}
                                        headerStyle={{ padding: '2rem 1rem 1rem 1.5rem' }}
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
                                </>
                            ) : (
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
                                            }}
                                        >
                                            History
                                        </Text>
                                    </div>
                                    <NuggSnapshotListMobile tokenId={token.tokenId} />
                                </>
                            ))}

                        <div
                            style={{
                                width: '100%',
                                marginTop: '400px',
                                position: 'relative',
                                display: 'flex',
                            }}
                        />
                    </div>
                </div>
            </animated.div>
        );
    },
    (prev, curr) => prev.tokenId === curr.tokenId || curr.tokenId === undefined,
);

export default ViewingNuggPhone;
