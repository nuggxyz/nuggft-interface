import React, { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { batch } from 'react-redux';

import { EthInt } from '../../../../../classes/Fraction';
import {
    isUndefinedOrNullOrStringEmpty,
    isUndefinedOrNullOrArrayEmpty,
    isUndefinedOrNullOrObjectEmpty,
} from '../../../../../lib';
import constants from '../../../../../lib/constants';
import ProtocolState from '../../../../../state/protocol';
import WalletState from '../../../../../state/wallet';
import myNuggsQuery from '../../../../../state/wallet/queries/myNuggsQuery';
import Button from '../../../../general/Buttons/Button/Button';
import { ListRenderItemProps } from '../../../../general/List/List';
import NumberStatistic from '../../../Statistics/NumberStatistic';
import TextStatistic from '../../../Statistics/TextStatistic';
import swapStyles from '../SwapTab.styles';
import listStyle from '../HistoryTab.styles';
import Text from '../../../../general/Texts/Text/Text';
import Colors from '../../../../../lib/colors';
import AppState from '../../../../../state/app';
import AccountViewer from '../../../AccountViewer/AccountViewer';
import styles from '../Tabs.styles';
import useAsyncState from '../../../../../hooks/useAsyncState';
import loanedNuggsQuery from '../../../../../state/wallet/queries/loanedNuggsQuery';
import myActiveSalesQuery from '../../../../../state/wallet/queries/myActiveSalesQuery';
import unclaimedOffersQuery from '../../../../../state/wallet/queries/unclaimedOffersQuery';
import TokenViewer from '../../../TokenViewer';
import InfiniteList from '../../../../general/List/InfiniteList';
import FontSize from '../../../../../lib/fontSize';
import TokenState from '../../../../../state/token';
import NuggDexState from '../../../../../state/nuggdex';
import FeedbackButton from '../../../../general/Buttons/FeedbackButton/FeedbackButton';
import Layout from '../../../../../lib/layout';
import config, { SupportedChainId } from '../../../../../state/web32/config';

type Props = {};

const MintTab: FunctionComponent<Props> = () => {
    const screenType = AppState.select.screenType();
    const userShares = WalletState.select.userShares();
    const valuePerShare = ProtocolState.select.nuggftStakedEthPerShare();
    const epoch = ProtocolState.select.epoch();
    const [myNuggs, setMyNuggs] = useState([]);
    const [loadingNuggs, setLoadingNuggs] = useState(false);
    const address = config.priority.usePriorityAccount();

    const chainId = config.priority.usePriorityChainId();
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
    }, [address, epoch, myNuggs]);

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
                    }>
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
                            }}>
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
                TitleButton={() => MintNuggButton(chainId)}
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
                // extraData={[images]}
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
                            <>
                                <TokenViewer
                                    tokenId={item.id || ''}
                                    style={styles.listNugg}
                                    data={item.dotnuggRawCache}
                                />

                                <Text textStyle={{ color: Colors.nuggRedText }}>
                                    Nugg #{item.id || ''}
                                </Text>
                            </>
                        }
                    />
                )
            );
        },
        (prev, props) => JSON.stringify(prev.item) === JSON.stringify(props.item),
    );

const MintNuggButton = (chainId: SupportedChainId) => (
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
            fontFamily: Layout.font.sf.light,
        }}
        label="Mint a Nugg"
        onClick={() => WalletState.dispatch.mintNugg({ chainId })}
    />
);
