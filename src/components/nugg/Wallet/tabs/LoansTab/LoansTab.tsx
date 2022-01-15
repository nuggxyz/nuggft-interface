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
import NuggftV1Helper from '../../../../../contracts/NuggftV1Helper';
import styles from '../Tabs.styles';
import AppState from '../../../../../state/app';
import TransactionState from '../../../../../state/transaction';
import TokenViewer from '../../../TokenViewer';

type Props = { isActive?: boolean };

const MyNuggsTab: FunctionComponent<Props> = ({ isActive }) => {
    const address = Web3State.select.web3address();
    const epoch = ProtocolState.select.epoch();
    const [loanedNuggs, setLoanedNuggs] = useState([]);
    const [loadingNuggs, setLoadingNuggs] = useState(false);
    const txnToggle = TransactionState.select.toggleCompletedTxn();

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
    }, [address, txnToggle]);

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
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <TokenViewer
                        tokenId={item.nugg.id}
                        data={(item as any).nugg.dotnuggRawCache}
                        style={{ width: '60px', height: '50px' }}
                    />
                    <div>
                        <Text
                            textStyle={{ color: Colors.nuggRedText }}
                            size="small">
                            Nugg #{item.nugg?.id}
                        </Text>
                        <Text
                            type="text"
                            textStyle={{ color: Colors.textColor }}
                            size="smaller">
                            {+item.endingEpoch - +extraData[0]} epochs remaining
                        </Text>
                    </div>
                </div>
                <div>
                    <Button
                        textStyle={listStyles.textWhite}
                        buttonStyle={{
                            ...listStyles.renderButtonLoan,
                            marginBottom: '.3rem',
                        }}
                        label={`Extend`}
                        onClick={() =>
                            AppState.dispatch.setModalOpen({
                                name: 'Loan',
                                modalData: {
                                    targetId: item.nugg.id,
                                    type: 'ExtendLoan',
                                    backgroundStyle: {
                                        background: Colors.gradient3,
                                    },
                                },
                            })
                        }
                    />
                    <Button
                        textStyle={listStyles.textWhite}
                        buttonStyle={listStyles.renderButtonLoan}
                        label={`Pay off`}
                        onClick={() =>
                            AppState.dispatch.setModalOpen({
                                name: 'Loan',
                                modalData: {
                                    targetId: item.nugg.id,
                                    type: 'PayOffLoan',
                                    backgroundStyle: {
                                        background: Colors.gradient3,
                                    },
                                },
                            })
                        }
                    />
                </div>
            </div>
        )
    );
};
