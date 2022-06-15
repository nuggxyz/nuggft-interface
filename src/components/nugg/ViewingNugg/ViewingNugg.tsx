import React, { FunctionComponent, MemoExoticComponent, useMemo } from 'react';
import { t } from '@lingui/macro';
import { useNavigate } from 'react-router-dom';
import { IoArrowRedo } from 'react-icons/io5';

import lib from '@src/lib';
import Loader from '@src/components/general/Loader/Loader';
import Text from '@src/components/general/Texts/Text/Text';
import TokenViewer from '@src/components/nugg/TokenViewer';
import web3 from '@src/web3';
import client from '@src/client';
import HappyTabber from '@src/components/general/HappyTabber/HappyTabber';
import AddressViewer from '@src/components/general/Texts/AddressViewer/AddressViewer';
import useViewingNugg from '@src/client/hooks/useViewingNugg';
import globalStyles from '@src/lib/globalStyles';
import AnimatedCard from '@src/components/general/Cards/AnimatedCard/AnimatedCard';
import Button from '@src/components/general/Buttons/Button/Button';
import Flyout from '@src/components/general/Flyout/Flyout';
import CurrencyText from '@src/components/general/Texts/CurrencyText/CurrencyText';
import useDimensions from '@src/client/hooks/useDimensions';
import { LiveToken } from '@src/client/interfaces';

import styles from './ViewingNugg.styles';
import SwapList from './SwapList';
import MyNuggActions from './MyNuggActions';
import ItemList from './ItemList';

type Props = { MobileBackButton?: MemoExoticComponent<() => JSX.Element> };

const Mem = React.memo<{ token?: LiveToken }>(({ token }) => <SwapList token={token} />);

