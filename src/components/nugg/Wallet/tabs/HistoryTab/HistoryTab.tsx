import React, { FunctionComponent, useMemo } from 'react';

import {
    isUndefinedOrNullOrArrayEmpty,
    isUndefinedOrNullOrObjectEmpty,
} from '../../../../../lib';
import Colors from '../../../../../lib/colors';
import { fromEth } from '../../../../../lib/conversion';
import AppState from '../../../../../state/app';
import WalletState from '../../../../../state/wallet';
import Web3State from '../../../../../state/web3';
import Button from '../../../../general/Buttons/Button/Button';
import List, { ListRenderItemProps } from '../../../../general/List/List';
import Text from '../../../../general/Texts/Text/Text';
import TokenViewer from '../../../TokenViewer';

import styles from './HistoryTab.styles';

type Props = {};

const HistoryTab: FunctionComponent<Props> = () => {
    const unclaimedOffers = WalletState.select.unclaimedOffers();
    const loading = WalletState.select.loading();
    const history = WalletState.select.history();
    const address = Web3State.select.web3address();

    return (
        <div style={styles.container}>
            {!isUndefinedOrNullOrArrayEmpty(unclaimedOffers) && (
                <List
                    data={unclaimedOffers}
                    RenderItem={React.memo(
                        RenderItem,
                        (prev, props) =>
                            JSON.stringify(prev.item) ===
                            JSON.stringify(props.item),
                    )}
                    label="Unclaimed"
                    style={styles.list}
                    extraData={['claim', address]}
                />
            )}
            {!isUndefinedOrNullOrArrayEmpty(history) && (
                <List
                    data={history}
                    RenderItem={React.memo(
                        RenderItem,
                        (prev, props) =>
                            JSON.stringify(prev.item) ===
                            JSON.stringify(props.item),
                    )}
                    label="History"
                    style={styles.list}
                    extraData={['history', address]}
                    loading={loading}
                    onScrollEnd={() =>
                        WalletState.dispatch.getHistory({ addToResult: true })
                    }
                />
            )}
            {isUndefinedOrNullOrArrayEmpty(history) &&
                isUndefinedOrNullOrArrayEmpty(unclaimedOffers) && (
                    <Text>
                        Place some offers on nuggs to claim your winnings!
                    </Text>
                )}
        </div>
    );
};

const RenderItem: FunctionComponent<
    ListRenderItemProps<NL.GraphQL.Fragments.Offer.Thumbnail>
> = ({ item, index, extraData }) => {
    const parsedTitle = useMemo(() => {
        if (!isUndefinedOrNullOrObjectEmpty(item)) {
            let parsed = item.id.split('-');
            if (!isUndefinedOrNullOrArrayEmpty(parsed)) {
                return {
                    nugg: parsed[0],
                    swap: parsed[1],
                };
            }
        }
        return { swap: '', nugg: '' };
    }, [item]);

    const isWinner = useMemo(() => {
        return item && extraData[1] === item.swap.leader.id;
    }, [item, extraData]);

    return (
        !isUndefinedOrNullOrObjectEmpty(item) && (
            <div key={index} style={styles.render}>
                <div>
                    <Text textStyle={styles.renderTitle}>
                        NuggFT #{parsedTitle.nugg}
                    </Text>
                    <Text type="text" textStyle={{ color: Colors.textColor }}>
                        Swap {parsedTitle.swap}
                    </Text>
                </div>
                {extraData[0] === 'claim' ? (
                    <Button
                        textStyle={styles.textWhite}
                        buttonStyle={styles.renderButton}
                        label={`Claim your ${isWinner ? 'NUGG' : 'ETH'}`}
                        onClick={() =>
                            WalletState.dispatch.claim({
                                tokenId: parsedTitle.nugg,
                                endingEpoch: parsedTitle.nugg,
                            })
                        }
                    />
                ) : isWinner ? (
                    <Button
                        buttonStyle={styles.nuggButton}
                        onClick={() =>
                            AppState.onRouteUpdate(`/nugg/${parsedTitle.nugg}`)
                        }
                        rightIcon={
                            <TokenViewer
                                tokenId={parsedTitle.nugg}
                                style={styles.nugg}
                            />
                        }
                    />
                ) : (
                    <div style={styles.eth}>
                        <Text textStyle={styles.textWhite}>
                            {fromEth(item.eth)} ETH
                        </Text>
                    </div>
                )}
            </div>
        )
    );
};

export default React.memo(HistoryTab);
