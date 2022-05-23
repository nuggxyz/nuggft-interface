import React, { FunctionComponent } from 'react';
import { t } from '@lingui/macro';

import NumberStatistic from '@src/components/nugg/Statistics/NumberStatistic';
import TextStatistic from '@src/components/nugg/Statistics/TextStatistic';
import AccountViewer from '@src/components/nugg/AccountViewer/AccountViewer';
import web3 from '@src/web3';
import client from '@src/client';
import globalStyles from '@src/lib/globalStyles';
import useDimensions from '@src/client/hooks/useDimensions';
import GodList from '@src/components/general/List/GodList';

import styles from './HomeTab.styles';
import MintNuggButton from './MintNuggButton';
import MyNuggRenderItem from './MyNuggRenderItem';

type Props = Record<string, never>;

const HomeTab: FunctionComponent<Props> = () => {
    const { screen: screenType } = useDimensions();

    const address = web3.hook.usePriorityAccount();
    const provider = web3.hook.usePriorityProvider();
    const chainId = web3.hook.usePriorityChainId();

    const stake__eps = client.live.stake.eps();
    const nuggs = client.live.myNuggs();
    const loans = client.live.myLoans();
    const unclaimedOffers = client.live.myUnclaimedOffers();

    const balancePair = client.usd.useUsdPair(stake__eps && stake__eps.multiply(nuggs.length));

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
                            label={t`Balance`}
                            value={balancePair}
                            // image="eth"
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
                        label={t`Nuggs`}
                        value={`${nuggs.length || 0}`}
                        style={styles.statistic}
                    />
                    <TextStatistic
                        label={t`Claims`}
                        value={`${unclaimedOffers.length}`}
                        style={styles.statistic}
                    />
                    <TextStatistic
                        label={t`Loans`}
                        value={`${loans?.length || 0}`}
                        style={styles.statistic}
                    />
                </div>
            </div>
            {/* <MyNuggItemListPhone /> */}
            <GodList
                id="home-tab-myNuggs"
                TitleButton={MintNuggButton}
                labelStyle={styles.listLabel}
                data={nuggs}
                extraData={undefined}
                RenderItem={MyNuggRenderItem}
                label={t`My Nuggs`}
                style={styles.list}
                listEmptyStyle={styles.textWhite}
                listEmptyText={t`You don't have any Nuggs yet!`}
                loaderColor="white"
                itemHeight={108}
                action={() => undefined}
            />
        </div>
    ) : null;
};

export default HomeTab;
