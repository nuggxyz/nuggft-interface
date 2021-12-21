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
import styles from '../HistoryTab/HistoryTab.styles';
import Colors from '../../../../../lib/colors';

type Props = { isActive?: boolean };

const ClaimTab: FunctionComponent<Props> = ({ isActive }) => {
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
    }, [address]);

    return (
        <div>
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
            </div>
        )
    );
};
