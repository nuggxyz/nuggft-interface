import React from 'react';
import { t } from '@lingui/macro';
import { IoSearch } from 'react-icons/io5';
import curriedLighten from 'polished/lib/color/lighten';

import TextStatistic from '@src/components/nugg/Statistics/TextStatistic';
import web3 from '@src/web3';
import client from '@src/client';
import globalStyles from '@src/lib/globalStyles';
import { SwapData } from '@src/client/interfaces';
import Button from '@src/components/general/Buttons/Button/Button';
import CurrencyText from '@src/components/general/Texts/CurrencyText/CurrencyText';
import TokenViewer from '@src/components/nugg/TokenViewer';
import lib, { parseTokenIdSmart } from '@src/lib';
import Label from '@src/components/general/Label/Label';
import useRemaining from '@src/client/hooks/useRemaining';
import SimpleList from '@src/components/general/List/SimpleList';

import styles from './ActiveTab.styles';
import SeeAllButton from './SeeAllButton';

const fancy = curriedLighten(0.25)(lib.colors.blue);

export const ActiveRenderItem = ({
    item,
    onClick,
}: {
    item: SwapData;
    onClick?: (arg: typeof item) => void;
}) => {
    const routeTo = client.mutate.routeTo();

    return item ? (
        <div
            aria-hidden="true"
            role="button"
            style={{
                display: 'flex',
                padding: '.5rem 1rem',
                background: lib.colors.white,
                justifyContent: 'space-between',
                alignItems: 'center',
                width: '100%',
                borderRadius: lib.layout.borderRadius.medium,
                margin: '0rem 0rem',
            }}
            onClick={
                onClick
                    ? () => {
                          onClick(item);
                      }
                    : undefined
            }
        >
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <TokenViewer tokenId={item.tokenId} style={globalStyles.listNugg} />
                <div>
                    <Label
                        text={parseTokenIdSmart(item.tokenId || '')}
                        containerStyles={{
                            color: 'white',
                            marginBottom: '5px',
                            background: fancy,
                        }}
                    />
                    <CurrencyText textStyle={{ color: fancy }} value={item.eth.number} />
                </div>
            </div>

            <Button
                key={JSON.stringify(item)}
                onClick={() => {
                    routeTo(item.tokenId, true);
                }}
                buttonStyle={styles.searchButton}
                rightIcon={<IoSearch color={lib.colors.white} />}
            />
        </div>
    ) : null;
};

export default () => {
    // const screenType = AppState.select.screenType();

    const provider = web3.hook.usePriorityProvider();
    const chainId = web3.hook.usePriorityChainId();

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

    return chainId && provider ? (
        <div style={styles.container}>
            <div>
                {/* <div style={screenType === 'phone' ? styles.phoneContainer : undefined}>
                    {screenType === 'phone' && (
                        <div style={styles.phoneAccountViewer}>
                            <AccountViewer />
                        </div>
                    )}
                </div> */}
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

            <SimpleList
                TitleButton={SeeAllButton}
                labelStyle={styles.listLabel}
                data={sortedAll.current}
                extraData={undefined}
                RenderItem={ActiveRenderItem}
                label={t`Ending in about ${minutes} minutes`}
                style={styles.list}
                loaderColor="white"
                action={() => undefined}
            />

            <SimpleList
                // TitleButton={SeeAllButton}
                labelStyle={{ ...styles.listLabel, marginTop: '20px' }}
                data={sortedAll.next}
                extraData={undefined}
                RenderItem={ActiveRenderItem}
                label={t`Coming Up`}
                style={{ ...styles.list }}
                listEmptyStyle={styles.textWhite}
                listEmptyText={t`no action here...`}
                loaderColor="white"
                action={() => undefined}
            />
        </div>
    ) : null;
};
