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
import ProtocolState from '../../../../../state/protocol';
import WalletState from '../../../../../state/wallet';
import unclaimedOffersQuery from '../../../../../state/wallet/queries/unclaimedOffersQuery';
import Web3State from '../../../../../state/web3';
import Button from '../../../../general/Buttons/Button/Button';
import Text from '../../../../general/Texts/Text/Text';
import List, { ListRenderItemProps } from '../../../../general/List/List';
import listStyles from '../HistoryTab.styles';
import Colors from '../../../../../lib/colors';
import styles from '../Tabs.styles';
import TransactionState from '../../../../../state/transaction';
import FeedbackButton from '../../../../general/Buttons/FeedbackButton/FeedbackButton';

type Props = { isActive?: boolean };

const ClaimTab: FunctionComponent<Props> = ({ isActive }) => {
    const txnToggle = TransactionState.select.toggleCompletedTxn();
    const address = Web3State.select.web3address();
    const epoch = ProtocolState.select.epoch();
    const [unclaimedOffers, setUnclaimedOffers] = useState([]);
    const [loadingOffers, setLoadingOffers] = useState(false);

    const getUnclaimedOffers = useCallback(async () => {
        setLoadingOffers(true);
        if (!isUndefinedOrNullOrStringEmpty(address)) {
            const offersRes = await unclaimedOffersQuery(address, epoch.id);
            setUnclaimedOffers(offersRes);
        } else {
            setUnclaimedOffers([]);
        }
        setLoadingOffers(false);
    }, [address, epoch]);

    useEffect(() => {
        if (isActive) {
            setLoadingOffers(true);
            setTimeout(() => {
                getUnclaimedOffers();
            }, 500);
        }
    }, [address, txnToggle]);

    return (
        <div style={styles.container}>
            <List
                data={unclaimedOffers}
                RenderItem={React.memo(
                    RenderItem,
                    (prev, props) =>
                        JSON.stringify(prev.item) ===
                        JSON.stringify(props.item),
                )}
                label="Unclaimed Nuggs or ETH"
                labelStyle={styles.listLabel}
                listEmptyStyle={listStyles.textWhite}
                loaderColor="white"
                loading={loadingOffers}
                style={listStyles.list}
                extraData={[address]}
                listEmptyText="Nothing to claim..."
            />
        </div>
    );
};

export default React.memo(ClaimTab);

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
        return item && extraData[0] === item.swap.leader.id;
    }, [item, extraData]);

    return (
        !isUndefinedOrNullOrObjectEmpty(item) && (
            <div key={index} style={listStyles.render}>
                <div>
                    <Text textStyle={listStyles.renderTitle}>
                        Nugg #{parsedTitle.nugg}
                    </Text>
                    <Text
                        type="text"
                        textStyle={{ color: Colors.textColor }}
                        size="small">
                        {item.swap.num === '0'
                            ? 'Mint'
                            : `Swap #${item.swap.num}`}
                    </Text>
                </div>
                <FeedbackButton
                    feedbackText="Check Wallet..."
                    textStyle={listStyles.textWhite}
                    buttonStyle={listStyles.renderButton}
                    label={`Claim ${isWinner ? 'Nugg' : 'ETH'}`}
                    onClick={() =>
                        WalletState.dispatch.claim({
                            tokenId: parsedTitle.nugg,
                        })
                    }
                />
            </div>
        )
    );
};
