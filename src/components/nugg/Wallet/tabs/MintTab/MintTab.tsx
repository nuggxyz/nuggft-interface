import React, { FunctionComponent } from 'react';
import { Web3Provider } from '@ethersproject/providers';
import { IoSearch } from 'react-icons/io5';

import { isUndefinedOrNullOrObjectEmpty } from '@src/lib';
import WalletState from '@src/state/wallet';
import Button from '@src/components/general/Buttons/Button/Button';
import NumberStatistic from '@src/components/nugg/Statistics/NumberStatistic';
import TextStatistic from '@src/components/nugg/Statistics/TextStatistic';
import swapStyles from '@src/components/nugg/Wallet/tabs/SwapTab.styles';
import listStyle from '@src/components/nugg/Wallet/tabs/HistoryTab.styles';
import Text from '@src/components/general/Texts/Text/Text';
import Colors from '@src/lib/colors';
import AppState from '@src/state/app';
import AccountViewer from '@src/components/nugg/AccountViewer/AccountViewer';
import styles from '@src/components/nugg/Wallet/tabs/Tabs.styles';
import TokenViewer from '@src/components/nugg/TokenViewer';
import InfiniteList, {
    InfiniteListRenderItemProps,
} from '@src/components/general/List/InfiniteList';
import FontSize from '@src/lib/fontSize';
import FeedbackButton from '@src/components/general/Buttons/FeedbackButton/FeedbackButton';
import Layout from '@src/lib/layout';
import web3 from '@src/web3';
import client from '@src/client';
import { Chain } from '@src/web3/core/interfaces';
import { MyNuggsData } from '@src/client/core';
import undefined from '@src/lib/dotnugg/util';
type Props = Record<string, never>;

const MintTab: FunctionComponent<Props> = () => {
    const screenType = AppState.select.screenType();

    const address = web3.hook.usePriorityAccount();
    const provider = web3.hook.usePriorityProvider();
    const chainId = web3.hook.usePriorityChainId();

    const stake__eps = client.live.stake.eps();
    const nuggs = client.live.myNuggs();
    const loans = client.live.myLoans();
    const unclaimedOffers = client.live.myUnclaimedOffers();

    return chainId && provider && address ? (
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
                    {stake__eps && (
                        <NumberStatistic
                            style={{
                                alignItems: 'center',
                                margin: '0rem',
                                width: screenType === 'phone' ? '48%' : '100%',
                            }}
                            label="Balance"
                            value={stake__eps.multiply(nuggs.length).decimal.toNumber()}
                            image="eth"
                        />
                    )}
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
                        value={`${nuggs.length || 0}`}
                        style={{
                            width: '31%',
                            marginLeft: '0rem',
                            marginRight: '0rem',
                            alignItems: 'center',
                            display: 'flex',
                        }}
                    />
                    <TextStatistic
                        label="Claims"
                        value={`${unclaimedOffers.length}`}
                        style={{
                            width: '31%',
                            marginLeft: '0rem',
                            marginRight: '0rem',
                            alignItems: 'center',
                            display: 'flex',
                        }}
                    />
                    <TextStatistic
                        label="Loans"
                        value={`${loans?.length || 0}`}
                        style={{
                            width: '31%',
                            marginLeft: '0rem',
                            marginRight: '0rem',
                            alignItems: 'center',
                            display: 'flex',
                        }}
                    />
                </div>
            </div>

            <InfiniteList
                TitleButton={() => MintNuggButton(chainId, provider, address)}
                labelStyle={styles.listLabel}
                data={nuggs}
                extraData={undefined}
                RenderItem={
                    React.memo(
                        RenderItem,
                        (prev, props) => JSON.stringify(prev.item) === JSON.stringify(props.item),
                    ) as typeof RenderItem
                }
                label="My Nuggs"
                style={listStyle.list}
                listEmptyStyle={listStyle.textWhite}
                listEmptyText="You don't have any Nuggs yet!"
                loaderColor="white"
                itemHeight={108}
                action={() => undefined}
            />
        </div>
    ) : null;
};

export default MintTab;

const RenderItem: FunctionComponent<
    InfiniteListRenderItemProps<MyNuggsData, undefined, unknown>
> = ({ item, style }) => {
    return item ? (
        <div
            style={{
                ...styles.listNuggButton,
                ...style,
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
                    tokenId={item.tokenId || ''}
                    style={styles.listNugg}
                    // data={item.dotnuggRawCache}
                />

                <Text textStyle={{ color: Colors.nuggRedText }}>Nugg {item.tokenId || ''}</Text>
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
                    {!isUndefinedOrNullOrObjectEmpty(item.activeLoan) ? 'Loaned' : 'On sale'}
                </Text>
            ) : null}
            <Button
                key={JSON.stringify(item)}
                onClick={() => {
                    client.actions.routeTo(item.tokenId, true);
                }}
                buttonStyle={{
                    borderRadius: Layout.borderRadius.large,
                    padding: '.5rem .5rem',
                    background: Colors.gradient3Transparent,
                }}
                rightIcon={<IoSearch color={Colors.white} />}
            />
        </div>
    ) : null;
};

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
