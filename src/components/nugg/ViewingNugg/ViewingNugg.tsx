import React, { FunctionComponent, MemoExoticComponent, useMemo } from 'react';
import { IoEllipsisHorizontal } from 'react-icons/io5';

import { parseTokenIdSmart } from '@src/lib';
import Colors from '@src/lib/colors';
import AppState from '@src/state/app';
import AnimatedCard from '@src/components/general/Cards/AnimatedCard/AnimatedCard';
import Loader from '@src/components/general/Loader/Loader';
import Text from '@src/components/general/Texts/Text/Text';
import TokenViewer from '@src/components/nugg/TokenViewer';
import web3 from '@src/web3';
import Flyout from '@src/components/general/Flyout/Flyout';
import client from '@src/client';
import HappyTabber from '@src/components/general/HappyTabber/HappyTabber';
import AddressViewer from '@src/components/general/Texts/AddressViewer/AddressViewer';
import { LiveNugg } from '@src/client/hooks/useLiveNugg';

import styles from './ViewingNugg.styles';
import OwnerButtons from './FlyoutButtons/OwnerButtons';
import SaleButtons from './FlyoutButtons/SaleButtons';
import LoanButtons from './FlyoutButtons/LoanButtons';
import SwapList from './SwapList';
import ItemList from './ItemList';
import NuggAbout from './NuggAbout';
import ItemAbout from './ItemAbout';

type Props = { MobileBackButton?: MemoExoticComponent<() => JSX.Element> };

const ViewingNugg: FunctionComponent<Props> = ({ MobileBackButton }) => {
    const tokenId = client.live.lastView.tokenId();
    const epoch = client.live.epoch.id();

    const sender = web3.hook.usePriorityAccount();

    const screenType = AppState.select.screenType();
    const chainId = web3.hook.usePriorityChainId();
    const provider = web3.hook.usePriorityProvider();

    const { token } = client.hook.useLiveToken(tokenId);

    const happyTabs = useMemo(() => {
        return [
            {
                label: 'Swaps',
                comp: React.memo(SwapList),
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
            <div style={screenType === 'phone' ? styles.nuggContainerMobile : styles.nuggContainer}>
                <div style={{ position: 'fixed' }}>
                    <AnimatedCard>
                        {tokenId && <TokenViewer tokenId={tokenId} showcase disableOnClick />}
                    </AnimatedCard>
                </div>
            </div>

            <div style={{ width: '80%' }}>
                {token.type === 'item' && (
                    <ItemAbout token={token} tokenId={tokenId} epoch={epoch} />
                )}

                {token.type === 'nugg' && token.activeSwap !== undefined && (
                    <NuggAbout
                        tokenId={tokenId}
                        token={token as Required<LiveNugg>}
                        epoch={epoch}
                        provider={provider}
                    />
                )}
            </div>

            <div style={styles.swapsWrapper}>
                <div style={screenType === 'phone' ? styles.swapsMobile : styles.swaps}>
                    <div style={styles.owner}>
                        <Text textStyle={styles.nuggId}>
                            {tokenId && parseTokenIdSmart(tokenId)}
                        </Text>
                        <div style={{ marginLeft: '1rem' }}>
                            {/* eslint-disable-next-line no-nested-ternary */}
                            {token.type === 'nugg' ? (
                                token.owner ? (
                                    <>
                                        <Text
                                            type="text"
                                            size="smaller"
                                            textStyle={{
                                                color: Colors.nuggBlueText,
                                            }}
                                        >
                                            Owner
                                        </Text>
                                        <AddressViewer
                                            address={token.owner}
                                            textStyle={styles.titleText}
                                            param={token.owner}
                                            route="address"
                                            size="medium"
                                            isNugg={false}
                                        />
                                        <Text textStyle={styles.titleText}>
                                            {token?.owner === sender && (
                                                <Text
                                                    type="text"
                                                    size="smaller"
                                                    textStyle={{ paddingLeft: '.5rem' }}
                                                >
                                                    (you)
                                                </Text>
                                            )}
                                        </Text>
                                    </>
                                ) : (
                                    <Loader color={Colors.nuggBlueText} />
                                )
                            ) : (
                                <Text
                                    type="text"
                                    size="smaller"
                                    textStyle={{ paddingLeft: '.5rem' }}
                                >
                                    owned by {token?.count} nuggs
                                </Text>
                            )}
                        </div>

                        {token.type === 'nugg' && token.owner === sender && (
                            <Flyout
                                containerStyle={styles.flyout}
                                style={{ right: '1.5rem', top: '2rem' }}
                                button={
                                    <div style={styles.flyoutButton}>
                                        <IoEllipsisHorizontal color={Colors.white} />
                                    </div>
                                }
                            >
                                {tokenId &&
                                    // eslint-disable-next-line no-nested-ternary
                                    (token?.activeSwap?.id ? (
                                        <SaleButtons tokenId={tokenId} />
                                    ) : token?.activeLoan ? (
                                        <LoanButtons tokenId={tokenId} />
                                    ) : (
                                        <OwnerButtons tokenId={tokenId} />
                                    ))}
                            </Flyout>
                        )}
                    </div>

                    <HappyTabber
                        defaultActiveIndex={0}
                        items={happyTabs}
                        bodyStyle={styles.stickyList}
                        headerContainerStyle={{
                            background: Colors.transparentWhite,
                            borderRadius: 0,
                        }}
                    />
                </div>
            </div>
        </div>
    ) : null;
};

export default React.memo(ViewingNugg);
