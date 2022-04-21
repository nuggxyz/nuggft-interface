import React from 'react';
import { t } from '@lingui/macro';

import Button from '@src/components/general/Buttons/Button/Button';
import client from '@src/client';
import { ModalEnum } from '@src/interfaces/modals';

import styles from './ActiveTab.styles';

export default () => {
    const openModal = client.modal.useOpenModal();
    return (
        <Button
            label={t`See All`}
            buttonStyle={styles.mintNuggButton}
            textStyle={styles.mintNuggButtonText}
            onClick={() => openModal({ modalType: ModalEnum.Mint })}
        />
    );
};
