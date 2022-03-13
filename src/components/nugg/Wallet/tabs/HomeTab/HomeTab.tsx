import React, { FunctionComponent } from 'react';

import NumberStatistic from '@src/components/nugg/Statistics/NumberStatistic';
import TextStatistic from '@src/components/nugg/Statistics/TextStatistic';
import AppState from '@src/state/app';
import AccountViewer from '@src/components/nugg/AccountViewer/AccountViewer';
import InfiniteList from '@src/components/general/List/InfiniteList';
import web3 from '@src/web3';
import client from '@src/client';
import globalStyles from '@src/lib/globalStyles';

import MintNuggButton from './MintNuggButton';
import MyNuggRenderItem from './MyNuggRenderItem';
import styles from './HomeTab.styles';
type Props = Record<string, never>;

const HomeTab: FunctionComponent<Props> = () => {
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
                <div style={screenType === 'phone' ? styles.phoneContainer : undefined}>
                    {stake__eps && (
                        <NumberStatistic
                            style={{
                                ...styles.mainStatistic,
                                width: screenType === 'phone' ? '48%' : '100%',
                            }}
                            label="Balance"
                            value={stake__eps.multiply(nuggs.length).decimal.toNumber()}
                            image="eth"
                        />
                    )}
                    {screenType === 'phone' && (
                        <div style={styles.phoneAccountViewer}>
                            <AccountViewer />
                        </div>
                    )}
                </div>
                <div style={globalStyles.centeredSpaceBetween}>
                    <TextStatistic
                        label="Nuggs"
                        value={`${nuggs.length || 0}`}
                        style={styles.statistic}
                    />
                    <TextStatistic
                        label="Claims"
                        value={`${unclaimedOffers.length}`}
                        style={styles.statistic}
                    />
                    <TextStatistic
                        label="Loans"
                        value={`${loans?.length || 0}`}
                        style={styles.statistic}
                    />
                </div>
            </div>
            <InfiniteList
                TitleButton={MintNuggButton}
                labelStyle={styles.listLabel}
                data={nuggs}
                extraData={undefined}
                RenderItem={MyNuggRenderItem}
                label="My Nuggs"
                style={styles.list}
                listEmptyStyle={styles.textWhite}
                listEmptyText="You don't have any Nuggs yet!"
                loaderColor="white"
                itemHeight={108}
                action={() => undefined}
            />
        </div>
    ) : null;
};

export default HomeTab;
