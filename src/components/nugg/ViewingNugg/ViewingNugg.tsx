import React, { FunctionComponent, MemoExoticComponent, useMemo } from 'react';
import { IoEllipsisHorizontal } from 'react-icons/io5';
import { t } from '@lingui/macro';

import lib, { parseTokenIdSmart } from '@src/lib';
import Colors from '@src/lib/colors';
import AppState from '@src/state/app';
import Loader from '@src/components/general/Loader/Loader';
import Text from '@src/components/general/Texts/Text/Text';
import TokenViewer from '@src/components/nugg/TokenViewer';
import web3 from '@src/web3';
import Flyout from '@src/components/general/Flyout/Flyout';
import client from '@src/client';
import HappyTabber from '@src/components/general/HappyTabber/HappyTabber';
import AddressViewer from '@src/components/general/Texts/AddressViewer/AddressViewer';
import { LiveNugg } from '@src/client/interfaces';
import useViewingNugg from '@src/client/hooks/useViewingNugg';
import useTokenQuery from '@src/client/hooks/useTokenQuery';
// import { LiveNuggWithLifecycle } from '@src/client/interfaces';

import globalStyles from '@src/lib/globalStyles';

import styles from './ViewingNugg.styles';
import OwnerButtons from './FlyoutButtons/OwnerButtons';
import SaleButtons from './FlyoutButtons/SaleButtons';
import LoanButtons from './FlyoutButtons/LoanButtons';
import SwapList from './SwapList';
import ItemList from './ItemList';
// import NuggAbout from './NuggAbout';
// import ItemAbout from './ItemAbout';

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

    const happyTabs = useMemo(() => {
        return [
            {
                label: t`Swaps`,
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
                                            <Text textStyle={styles.titleText}>
                                                {token?.owner === sender && (
                                                    <Text
                                                        type="text"
                                                        size="smaller"
                                                        textStyle={{ paddingLeft: '.5rem' }}
                                                    >
                                                        {t`(you)`}
                                                    </Text>
                                                )}
                                            </Text>
                                        </div>
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
                                    {t`owned by ${token?.count} nuggs`}
                                </Text>
                            )}
                        </div>
                    </div>
                    <div
                        style={
                            screenType === 'phone'
                                ? styles.nuggContainerMobile
                                : styles.nuggContainer
                        }
                    >
                        {token.type === 'nugg' && token.owner === sender && (
                            <Flyout
                                containerStyle={styles.flyout}
                                style={{ left: '1rem', top: '2rem' }}
                                button={
                                    <div style={styles.flyoutButton}>
                                        <IoEllipsisHorizontal color={Colors.nuggBlueText} />
                                    </div>
                                }
                                openOnHover
                            >
                                {tokenId &&
                                    // eslint-disable-next-line no-nested-ternary
                                    (token?.activeSwap?.id || token?.pendingClaim ? (
                                        <SaleButtons
                                            tokenId={tokenId}
                                            reclaim={!token?.pendingClaim}
                                        />
                                    ) : token?.activeLoan ? (
                                        <LoanButtons tokenId={tokenId} />
                                    ) : (
                                        <OwnerButtons tokenId={tokenId} />
                                    ))}
                            </Flyout>
                        )}
                        {/* <div style={{ position: 'fixed' }}>
                            <AnimatedCard> */}
                        {tokenId && <TokenViewer tokenId={tokenId} showcase disableOnClick />}
                        {/* </AnimatedCard>
                        </div> */}
                    </div>

                    <HappyTabber
                        defaultActiveIndex={0}
                        items={happyTabs}
                        selectionIndicatorStyle={{ background: lib.colors.white }}
                        bodyStyle={styles.tabberList}
                        // wrapperStyle={{ padding: '.6rem' }}
                        headerContainerStyle={{
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
