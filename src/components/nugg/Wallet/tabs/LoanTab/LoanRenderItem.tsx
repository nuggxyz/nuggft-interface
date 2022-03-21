import React, { FunctionComponent } from 'react';

import { LoanData } from '@src/client/interfaces';
import Button from '@src/components/general/Buttons/Button/Button';
import state from '@src/state';
import Text from '@src/components/general/Texts/Text/Text';
import globalStyles from '@src/lib/globalStyles';
import TokenViewer from '@src/components/nugg/TokenViewer';
import { InfiniteListRenderItemProps } from '@src/components/general/List/InfiniteList';

import styles from './LoanTab.styles';

const LoanRenderItem: FunctionComponent<
    InfiniteListRenderItemProps<LoanData, number | undefined, undefined>
> = ({ item, index, extraData: epochId }) => {
    return item ? (
        <div key={index} style={styles.renderItemContainer}>
            <div style={globalStyles.centered}>
                <TokenViewer tokenId={item.nugg} style={styles.renderItemNugg} />
                <div>
                    <Text textStyle={styles.textBlue} size="small">
                        Nugg {item.nugg}
                    </Text>
                    <Text type="text" textStyle={styles.textDefault} size="smaller">
                        {epochId && `${+item.endingEpoch - +epochId} epochs remaining`}
                    </Text>
                </div>
            </div>
            <div>
                <Button
                    textStyle={styles.textWhite}
                    type="text"
                    size="small"
                    buttonStyle={{
                        ...styles.renderItemButton,
                        marginBottom: '.3rem',
                    }}
                    label="Extend"
                    onClick={() =>
                        state.app.dispatch.setModalOpen({
                            name: 'LoanInputModal',
                            modalData: {
                                targetId: item.nugg,
                                type: 'ExtendLoan',
                            },
                        })
                    }
                />
                <Button
                    textStyle={styles.textWhite}
                    type="text"
                    size="small"
                    buttonStyle={styles.renderItemButton}
                    label="Pay off"
                    onClick={() =>
                        state.app.dispatch.setModalOpen({
                            name: 'LoanInputModal',
                            modalData: {
                                targetId: item.nugg,
                                type: 'PayoffLoan',
                            },
                        })
                    }
                />
            </div>
        </div>
    ) : null;
};

export default LoanRenderItem;
