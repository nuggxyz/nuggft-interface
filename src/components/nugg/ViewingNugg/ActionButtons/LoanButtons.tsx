import React, { FunctionComponent } from 'react';
import { IoHourglassOutline, IoPencil, IoPricetagOutline } from 'react-icons/io5';
import { t } from '@lingui/macro';
import { useNavigate } from 'react-router-dom';

import Colors from '@src/lib/colors';
import Button from '@src/components/general/Buttons/Button/Button';
import styles from '@src/components/nugg/ViewingNugg/ViewingNugg.styles';
import client from '@src/client';
import { ModalEnum } from '@src/interfaces/modals';

type Props = { tokenId: string };

const LoanButtons: FunctionComponent<Props> = ({ tokenId }) => {
    const navigate = useNavigate();
    const openModal = client.modal.useOpenModal();

    return (
        <div style={styles.ownerButtonContainer}>
            <Button
                textStyle={styles.textBlack}
                size="medium"
                type="text"
                buttonStyle={styles.button}
                label={t`Extend`}
                leftIcon={
                    <IoHourglassOutline
                        color={Colors.nuggBlueText}
                        size={25}
                        style={{ marginRight: '.75rem' }}
                    />
                }
                onClick={() =>
                    openModal({
                        type: ModalEnum.LoanInput,
                        tokenId,
                        actionType: 'rebalance',
                        backgroundStyle: {
                            background: Colors.gradient3,
                        },
                    })
                }
            />
            <Button
                textStyle={styles.textBlack}
                size="medium"
                type="text"
                buttonStyle={styles.button}
                label={t`Pay off`}
                leftIcon={
                    <IoPricetagOutline
                        color={Colors.nuggBlueText}
                        size={25}
                        style={{ marginRight: '.75rem' }}
                    />
                }
                onClick={() =>
                    openModal({
                        type: ModalEnum.LoanInput,
                        tokenId,
                        actionType: 'liquidate',
                        backgroundStyle: {
                            background: Colors.gradient3,
                        },
                    })
                }
            />
            <Button
                textStyle={styles.textBlack}
                size="medium"
                type="text"
                buttonStyle={styles.button}
                label={t`Edit`}
                leftIcon={
                    <IoPencil
                        color={Colors.nuggBlueText}
                        size={25}
                        style={{ marginRight: '.75rem' }}
                    />
                }
                onClick={() => navigate(`/edit/${tokenId}`)}
            />
        </div>
    );
};

export default LoanButtons;
