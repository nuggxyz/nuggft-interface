import React from 'react';
import { t } from '@lingui/macro';
import { IoSearch } from 'react-icons/io5';
import curriedLighten from 'polished/lib/color/lighten';

import TextStatistic from '@src/components/nugg/Statistics/TextStatistic';
import web3 from '@src/web3';
import client from '@src/client';
import globalStyles from '@src/lib/globalStyles';
import Button from '@src/components/general/Buttons/Button/Button';
import CurrencyText from '@src/components/general/Texts/CurrencyText/CurrencyText';
import TokenViewer from '@src/components/nugg/TokenViewer';
import lib from '@src/lib';
import Label from '@src/components/general/Label/Label';
import useRemaining from '@src/client/hooks/useRemaining';
import SimpleList from '@src/components/general/List/SimpleList';
import useViewingNugg from '@src/client/hooks/useViewingNugg';
import useSortedSwapList from '@src/client/hooks/useSortedSwapList';

import styles from './ActiveTab.styles';
import SeeAllButton from './SeeAllButton';

const fancy = curriedLighten(0.25)(lib.colors.blue);

export const ActiveRenderItem = ({
    item: tokenId,
    onClick,
}: {
    item: TokenId;
    onClick?: (arg: typeof tokenId) => void;
}) => {
    const { gotoViewingNugg } = useViewingNugg();
    const swap = client.swaps.useSwap(tokenId);
    return tokenId ? (
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
                          onClick(tokenId);
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
                <TokenViewer tokenId={tokenId} style={globalStyles.listNugg} />
                <div>
                    <Label
                        text={tokenId.toPrettyId()}
                        containerStyles={{
                            color: 'white',
                            marginBottom: '5px',
                            background: fancy,
                        }}
                    />
                    <CurrencyText textStyle={{ color: fancy }} value={swap?.eth.number || 0} />
                </div>
            </div>

            <Button
                key={JSON.stringify(swap)}
                onClick={() => {
                    gotoViewingNugg(tokenId);
                }}
                buttonStyle={styles.searchButton}
                rightIcon={<IoSearch color={lib.colors.white} />}
            />
        </div>
    ) : null;
};

export default () => {
    const provider = web3.hook.usePriorityProvider();
    const chainId = web3.hook.usePriorityChainId();

    const swaps = useSortedSwapList();

    const { minutes } = useRemaining(client.live.epoch.default());

    return chainId && provider ? (
        <div style={styles.container}>
            <div>
                <div style={globalStyles.centeredSpaceBetween}>
                    <TextStatistic
                        label={t`Nuggs`}
                        value={`${swaps.current.length}`}
                        style={styles.statistic}
                    />
                    <TextStatistic
                        label={t`Active Items`}
                        value={`${swaps.next.length}`}
                        style={styles.statistic}
                    />
                </div>
            </div>

            <SimpleList
                TitleButton={SeeAllButton}
                labelStyle={styles.listLabel}
                data={swaps.current}
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
                data={swaps.next}
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