const ViewingNugg: FunctionComponent<Props> = ({ MobileBackButton }) => {
    const epoch = client.epoch.active.useId();

    const { safeTokenId: tokenId } = useViewingNugg();

    const sender = web3.hook.usePriorityAccount();

    const { screen: screenType } = useDimensions();
    const chainId = web3.hook.usePriorityChainId();
    const provider = web3.hook.usePriorityProvider();

    const token = client.live.token(tokenId);

    const List = React.useMemo(
        () =>
            tokenId && tokenId.isNuggId() && token && token.type === 'nugg' && tokenId ? (
                <ItemList
                    items={token?.items || []}
                    isOwner={!!sender && sender === token.owner && !token?.activeSwap?.tokenId}
                    tokenId={tokenId}
                />
            ) : null,
        [tokenId, token],
    );

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
                comp: Mem,
            },
            ...(provider &&
            chainId &&
            token &&
            token.type === 'nugg' &&
            tokenId &&
            tokenId.isNuggId()
                ? [
                      {
                          label: 'Items',
                          comp: () => List,
                      },
                  ]
                : []),
        ];
    }, [token, sender, chainId, provider, tokenId, List]);

    const navigate = useNavigate();

    const usdMin = client.usd.useUsdPair(token?.isItem() ? token?.tryout?.min?.eth : undefined);
    const usdMax = client.usd.useUsdPair(token?.isItem() ? token?.tryout?.max?.eth : undefined);

    return (
        <div
            style={{ ...styles.container, opacity: provider && epoch && tokenId && token ? 1 : 0 }}
        >
            {provider && epoch && tokenId && token ? (
                <>
                    {MobileBackButton && (
                        <div
                            style={{
                                position: 'fixed',
                                top: '1rem',
                                left: '1rem',
                                zIndex: 101,
                            }}
                        >
                            <MobileBackButton />
                        </div>
                    )}
                    <div style={styles.swapsWrapper}>
                        <div style={screenType === 'phone' ? styles.swapsMobile : styles.swaps}>
                            <div style={styles.owner}>
                                <Text textStyle={styles.nuggId}>
                                    {tokenId && tokenId.toPrettyId()}
                                </Text>
                                {token.type === 'nugg' ? (
                                    token.owner ? (
                                        <div style={{ marginLeft: '1rem' }}>
                                            <Text
                                                type="text"
                                                size="smaller"
                                                textStyle={{
                                                    color: lib.colors.white,
                                                }}
                                            >
                                                {t`Owner`}
                                            </Text>
                                            <div style={globalStyles.centered}>
                                                <AddressViewer
                                                    address={token.owner}
                                                    textStyle={styles.titleText}
                                                    param={token.owner}
                                                    route="address"
                                                    size="medium"
                                                    isNugg={false}
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <Loader color={lib.colors.nuggBlueText} />
                                    )
                                ) : token ? (
                                    token.type === 'item' &&
                                    token.tryout.count > 0 &&
                                    token.tryout.max &&
                                    token.tryout.min ? (
                                        <div
                                            style={{
                                                ...globalStyles.centeredSpaceBetween,
                                                ...globalStyles.fillWidth,
                                            }}
                                        >
                                            <div style={{ marginLeft: '1rem' }}>
                                                <Text
                                                    type="text"
                                                    size="small"
                                                    textStyle={{
                                                        color: lib.colors.white,
                                                        // marginLeft: '1rem',
                                                    }}
                                                >
                                                    {t`Owned by ${token.count} Nugg${
                                                        token.count > 1 || !token.count ? 's' : ''
                                                    }`}
                                                </Text>
                                                <Flyout
                                                    // openOnHover
                                                    float="left"
                                                    top={25}
                                                    triggerWidth="130px"
                                                    containerStyle={{
                                                        position: 'relative',
                                                    }}
                                                    button={
                                                        <Text
                                                            textStyle={{
                                                                color: lib.colors.nuggBlueText,
                                                            }}
                                                            size="medium"
                                                        >
                                                            {t`${token.tryout.count} Nugg${
                                                                token.tryout.count > 1 ? 's' : ''
                                                            } ${
                                                                token.tryout.count > 1
                                                                    ? 'are'
                                                                    : 'is'
                                                            } swapping`}
                                                        </Text>
                                                    }
                                                >
                                                    <div
                                                        style={{
                                                            padding: '.5rem 1rem',
                                                            zIndex: 1000,
                                                        }}
                                                    >
                                                        <Text
                                                            size="medium"
                                                            textStyle={{ paddingBottom: '.25rem' }}
                                                        >{t`Swap price${
                                                            token.tryout.min.eth.eq(
                                                                token.tryout.max.eth,
                                                            )
                                                                ? ''
                                                                : 's'
                                                        }`}</Text>
                                                        {token.tryout.min.eth.eq(
                                                            token.tryout.max.eth,
                                                        ) ? (
                                                            <CurrencyText
                                                                size="small"
                                                                type="text"
                                                                image="eth"
                                                                value={usdMin}
                                                            />
                                                        ) : (
                                                            <div>
                                                                <div style={{ display: 'flex' }}>
                                                                    <CurrencyText
                                                                        image="eth"
                                                                        size="small"
                                                                        type="text"
                                                                        value={usdMin}
                                                                    />
                                                                    <Text
                                                                        size="small"
                                                                        textStyle={{
                                                                            marginLeft: '5px',
                                                                        }}
                                                                    >{t`Min`}</Text>
                                                                </div>
                                                                <div style={{ display: 'flex' }}>
                                                                    <CurrencyText
                                                                        image="eth"
                                                                        size="small"
                                                                        type="text"
                                                                        value={usdMax}
                                                                    />
                                                                    <Text
                                                                        size="small"
                                                                        textStyle={{
                                                                            marginLeft: '5px',
                                                                        }}
                                                                    >{t`Max`}</Text>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </Flyout>
                                            </div>
                                            {!token.activeSwap ? (
                                                <Button
                                                    buttonStyle={{
                                                        ...styles.goToSwap,
                                                        marginBottom: '0rem',
                                                    }}
                                                    onClick={() =>
                                                        navigate(`/swap/${token.tokenId}`)
                                                    }
                                                    size="small"
                                                    textStyle={{
                                                        ...styles.goToSwapGradient,
                                                        background: lib.colors.gradient2,
                                                        paddingRight: '.5rem',
                                                    }}
                                                    label={t`Go to swap`}
                                                    rightIcon={
                                                        <IoArrowRedo color={lib.colors.green} />
                                                    }
                                                />
                                            ) : null}
                                        </div>
                                    ) : (
                                        <Text
                                            type="text"
                                            size="medium"
                                            textStyle={{
                                                color: lib.colors.white,
                                                marginLeft: '1rem',
                                            }}
                                        >
                                            {t`Owned by ${token.count} Nugg${
                                                token.count > 1 || !token.count ? 's' : ''
                                            }`}
                                        </Text>
                                    )
                                ) : null}
                            </div>
                            <div
                                style={{
                                    ...(screenType === 'phone'
                                        ? styles.nuggContainerMobile
                                        : styles.nuggContainer),
                                    marginTop: token.type === 'item' ? '1.5rem' : '0rem',
                                }}
                            >
                                <div
                                    style={{
                                        height: '400px',
                                        width: '400px',
                                        position: 'relative',
                                        padding: '.5rem',
                                    }}
                                >
                                    <div style={{ position: 'fixed' }}>
                                        <AnimatedCard>
                                            {tokenId && (
                                                <TokenViewer
                                                    tokenId={tokenId}
                                                    showcase
                                                    disableOnClick
                                                />
                                            )}
                                        </AnimatedCard>
                                    </div>
                                </div>
                            </div>
                            <HappyTabber
                                defaultActiveIndex={0}
                                items={happyTabs}
                                selectionIndicatorStyle={{ background: lib.colors.white }}
                                bodyStyle={styles.tabberList}
                                headerContainerStyle={{
                                    marginTop: '1.5rem',
                                    padding: '0rem 1rem',
                                    borderRadius: 0,
                                }}
                            />
                        </div>
                    </div>
                </>
            ) : null}
        </div>
    );
};

export default React.memo(ViewingNugg);
