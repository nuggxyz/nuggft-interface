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
import myNuggsQuery from '../../../../../state/wallet/queries/myNuggsQuery';
import constants from '../../../../../lib/constants';
import loanedNuggsQuery from '../../../../../state/wallet/queries/loanedNuggsQuery';
import NuggFTHelper from '../../../../../contracts/NuggFTHelper';
import styles from '../Tabs.styles';

type Props = { isActive?: boolean };

const MyNuggsTab: FunctionComponent<Props> = ({ isActive }) => {
    const address = Web3State.select.web3address();
    const epoch = ProtocolState.select.epoch();
    const [loanedNuggs, setLoanedNuggs] = useState([]);
    const [loadingNuggs, setLoadingNuggs] = useState(false);

    const getMyNuggs = useCallback(async () => {
        setLoadingNuggs(true);
        if (!isUndefinedOrNullOrStringEmpty(address)) {
            const nuggResult = await loanedNuggsQuery(
                address,
                'desc',
                '',
                constants.NUGGDEX_SEARCH_LIST_CHUNK,
                loanedNuggs.length,
            );

            if (!isUndefinedOrNullOrArrayEmpty(nuggResult)) {
                setLoanedNuggs((res) => [...res, ...nuggResult]);
            }
        } else {
            setLoanedNuggs([]);
        }
        setLoadingNuggs(false);
    }, [address, epoch, loanedNuggs]);

    useEffect(() => {
        if (isActive) {
            setLoadingNuggs(true);
            setTimeout(() => {
                getMyNuggs();
            }, 500);
        }
    }, [address]);

    return (
        <div style={styles.container}>
            <List
                data={loanedNuggs}
                RenderItem={React.memo(
                    RenderItem,
                    (prev, props) =>
                        JSON.stringify(prev.item) ===
                        JSON.stringify(props.item),
                )}
                label="Loaned Nuggs"
                loading={loadingNuggs}
                style={listStyles.list}
                extraData={[epoch?.id || '0']}
                listEmptyText="You haven't loaned any nuggs yet!"
                labelStyle={styles.listLabel}
                listEmptyStyle={listStyles.textWhite}
                loaderColor="white"
            />
        </div>
    );
};

export default React.memo(MyNuggsTab);

const RenderItem: FunctionComponent<
    ListRenderItemProps<NL.GraphQL.Fragments.Loan.Bare>
> = ({ item, index, extraData }) => {
    return (
        !isUndefinedOrNullOrObjectEmpty(item) && (
            <div key={index} style={listStyles.render}>
                <div>
                    <Text textStyle={listStyles.renderTitle}>
                        Nugg #{item.nugg?.id}
                    </Text>
                    <Text
                        type="text"
                        textStyle={{ color: Colors.textColor }}
                        size="small">
                        {+item.endingEpoch - +extraData[0]} epochs remaining
                    </Text>
                </div>
                <div>
                    <Button
                        textStyle={listStyles.textWhite}
                        buttonStyle={listStyles.renderButton}
                        label={`Extend`}
                        onClick={() =>
                            NuggFTHelper.instance.rebalance(item.nugg.id, {
                                value: 0.69,
                            })
                        }
                    />
                    <Button
                        textStyle={listStyles.textWhite}
                        buttonStyle={listStyles.renderButton}
                        label={`Pay off`}
                        onClick={() =>
                            NuggFTHelper.instance.payoff(item.nugg.id, {
                                value: 0.69,
                            })
                        }
                    />
                </div>
            </div>
        )
    );
};
