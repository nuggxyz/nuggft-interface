import React, { FunctionComponent } from 'react';
import { IoHourglassOutline, IoPricetagOutline } from 'react-icons/io5';

import Colors from '@src/lib/colors';
import state from '@src/state';
import Button from '@src/components/general/Buttons/Button/Button';
import styles from '@src/components/nugg/ViewingNugg/ViewingNugg.styles';

type Props = { tokenId: string };

const LoanButtons: FunctionComponent<Props> = ({ tokenId }) => {
    return (
        <div style={styles.ownerButtonContainer}>
            <Button
                textStyle={styles.textBlack}
                size="medium"
                type="text"
                buttonStyle={styles.button}
                label="Extend"
                leftIcon={
                    <IoHourglassOutline
                        color={Colors.nuggBlueText}
                        size={25}
                        style={{ marginRight: '.75rem' }}
                    />
                }
                onClick={() =>
                    state.app.dispatch.setModalOpen({
                        name: 'LoanInputModal',
                        modalData: {
                            targetId: tokenId,
                            type: 'ExtendLoan',
                            backgroundStyle: {
                                background: Colors.gradient3,
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
                label="Pay off"
                leftIcon={
                    <IoPricetagOutline
                        color={Colors.nuggBlueText}
                        size={25}
                        style={{ marginRight: '.75rem' }}
                    />
                }
                onClick={() =>
                    state.app.dispatch.setModalOpen({
                        name: 'LoanInputModal',
                        modalData: {
                            targetId: tokenId,
                            type: 'PayoffLoan',
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

export default LoanButtons;
