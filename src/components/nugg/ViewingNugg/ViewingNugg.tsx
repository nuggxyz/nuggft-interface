import React, { FunctionComponent, MemoExoticComponent, useMemo, useState } from 'react';
import { IoCheckmarkCircle, IoCloseCircleOutline } from 'react-icons/io5';
import { t } from '@lingui/macro';

import lib, { parseTokenIdSmart } from '@src/lib';
import Colors from '@src/lib/colors';
import AppState from '@src/state/app';
import Loader from '@src/components/general/Loader/Loader';
import Text from '@src/components/general/Texts/Text/Text';
import TokenViewer from '@src/components/nugg/TokenViewer';
import web3 from '@src/web3';
import client from '@src/client';
import HappyTabber from '@src/components/general/HappyTabber/HappyTabber';
import AddressViewer from '@src/components/general/Texts/AddressViewer/AddressViewer';
import useViewingNugg from '@src/client/hooks/useViewingNugg';
import useTokenQuery from '@src/client/hooks/useTokenQuery';
// import { LiveNuggWithLifecycle } from '@src/client/interfaces';

import globalStyles from '@src/lib/globalStyles';
import AnimatedCard from '@src/components/general/Cards/AnimatedCard/AnimatedCard';
import Button from '@src/components/general/Buttons/Button/Button';

import styles from './ViewingNugg.styles';
import SwapList from './SwapList';
import ItemList from './ItemList';
import MyNuggActions from './MyNuggActions';

type Props = { MobileBackButton?: MemoExoticComponent<() => JSX.Element> };

const ViewingNugg: FunctionComponent<Props> = ({ MobileBackButton }) => {
    const epoch = client.live.epoch.id();

    const { safeTokenId: tokenId } = useViewingNugg();

    const sender = web3.hook.usePriorityAccount();

    const tokenQuery = useTokenQuery();

    React.useEffect(() => {
        if (tokenId) void tokenQuery(tokenId);
    }, [tokenId, tokenQuery]);

    const screenType = AppState.select.screenType();
    const chainId = web3.hook.usePriorityChainId();
    const provider = web3.hook.usePriorityProvider();

    const token = client.live.token(tokenId);
    const [zoomEnabled, setZoomEnabled] = useState(true);

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
                comp: React.memo(() => <SwapList token={token} />),
            },
            ...(provider && chainId && token && token.type === 'nugg' && sender && tokenId
                ? [
                      {
                          label: 'Items',
                          comp: React.memo(() => (
                              <ItemList
                                  items={token?.items}
                                  chainId={chainId}
                                  provider={provider}
                                  sender={sender}
                                  isOwner={sender === token.owner && !token?.activeSwap?.id}
                                  tokenId={tokenId}
                              />
                          )),
                      },
                  ]
                : []),
        ];
    }, [token, sender, chainId, provider, tokenId]);

    return provider && epoch && tokenId && token ? (
        <div style={styles.container}>
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
                            {tokenId && parseTokenIdSmart(tokenId)}
                        </Text>
                        <div style={{ marginLeft: '1rem' }}>
                            {token.type === 'nugg' ? (
                                token.owner ? (
                                    <>
                                        <Text
                                            type="text"
                                            size="smaller"
                                            textStyle={{
                                                color: Colors.white,
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
                                    </>
                                ) : (
                                    <Loader color={Colors.nuggBlueText} />
                                )
                            ) : token ? (
                                <Text
                                    type="text"
                                    size="medium"
                                    textStyle={{ color: lib.colors.white }}
                                >
                                    {t`Owned by ${token.count} Nugg${
                                        token.count > 1 || !token.count ? 's' : ''
                                    }`}
                                </Text>
                            ) : null}
                        </div>
                        <Button
                            size="small"
                            type="text"
                            buttonStyle={styles.zoom}
                            label={t`Zoom`}
                            textStyle={styles.textBlue}
                            onClick={() => setZoomEnabled(!zoomEnabled)}
                            rightIcon={
                                zoomEnabled ? (
                                    <IoCheckmarkCircle
                                        color={lib.colors.nuggBlueText}
                                        size={20}
                                        style={{ paddingLeft: '.3rem' }}
                                    />
                                ) : (
                                    <IoCloseCircleOutline
                                        color={lib.colors.nuggBlueText}
                                        size={20}
                                        style={{ paddingLeft: '.3rem' }}
                                    />
                                )
                            }
                        />
                    </div>
                    <div
                        style={
                            screenType === 'phone'
                                ? styles.nuggContainerMobile
                                : styles.nuggContainer
                        }
                    >
                        <div
                            style={{
                                height: '400px',
                                width: '400px',
                                position: 'relative',
                            }}
                        >
                            <div style={{ position: 'fixed' }}>
                                <AnimatedCard disable={!zoomEnabled}>
                                    {tokenId && (
                                        <TokenViewer tokenId={tokenId} showcase disableOnClick />
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
        </div>
    ) : null;
};

export default React.memo(ViewingNugg);
