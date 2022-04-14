import React, { FunctionComponent, MemoExoticComponent, useMemo } from 'react';
import { plural, t } from '@lingui/macro';

import lib, { parseTokenIdSmart, NLStyleSheetCreator } from '@src/lib';
import Text from '@src/components/general/Texts/Text/Text';
import TokenViewer from '@src/components/nugg/TokenViewer';
import web3 from '@src/web3';
import client from '@src/client';
import HappyTabber from '@src/components/general/HappyTabber/HappyTabber';
import AddressViewer from '@src/components/general/Texts/AddressViewer/AddressViewer';
import useViewingNugg from '@src/client/hooks/useViewingNugg';
import useTokenQuery from '@src/client/hooks/useTokenQuery';
import globalStyles from '@src/lib/globalStyles';
import AnimatedCard from '@src/components/general/Cards/AnimatedCard/AnimatedCard';
import useDimentions from '@src/client/hooks/useDimentions';
import { Fraction } from '@src/classes/Fraction';

import MyNuggActions from './MyNuggActions';
import { ItemListPhone } from './ItemList';
import SwapListPhone from './SwapListPhone';

type Props = { MobileBackButton?: MemoExoticComponent<() => JSX.Element> };

const Info = ({ tokenId }: { tokenId?: string }) => {
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

const ViewingNuggPhone: FunctionComponent<Props> = ({ MobileBackButton }) => {
    const epoch = client.live.epoch.id();

    const { safeTokenId: tokenId } = useViewingNugg();

    const sender = web3.hook.usePriorityAccount();

    const tokenQuery = useTokenQuery();

    React.useEffect(() => {
        if (tokenId) void tokenQuery(tokenId);
    }, [tokenId, tokenQuery]);

    const chainId = web3.hook.usePriorityChainId();
    const provider = web3.hook.usePriorityProvider();

    const token = client.live.token(tokenId);

    const { isPhone } = useDimentions();

    const happyTabs = useMemo(() => {
        return [
            ...(token && token.type === 'nugg' && token.owner === sender
                ? [
                      {
                          label: t`My Nugg`,
                          comp: React.memo(MyNuggActions),
                      },
                  ]
                : []),
            {
                label: t`Swaps`,
                comp: React.memo(() => <SwapListPhone token={token} />),
            },
            ...(token && token.type === 'item'
                ? [
                      {
                          label: t`Stats`,
                          comp: React.memo(() => <Info tokenId={tokenId} />),
                      },
                  ]
                : []),

            ...(token && token.type === 'nugg' && tokenId
                ? [
                      {
                          label: 'Items',
                          comp: React.memo(() => <ItemListPhone tokenId={tokenId} />),
                      },
                  ]
                : []),
        ];
    }, [token, sender, chainId, provider, tokenId]);

    // const navigate = useNavigate();

    return provider && epoch && tokenId && token ? (
        <>
            {MobileBackButton && (
                <div
                    style={{
                        width: '100%',
                        paddingTop: '5rem',
                        paddingLeft: '1rem',
                        backdropFilter: 'blur(5px)',
                        WebkitBackdropFilter: 'blur(5px)',
                        display: 'flex',
                        flexDirection: 'column',
                        position: 'absolute',
                        zIndex: 101,
                    }}
                >
                    <div
                        style={{
                            left: '1rem',
                            display: 'flex',
                            width: '100%',
                        }}
                    >
                        <MobileBackButton />

                        <div
                            style={{
                                backgroundBlendMode: 'multiply',
                                paddingLeft: '.5rem',
                                borderRadius: lib.layout.borderRadius.mediumish,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'flex-start',
                                borderBottomRightRadius: 0,
                                borderBottomLeftRadius: 0,
                            }}
                        >
                            <Text textStyle={styles.nuggId}>
                                {tokenId && parseTokenIdSmart(tokenId)}
                            </Text>

                            <div style={{ marginLeft: '1rem' }}>
                                <Text
                                    type="text"
                                    size="smaller"
                                    textStyle={{
                                        color: lib.colors.white,
                                    }}
                                >
                                    {token.type === 'item' ? t`Owned by` : t`Owner`}
                                </Text>
                                <div style={globalStyles.centered}>
                                    {token.type === 'item' ? (
                                        <Text>
                                            {plural(token.count, { 1: '# Nugg', other: '# Nuggs' })}
                                        </Text>
                                    ) : (
                                        <AddressViewer
                                            address={token.owner}
                                            textStyle={styles.titleText}
                                            param={token.owner}
                                            route="address"
                                            size="medium"
                                            isNugg={false}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div
                style={{
                    ...(isPhone
                        ? {
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
                              paddingTop: '150px',
                          }
                        : styles.swaps),
                }}
            >
                <div
                    style={{
                        ...(isPhone
                            ? {
                                  position: 'relative',
                                  width: '100%',
                                  top: 0,
                                  display: 'flex',
                                  justifyContent: 'center',
                                  alignItems: 'flex-end',
                                  zIndex: 100,
                                  //   height: '400px',
                              }
                            : styles.nuggContainer),
                        marginBottom: '1.5rem',
                        // marginTop: token.type === 'item' ? '1.5rem' : '0rem',
                    }}
                >
                    {isPhone ? (
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
                            <TokenViewer tokenId={tokenId} showcase disableOnClick />
                        </div>
                    ) : (
                        <div style={{ position: 'relative', width: '100%' }}>
                            <AnimatedCard>
                                {tokenId && (
                                    <TokenViewer tokenId={tokenId} showcase disableOnClick />
                                )}
                            </AnimatedCard>
                        </div>
                    )}
                </div>

                <HappyTabber
                    defaultActiveIndex={0}
                    items={happyTabs}
                    disableTransition
                    selectionIndicatorStyle={{ background: lib.colors.white }}
                    wrapperStyle={{ height: '100%', width: '100%' }}
                    headerContainerStyle={{
                        marginTop: '.5rem',

                        padding: '1rem 1rem',
                        borderRadius: 0,
                    }}
                />
            </div>
        </>
    ) : null;
};

export default React.memo(ViewingNuggPhone);

const styles = NLStyleSheetCreator({
    nuggId: {
        color: lib.colors.nuggBlueText,
        padding: '.5rem .8rem',
        background: lib.colors.transparentWhite,
        borderRadius: lib.layout.borderRadius.small,
        whiteSpace: 'nowrap',
    },
    nuggContainer: {
        position: 'relative',
        height: '400px',
        width: '100%', // '400px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 100,
    },
    nuggContainerMobile: {
        position: 'relative',
        height: '400px',
        width: '100%',
        top: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-end',
        zIndex: 100,
    },
    titleText: {
        color: lib.colors.white,
        display: 'flex',
        alignItems: 'center',
    },
    owner: {
        background: lib.colors.nuggBlueTransparent,
        padding: '.5rem',
        borderRadius: lib.layout.borderRadius.mediumish,
        postion: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'stretch',
        borderBottomRightRadius: 0,
        borderBottomLeftRadius: 0,
        position: 'relative',
        width: '100%',
    },
    swapsWrapper: {
        // height: '40%',
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    swaps: {
        borderRadius: lib.layout.borderRadius.mediumish,
        background: lib.colors.transparentGrey,
        // marginTop: '1rem',
        width: '100%',
        position: 'relative',
        // justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
    },
    swapsMobile: {
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        borderRadius: lib.layout.borderRadius.mediumish,
        overflow: 'hidden',
        background: lib.colors.transparentGrey,
        width: '95%',
    },
    swapItemContainer: {
        padding: '.25rem 1rem',
        margin: '.25rem 0rem',
        flexDirection: 'column',
        ...globalStyles.centered,
    },
    swap: {
        background: lib.colors.gradient2Transparent,
        padding: '.5rem 1rem',
        borderRadius: lib.layout.borderRadius.mediumish,
        postion: 'relative',
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
    },
    button: {
        padding: '.75rem 1rem',
        margin: '.5rem',
        borderRadius: lib.layout.borderRadius.large,
        background: 'white',
        width: '40%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    textBlack: { color: lib.colors.primaryColor },
    textBlue: { color: lib.colors.nuggBlueText },
    flyout: {
        position: 'absolute',
        zIndex: 10,
        top: '.7rem',
        left: '.7rem',
    },
    flyoutButton: {
        background: lib.colors.white,
        borderRadius: lib.layout.borderRadius.large,
        padding: '.4rem .4rem 0rem .4rem',
    },
    ownerButtonContainer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        // height: '100%',
        width: '100%',
        overflow: 'hidden',
        background: lib.colors.transparentGrey2,
        margin: '.4rem',
        borderRadius: lib.layout.borderRadius.smallish,
    },

    tabberList: {
        // background: lib.colors.nuggBlueTransparent,
        // borderRadius: lib.layout.borderRadius.smallish,
    },
    swapButton: {
        width: '100%',
        justifyContent: 'space-between',
        alignItems: 'center',
        display: 'flex',
    },
    listTitle: {
        padding: '.5rem',
        background: lib.colors.transparentWhite,
        width: '100%',
        ...globalStyles.backdropFilter,
    },
    listItemSvg: {
        height: '100px',
        width: '100px',
        // background: 'red',
    },
    itemListItem: {
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        width: '100%',
        marginBottom: '.5em',
        background: lib.colors.transparentWhite,
        borderRadius: lib.layout.borderRadius.mediumish,
    },
    itemListButton: {
        borderRadius: lib.layout.borderRadius.large,
        background: lib.colors.gradient2Transparent,
        position: 'absolute',
        right: '1rem',
    },
    itemListButtonText: {
        color: lib.colors.white,
        marginLeft: '.5rem',
    },
    zoom: {
        borderRadius: lib.layout.borderRadius.large,
        padding: '.3rem .5rem',
        position: 'absolute',
        right: '.5rem',
    },
    goToSwap: {
        marginBottom: '.4rem',
        borderRadius: lib.layout.borderRadius.large,
        backgroundColor: lib.colors.white,
        padding: '.2rem .7rem',
    },
    goToSwapGradient: {
        background: lib.colors.gradient3,
        color: 'black',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
    },
});
