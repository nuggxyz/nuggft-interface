import React, {
    FunctionComponent,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react';

import {
    isUndefinedOrNullOrArrayEmpty,
    isUndefinedOrNullOrObjectEmpty,
    isUndefinedOrNullOrStringEmpty,
} from '../../../../../lib';
import Colors from '../../../../../lib/colors';
import constants from '../../../../../lib/constants';
import { fromEth } from '../../../../../lib/conversion';
import AppState from '../../../../../state/app';
import ProtocolState from '../../../../../state/protocol';
import WalletState from '../../../../../state/wallet';
import historyQuery from '../../../../../state/wallet/queries/historyQuery';
import unclaimedOffersQuery from '../../../../../state/wallet/queries/unclaimedOffersQuery';
import Web3State from '../../../../../state/web3';
import Button from '../../../../general/Buttons/Button/Button';
import List, { ListRenderItemProps } from '../../../../general/List/List';
import Text from '../../../../general/Texts/Text/Text';
import TokenViewer from '../../../TokenViewer';

import styles from './HistoryTab.styles';

type Props = { isActive?: boolean };

const HistoryTab: FunctionComponent<Props> = ({ isActive }) => {
    const address = Web3State.select.web3address();
    const epoch = ProtocolState.select.epoch();
    const [unclaimedOffers, setUnclaimedOffers] = useState([]);
    const [history, setHistory] = useState([]);
    const [loadingOffers, setLoadingOffers] = useState(false);
    const [loadingHistory, setLoadingHistory] = useState(false);

    const getUnclaimedOffers = useCallback(async () => {
        console.log(address);
        setLoadingOffers(true);
        if (!isUndefinedOrNullOrStringEmpty(address)) {
            const offersRes = await unclaimedOffersQuery(address, epoch.id);
            setUnclaimedOffers(offersRes);
        } else {
            setUnclaimedOffers([]);
        }
        setLoadingOffers(false);
    }, [address, epoch]);

    const getHistory = useCallback(
        async (addToResult?: boolean) => {
            setLoadingHistory(true);
            if (!isUndefinedOrNullOrStringEmpty(address)) {
                const startAt = addToResult ? history.length : 0;

                const historyRes = await historyQuery(
                    address,
                    constants.NUGGDEX_SEARCH_LIST_CHUNK,
                    startAt,
                );
                setHistory((hist) =>
                    addToResult ? [...hist, ...historyRes] : historyRes,
                );
            } else {
                setHistory([]);
            }
            setLoadingHistory(false);
        },
        [address, history],
    );

    useEffect(() => {
        if (isActive) {
            setLoadingHistory(true);
            setLoadingOffers(true);
            setTimeout(() => {
                getUnclaimedOffers();
                getHistory();
            }, 500);
        }
    }, [address]);

    return (
        <div style={styles.container}>
            {(!isUndefinedOrNullOrArrayEmpty(unclaimedOffers) ||
                loadingOffers) && (
                <List
                    data={unclaimedOffers}
                    RenderItem={React.memo(
                        RenderItem,
                        (prev, props) =>
                            JSON.stringify(prev.item) ===
                            JSON.stringify(props.item),
                    )}
                    label="Unclaimed"
                    loading={loadingOffers}
                    style={styles.list}
                    extraData={['claim', address]}
                />
            )}
            {(!isUndefinedOrNullOrArrayEmpty(history) || loadingHistory) && (
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
                    loading={loadingHistory}
                    onScrollEnd={() => getHistory(true)}
                />
            )}
            {isUndefinedOrNullOrArrayEmpty(history) &&
                isUndefinedOrNullOrArrayEmpty(unclaimedOffers) &&
                !loadingOffers &&
                !loadingHistory && (
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
                    <Text
                        type="text"
                        textStyle={{ color: Colors.textColor }}
                        size="small">
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
