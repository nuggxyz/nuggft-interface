import React, { FunctionComponent } from 'react';

import Button from '@src/components/general/Buttons/Button/Button';
import Text from '@src/components/general/Texts/Text/Text';
import List, { ListRenderItemProps } from '@src/components/general/List/List';
import listStyles from '@src/components/nugg/Wallet/tabs/HistoryTab.styles';
import Colors from '@src/lib/colors';
import styles from '@src/components/nugg/Wallet/tabs/Tabs.styles';
import AppState from '@src/state/app';
import TokenViewer from '@src/components/nugg/TokenViewer';
import client from '@src/client';
import { LoanData } from '@src/client/core';

type Props = Record<string, never>;

const LoansTab: FunctionComponent<Props> = () => {
    const epoch__id = client.live.epoch.id();

    const loanedNuggs = client.live.myLoans();

    return (
        <div style={styles.container}>
            <List
                data={loanedNuggs}
                RenderItem={React.memo(
                    RenderItem,
                    (prev, props) => JSON.stringify(prev.item) === JSON.stringify(props.item),
                )}
                label="Loaned Nuggs"
                // titleLoading={loadingNuggs}
                style={listStyles.list}
                extraData={epoch__id}
                listEmptyText="You haven't loaned any nuggs yet!"
                labelStyle={styles.listLabel}
                listEmptyStyle={listStyles.textWhite}
                loaderColor="white"
                action={() => undefined}
            />
        </div>
    );
};

export default React.memo(LoansTab);

const RenderItem: FunctionComponent<
    ListRenderItemProps<LoanData, number | undefined, undefined>
> = ({ item, index, extraData: epochId }) => {
    return item ? (
        <div key={index} style={listStyles.render}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <TokenViewer
                    tokenId={item.nugg}
                    // data={(item.nugg.dotnuggRawCache}
                    style={{ width: '60px', height: '50px' }}
                />
                <div>
                    <Text textStyle={{ color: Colors.nuggRedText }} size="small">
                        Nugg {item.nugg}
                    </Text>
                    <Text type="text" textStyle={{ color: Colors.textColor }} size="smaller">
                        {epochId && `${+item.endingEpoch - +epochId} epochs remaining`}
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
                            name: 'LoanInputModal',
                            modalData: {
                                targetId: item.nugg,
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
                            name: 'LoanInputModal',
                            modalData: {
                                targetId: item.nugg,
                                type: 'PayoffLoan',
                                backgroundStyle: {
                                    background: Colors.gradient3,
                                },
                            },
                        })
                    }
                />
            </div>
        </div>
    ) : (
        <></>
    );
};
