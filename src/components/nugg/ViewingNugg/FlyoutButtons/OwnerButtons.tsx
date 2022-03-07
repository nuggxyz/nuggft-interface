import React, { FunctionComponent } from 'react';
import { IoCashOutline, IoPricetagsOutline, IoTrashBinOutline } from 'react-icons/io5';

import Colors from '@src/lib/colors';
import state from '@src/state';
import Button from '@src/components/general/Buttons/Button/Button';
import styles from '@src/components/nugg/ViewingNugg/ViewingNugg.styles';

type Props = { tokenId: string };

const OwnerButtons: FunctionComponent<Props> = ({ tokenId }) => {
    return (
        <div style={styles.ownerButtonContainer}>
            <Button
                textStyle={styles.textBlack}
                size="medium"
                type="text"
                buttonStyle={styles.button}
                label="Sell"
                leftIcon={
                    <IoPricetagsOutline
                        color={Colors.nuggBlueText}
                        size={25}
                        style={{ marginRight: '.75rem' }}
                    />
                }
                onClick={() =>
                    state.app.dispatch.setModalOpen({
                        name: 'SellNuggOrItemModal',
                        modalData: {
                            targetId: tokenId,
                            type: 'StartSale',
                        },
                    })
                }
            />
            <Button
                textStyle={styles.textBlack}
                size="medium"
                type="text"
                buttonStyle={styles.button}
                label="Loan"
                leftIcon={
                    <IoCashOutline
                        color={Colors.nuggBlueText}
                        size={25}
                        style={{ marginRight: '.75rem' }}
                    />
                }
                onClick={() =>
                    state.app.dispatch.setModalOpen({
                        name: 'LoanOrBurn',
                        modalData: {
                            targetId: tokenId,
                            type: 'Loan',
                            backgroundStyle: {
                                background: Colors.gradient2,
                            },
                        },
                    })
                }
            />
            <Button
                textStyle={styles.textBlack}
                size="medium"
                type="text"
                buttonStyle={styles.button}
                label="Burn"
                leftIcon={
                    <IoTrashBinOutline
                        color={Colors.nuggRedText}
                        size={25}
                        style={{ marginRight: '.75rem' }}
                    />
                }
                onClick={() =>
                    state.app.dispatch.setModalOpen({
                        name: 'LoanOrBurn',
                        modalData: {
                            targetId: tokenId,
                            type: 'Burn',
                            backgroundStyle: {
                                background: Colors.gradient3,
                            },
                        },
                    })
                }
            />
        </div>
    );
};

export default OwnerButtons;
