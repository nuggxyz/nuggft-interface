import React, { FunctionComponent, useCallback, useEffect, useState } from 'react';

import {
    isUndefinedOrNullOrArrayEmpty,
    isUndefinedOrNullOrObjectEmpty,
    isUndefinedOrNullOrStringEmpty,
} from '@src/lib';
import ProtocolState from '@src/state/protocol';
import Button from '@src/components/general/Buttons/Button/Button';
import Text from '@src/components/general/Texts/Text/Text';
import List, { ListRenderItemProps } from '@src/components/general/List/List';
import listStyles from '@src/components/nugg/Wallet/tabs/HistoryTab.styles';
import Colors from '@src/lib/colors';
import constants from '@src/lib/constants';
import loanedNuggsQuery from '@src/state/wallet/queries/loanedNuggsQuery';
import styles from '@src/components/nugg/Wallet/tabs/Tabs.styles';
import AppState from '@src/state/app';
import TransactionState from '@src/state/transaction';
import TokenViewer from '@src/components/nugg/TokenViewer';
import web3 from '@src/web3';
type Props = { isActive?: boolean };

const MyNuggsTab: FunctionComponent<Props> = ({ isActive }) => {
    const address = web3.hook.usePriorityAccount();
    const epoch = ProtocolState.select.epoch();
    const [loanedNuggs, setLoanedNuggs] = useState([]);
    const [loadingNuggs, setLoadingNuggs] = useState(false);
    const txnToggle = TransactionState.select.toggleCompletedTxn();
    const chainId = web3.hook.usePriorityChainId();

    const getMyNuggs = useCallback(async () => {
        setLoadingNuggs(true);
        if (!isUndefinedOrNullOrStringEmpty(address)) {
            const nuggResult = await loanedNuggsQuery(
                chainId,
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
                    (prev, props) => JSON.stringify(prev.item) === JSON.stringify(props.item),
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

const RenderItem: FunctionComponent<ListRenderItemProps<NL.GraphQL.Fragments.Loan.Bare>> = ({
    item,
    index,
    extraData,
}) => {
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
                        <Text textStyle={{ color: Colors.nuggRedText }} size="small">
                            Nugg #{item.nugg?.id}
                        </Text>
                        <Text type="text" textStyle={{ color: Colors.textColor }} size="smaller">
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
