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
import styles from '../HistoryTab.styles';
import Colors from '../../../../../lib/colors';
import myNuggsQuery from '../../../../../state/wallet/queries/myNuggsQuery';
import constants from '../../../../../lib/constants';
import loanedNuggsQuery from '../../../../../state/wallet/queries/loanedNuggsQuery';
import NuggFTHelper from '../../../../../contracts/NuggFTHelper';

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
            console.log(nuggResult);

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
        <div>
            <List
                data={loanedNuggs}
                RenderItem={React.memo(
                    RenderItem,
                    (prev, props) =>
                        JSON.stringify(prev.item) ===
                        JSON.stringify(props.item),
                )}
                label="My Nuggs"
                loading={loadingNuggs}
                style={styles.list}
                extraData={[epoch.id]}
                listEmptyText="Loan some nuggs"
                action={() => console.log('Open Nugg Modal')}
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
            <div key={index} style={styles.render}>
                <div>
                    <Text textStyle={styles.renderTitle}>
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
                        textStyle={styles.textWhite}
                        buttonStyle={styles.renderButton}
                        label={`Extend`}
                        onClick={() =>
                            NuggFTHelper.instance.rebalance(item.nugg.id, {
                                value: 0.69,
                            })
                        }
                    />
                    <Button
                        textStyle={styles.textWhite}
                        buttonStyle={styles.renderButton}
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
