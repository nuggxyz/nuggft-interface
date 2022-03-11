import React, { FunctionComponent, useMemo } from 'react';
import { IoEllipsisHorizontal } from 'react-icons/io5';

import { isUndefinedOrNullOrStringEmpty, parseTokenIdSmart } from '@src/lib';
import Colors from '@src/lib/colors';
import AppState from '@src/state/app';
import AnimatedCard from '@src/components/general/Cards/AnimatedCard/AnimatedCard';
import Loader from '@src/components/general/Loader/Loader';
import Text from '@src/components/general/Texts/Text/Text';
import TokenViewer from '@src/components/nugg/TokenViewer';
import web3 from '@src/web3';
import Flyout from '@src/components/general/Flyout/Flyout';
import client from '@src/client';
import { LiveNugg } from '@src/client/hooks/useLiveNugg';
import { Route } from '@src/client/router';
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
    const lastView__tokenId = client.live.lastView__tokenId();
    const lastView__type = client.live.lastView__type();

    const address = web3.hook.usePriorityAccount();

    const screenType = AppState.select.screenType();
    const chainId = web3.hook.usePriorityChainId();
    const provider = web3.hook.usePriorityProvider();

    const token = client.hook.useLiveToken(lastView__tokenId);

    const ens = web3.hook.usePriorityAnyENSName(provider, (token as LiveNugg)?.owner);

    const happyTabs = useMemo(() => {
        return [
            {
                label: 'Swaps',
                comp: ({ isActive }) => (
                    <SwapList
                        {...{
                            chainId,
                            provider,
                            token,
                            tokenIsItem: lastView__type === Route.ViewItem,
                            swaps: token?.swaps,
                            tokenId: lastView__tokenId,
                        }}
                    />
                ),
            },
            ...(token?.type === 'nugg' && address === token?.owner && !token?.activeSwap?.id
                ? [
                      {
                          label: 'Items',
                          comp: ({ isActive }) => (
                              <ItemList
                                  {...{
                                      items: token?.items,
                                      chainId,
                                      provider,
                                      address,
                                      tokenId: lastView__tokenId,
                                  }}
                              />
                          ),
                      },
                  ]
                : []),
        ];
    }, [token, address, chainId, provider, token, lastView__tokenId, lastView__type]);
    return (
        !isUndefinedOrNullOrStringEmpty(lastView__tokenId) && (
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
                <div
                    style={
                        screenType == 'phone' ? styles.nuggContainerMobile : styles.nuggContainer
                    }
                >
                    <div style={{ position: 'fixed' }}>
                        <AnimatedCard>
                            <TokenViewer tokenId={lastView__tokenId} showcase />
                        </AnimatedCard>
                    </div>
                </div>
                <div style={styles.swapsWrapper}>
                    <div style={screenType === 'phone' ? styles.swapsMobile : styles.swaps}>
                        <div style={styles.owner}>
                            <Text textStyle={styles.nuggId}>
                                {parseTokenIdSmart(lastView__tokenId)}
                            </Text>
                            <div style={{ marginLeft: '1rem' }}>
                                {token?.type === 'nugg' ? (
                                    token?.owner ? (
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
                                                address={token?.owner}
                                                textStyle={styles.titleText}
                                                param={token?.owner}
                                                route={'address'}
                                                size="medium"
                                            />
                                            <Text textStyle={styles.titleText}>
                                                {/* {token?.owner === Address.ZERO.hash ||
                                                token?.owner === CONTRACTS[chainId].NuggftV1
                                                    ? 'NuggftV1'
                                                    : lastView__type === Route.ViewItem
                                                    ? `Nugg #${token?.owner}`
                                                    : ens} */}
                                                {token?.owner === address && (
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
                            {token?.type === 'nugg' && token?.owner === address && (
                                <Flyout
                                    containerStyle={styles.flyout}
                                    style={{ right: '1.5rem', top: '2rem' }}
                                    button={
                                        <div style={styles.flyoutButton}>
                                            <IoEllipsisHorizontal color={Colors.white} />
                                        </div>
                                    }
                                >
                                    {token?.activeSwap?.id ? (
                                        <SaleButtons tokenId={lastView__tokenId} />
                                    ) : token?.activeLoan ? (
                                        <LoanButtons tokenId={lastView__tokenId} />
                                    ) : (
                                        <OwnerButtons tokenId={lastView__tokenId} />
                                    )}
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
        )
    );
};

export default React.memo(ViewingNugg);
