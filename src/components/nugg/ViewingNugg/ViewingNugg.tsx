import React, { FunctionComponent, useMemo } from 'react';
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

import styles from './ViewingNugg.styles';
import OwnerButtons from './FlyoutButtons/OwnerButtons';
import SaleButtons from './FlyoutButtons/SaleButtons';
import LoanButtons from './FlyoutButtons/LoanButtons';
import SwapList from './SwapList';
import ItemList from './ItemList';

type Props = { MobileBackButton?: () => JSX.Element };

const ViewingNugg: FunctionComponent<Props> = ({ MobileBackButton }) => {
    const lastView__tokenId = client.live.lastView.tokenId();

    const sender = web3.hook.usePriorityAccount();

    const screenType = AppState.select.screenType();
    const chainId = web3.hook.usePriorityChainId();
    const provider = web3.hook.usePriorityProvider();

    const { token } = client.hook.useLiveToken(lastView__tokenId);

    const happyTabs = useMemo(() => {
        return [
            {
                label: 'Swaps',
                comp: ({ isActive }: { isActive: boolean }) => <SwapList />,
            },
            ...(provider &&
            chainId &&
            token &&
            token.type === 'nugg' &&
            sender === token?.owner &&
            lastView__tokenId &&
            !token?.activeSwap?.id
                ? [
                      {
                          label: 'Items',
                          comp: ({ isActive }: { isActive: boolean }) => (
                              <ItemList
                                  {...{
                                      items: token?.items,
                                      chainId,
                                      provider,
                                      sender,
                                      tokenId: lastView__tokenId,
                                  }}
                              />
                          ),
                      },
                  ]
                : []),
        ];
    }, [token, sender, chainId, provider, lastView__tokenId]);
    return token ? (
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
            <div style={screenType == 'phone' ? styles.nuggContainerMobile : styles.nuggContainer}>
                <div style={{ position: 'fixed' }}>
                    <AnimatedCard>
                        {lastView__tokenId && (
                            <TokenViewer tokenId={lastView__tokenId} showcase disableOnClick />
                        )}
                    </AnimatedCard>
                </div>
            </div>
            <div style={styles.swapsWrapper}>
                <div style={screenType === 'phone' ? styles.swapsMobile : styles.swaps}>
                    <div style={styles.owner}>
                        <Text textStyle={styles.nuggId}>
                            {lastView__tokenId && parseTokenIdSmart(lastView__tokenId)}
                        </Text>
                        <div style={{ marginLeft: '1rem' }}>
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
                                            route={'address'}
                                            size="medium"
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
                                {lastView__tokenId &&
                                    (token?.activeSwap?.id ? (
                                        <SaleButtons tokenId={lastView__tokenId} />
                                    ) : token?.activeLoan ? (
                                        <LoanButtons tokenId={lastView__tokenId} />
                                    ) : (
                                        <OwnerButtons tokenId={lastView__tokenId} />
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
