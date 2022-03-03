import React, { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { batch } from 'react-redux';
import { Web3Provider } from '@ethersproject/providers';

import { EthInt } from '@src/classes/Fraction';
import {
    isUndefinedOrNullOrStringEmpty,
    isUndefinedOrNullOrArrayEmpty,
    isUndefinedOrNullOrObjectEmpty,
} from '@src/lib';
import constants from '@src/lib/constants';
import ProtocolState from '@src/state/protocol';
import WalletState from '@src/state/wallet';
import myNuggsQuery from '@src/state/wallet/queries/myNuggsQuery';
import Button from '@src/components/general/Buttons/Button/Button';
import { ListRenderItemProps } from '@src/components/general/List/List';
import NumberStatistic from '@src/components/nugg/Statistics/NumberStatistic';
import TextStatistic from '@src/components/nugg/Statistics/TextStatistic';
import swapStyles from '@src/components/nugg/Wallet/tabs/SwapTab.styles';
import listStyle from '@src/components/nugg/Wallet/tabs/HistoryTab.styles';
import Text from '@src/components/general/Texts/Text/Text';
import Colors from '@src/lib/colors';
import AppState from '@src/state/app';
import AccountViewer from '@src/components/nugg/AccountViewer/AccountViewer';
import styles from '@src/components/nugg/Wallet/tabs/Tabs.styles';
import useAsyncState from '@src/hooks/useAsyncState';
import loanedNuggsQuery from '@src/state/wallet/queries/loanedNuggsQuery';
import myActiveSalesQuery from '@src/state/wallet/queries/myActiveSalesQuery';
import unclaimedOffersQuery from '@src/state/wallet/queries/unclaimedOffersQuery';
import TokenViewer from '@src/components/nugg/TokenViewer';
import InfiniteList from '@src/components/general/List/InfiniteList';
import FontSize from '@src/lib/fontSize';
import TokenState from '@src/state/token';
import NuggDexState from '@src/state/nuggdex';
import FeedbackButton from '@src/components/general/Buttons/FeedbackButton/FeedbackButton';
import Layout from '@src/lib/layout';
import web3 from '@src/web3';
import { Chain } from '@src/web3/core/interfaces';
type Props = {};

const MintTab: FunctionComponent<Props> = () => {
    const screenType = AppState.select.screenType();
    const userShares = WalletState.select.userShares();
    const valuePerShare = ProtocolState.select.nuggftStakedEthPerShare();
    const epoch = ProtocolState.select.epoch();
    const [myNuggs, setMyNuggs] = useState([]);
    const [loadingNuggs, setLoadingNuggs] = useState(false);
    const address = web3.hook.usePriorityAccount();
    const provider = web3.hook.usePriorityProvider();

    const chainId = web3.hook.usePriorityChainId();
    const loans = useAsyncState(
        () => loanedNuggsQuery(chainId, address, 'desc', '', 1000, 0),
        [address, epoch, chainId],
    );
    const sales = useAsyncState(
        () => myActiveSalesQuery(chainId, address, 'desc', '', 1000, 0),
        [address, epoch, chainId],
    );

    const claims = useAsyncState(
        () => unclaimedOffersQuery(chainId, address, epoch?.id),
        [address, epoch],
    );

    const getMyNuggs = useCallback(async () => {
        setLoadingNuggs(true);
        if (!isUndefinedOrNullOrStringEmpty(address)) {
            const nuggResult = await myNuggsQuery(
                chainId,

                address,
                'desc',
                '',
                constants.NUGGDEX_SEARCH_LIST_CHUNK,
                myNuggs.length,
            );

            if (!isUndefinedOrNullOrArrayEmpty(nuggResult)) {
                setMyNuggs((res) => [...res, ...nuggResult]);
            }
        } else {
            setMyNuggs([]);
        }
        setLoadingNuggs(false);
    }, [address, epoch, myNuggs, chainId]);

    useEffect(() => {
        setLoadingNuggs(true);
        setTimeout(() => {
            getMyNuggs();
        }, 500);
    }, [address]);

    return (
        <div style={styles.container}>
            <div>
                <div
                    style={
                        screenType === 'phone'
                            ? {
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                              }
                            : undefined
                    }
                >
                    <NumberStatistic
                        style={{
                            alignItems: 'center',
                            margin: '0rem',
                            width: screenType === 'phone' ? '48%' : '100%',
                        }}
                        label="TVL"
                        value={new EthInt(`${+valuePerShare * userShares}`)}
                        image="eth"
                    />
                    {screenType === 'phone' && (
                        <div
                            style={{
                                background: Colors.transparentWhite,
                                padding: '12px 10px',
                                borderRadius: Layout.borderRadius.medium,
                                width: '48%',
                            }}
                        >
                            <AccountViewer />
                        </div>
                    )}
                </div>
                <div style={swapStyles.statisticContainer}>
                    <TextStatistic
                        label="Nuggs"
                        value={'' + (userShares || 0)}
                        style={{
                            width: '23%',
                            marginLeft: '0rem',
                            marginRight: '0rem',
                        }}
                    />
                    <TextStatistic
                        label="Claims"
                        value={'' + (claims?.length || 0)}
                        style={{
                            width: '23%',
                            marginLeft: '0rem',
                            marginRight: '0rem',
                        }}
                    />
                    <TextStatistic
                        label="Sales"
                        value={'' + (sales?.length || 0)}
                        style={{
                            width: '23%',
                            marginLeft: '0rem',
                            marginRight: '0rem',
                            fontSize: FontSize.h6,
                        }}
                    />
                    <TextStatistic
                        label="Loans"
                        value={'' + (loans?.length || 0)}
                        style={{
                            width: '23%',
                            marginLeft: '0rem',
                            marginRight: '0rem',
                        }}
                    />
                </div>
            </div>

            <InfiniteList
                TitleButton={() => MintNuggButton(chainId, provider, address)}
                labelStyle={styles.listLabel}
                data={myNuggs}
                RenderItem={React.memo(
                    RenderItem,
                    (prev, props) => JSON.stringify(prev.item) === JSON.stringify(props.item),
                )}
                label="My Nuggs"
                loading={loadingNuggs}
                style={listStyle.list}
                listEmptyStyle={listStyle.textWhite}
                listEmptyText="You don't have any Nuggs yet!"
                loaderColor="white"
                onScrollEnd={getMyNuggs}
                itemHeight={108}
            />
        </div>
    );
};

export default MintTab;

const RenderItem: FunctionComponent<ListRenderItemProps<NL.GraphQL.Fragments.Nugg.ListItem>> =
    React.memo(
        ({ item, extraData, style, index }) => {
            return (
                !isUndefinedOrNullOrObjectEmpty(item) && (
                    <Button
                        key={JSON.stringify(item)}
                        onClick={() => {
                            batch(() => {
                                TokenState.dispatch.setNugg(item);
                                AppState.dispatch.changeView('Search');
                                NuggDexState.dispatch.addToRecents(item);
                            });
                            AppState.silentlySetRoute(`#/nugg/${item.id}`);
                        }}
                        buttonStyle={{ ...styles.listNuggButton, ...style }}
                        rightIcon={
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    width: '100%',
                                }}
                            >
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                    }}
                                >
                                    <TokenViewer
                                        tokenId={item.id || ''}
                                        style={styles.listNugg}
                                        data={item.dotnuggRawCache}
                                    />

                                    <Text textStyle={{ color: Colors.nuggRedText }}>
                                        Nugg #{item.id || ''}
                                    </Text>
                                </div>
                                {!isUndefinedOrNullOrObjectEmpty(item.activeLoan) ||
                                !isUndefinedOrNullOrObjectEmpty(item.activeSwap) ? (
                                    <Text
                                        textStyle={{
                                            color: Colors.secondaryColor,
                                            background: Colors.nuggRedText,
                                            borderRadius: Layout.borderRadius.large,
                                            padding: '.1rem .4rem ',
                                            position: 'absolute',
                                            top: '-.3rem',
                                            right: '-.3rem',
                                        }}
                                        size="smaller"
                                        type="text"
                                    >
                                        {!isUndefinedOrNullOrObjectEmpty(item.activeLoan)
                                            ? 'Loaned'
                                            : 'On sale'}
                                    </Text>
                                ) : null}
                            </div>
                        }
                    />
                )
            );
        },
        (prev, props) => JSON.stringify(prev.item) === JSON.stringify(props.item),
    );

const MintNuggButton = (chainId: Chain, provider: Web3Provider, address: string) => (
    <FeedbackButton
        feedbackText="Check Wallet..."
        buttonStyle={{
            ...swapStyles.button,
            margin: '0rem',
            padding: '.2rem .6rem',
        }}
        textStyle={{
            color: Colors.nuggRedText,
            fontSize: FontSize.h6,
            fontFamily: Layout.font.sf.regular,
        }}
        label="Mint a Nugg"
        onClick={() => WalletState.dispatch.mintNugg({ chainId, provider, address })}
    />
);
