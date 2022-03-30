import React from 'react';
import { t } from '@lingui/macro';

import TextStatistic from '@src/components/nugg/Statistics/TextStatistic';
import AppState from '@src/state/app';
import AccountViewer from '@src/components/nugg/AccountViewer/AccountViewer';
import InfiniteList from '@src/components/general/List/InfiniteList';
import web3 from '@src/web3';
import client from '@src/client';
import globalStyles from '@src/lib/globalStyles';
import useRemaining from '@src/hooks/useRemaining';
import { SwapData } from '@src/client/interfaces';

import SeeAllButton from './SeeAllButton';
import ActiveTabRenderItem from './ActiveTabRenderItem';
import styles from './ActiveTab.styles';

export default () => {
    const screenType = AppState.select.screenType();

    const address = web3.hook.usePriorityAccount();
    const provider = web3.hook.usePriorityProvider();
    const chainId = web3.hook.usePriorityChainId();

    // const stake__eps = client.live.stake.eps();
    const activeNuggs = client.live.activeSwaps();
    const activeItems = client.live.activeItems();

    const epoch = client.live.epoch.id();

    const all = React.useMemo(() => {
        return [...activeNuggs, ...activeItems].sort((a, b) => (a.eth.lt(b.eth) ? -1 : 1));
    }, [activeNuggs, activeItems]);

    const sortedAll = React.useMemo(() => {
        return all.reduce(
            (prev: { current: SwapData[]; next: SwapData[] }, curr) => {
                if (epoch) {
                    if (curr.endingEpoch === epoch) {
                        prev.current.push(curr);
                    } else if (curr.endingEpoch === epoch + 1) {
                        prev.next.push(curr);
                    }
                }
                return prev;
            },
            { current: [], next: [] },
        );
    }, [all, epoch]);

    const { minutes } = useRemaining(client.live.epoch.default());

    return chainId && provider && address ? (
        <div style={styles.container}>
            <div>
                <div style={screenType === 'phone' ? styles.phoneContainer : undefined}>
                    {/* {stake__eps && (
                        <NumberStatistic
                            style={{
                                ...styles.mainStatistic,
                                width: screenType === 'phone' ? '48%' : '100%',
                            }}
                            label={t`Balance`}
                            value={stake__eps.multiply(nuggs.length).decimal.toNumber()}
                            image="eth"
                        />
                    )} */}
                    {screenType === 'phone' && (
                        <div style={styles.phoneAccountViewer}>
                            <AccountViewer />
                        </div>
                    )}
                </div>
                <div style={globalStyles.centeredSpaceBetween}>
                    <TextStatistic
                        label={t`Nuggs`}
                        value={`${activeNuggs.length}`}
                        style={styles.statistic}
                    />
                    <TextStatistic
                        label={t`Active Items`}
                        value={`${activeItems.length}`}
                        style={styles.statistic}
                    />
                </div>
            </div>

            <InfiniteList
                id="home-tab-activeNuggs"
                TitleButton={SeeAllButton}
                labelStyle={styles.listLabel}
                data={sortedAll.current}
                extraData={undefined}
                RenderItem={ActiveTabRenderItem}
                label={t`Ending in about ${minutes} minutes`}
                style={styles.list}
                loaderColor="white"
                itemHeight={108}
                action={() => undefined}
            />

            <InfiniteList
                id="home-tab-incomingNuggs"
                // TitleButton={SeeAllButton}
                labelStyle={{ ...styles.listLabel, marginTop: '20px' }}
                data={sortedAll.next}
                extraData={undefined}
                RenderItem={ActiveTabRenderItem}
                label={t`Coming Up`}
                style={{ ...styles.list }}
                listEmptyStyle={styles.textWhite}
                listEmptyText={t`no action here...`}
                loaderColor="white"
                itemHeight={108}
                action={() => undefined}
            />
        </div>
    ) : null;
};
