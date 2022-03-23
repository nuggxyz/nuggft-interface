import React, { FunctionComponent } from 'react';
import { IoHourglassOutline, IoPencil, IoPricetagOutline } from 'react-icons/io5';

import Colors from '@src/lib/colors';
import state from '@src/state';
import Button from '@src/components/general/Buttons/Button/Button';
import styles from '@src/components/nugg/ViewingNugg/ViewingNugg.styles';
import client from '@src/client';

type Props = { tokenId: string };

const LoanButtons: FunctionComponent<Props> = ({ tokenId }) => {
    const toggleEditingNugg = client.mutate.toggleEditingNugg();

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
            <Button
                textStyle={styles.textBlack}
                size="medium"
                type="text"
                buttonStyle={styles.button}
                label="Edit"
                leftIcon={
                    <IoPencil
                        color={Colors.nuggBlueText}
                        size={25}
                        style={{ marginRight: '.75rem' }}
                    />
                }
                onClick={() => toggleEditingNugg(tokenId)}
            />
        </div>
    );
};

export default LoanButtons;
