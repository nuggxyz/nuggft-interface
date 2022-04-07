import React, { FunctionComponent } from 'react';
import { t } from '@lingui/macro';

import Button from '@src/components/general/Buttons/Button/Button';
import client from '@src/client';
import { ModalEnum } from '@src/interfaces/modals';

import styles from './HomeTab.styles';

type Props = Record<string, unknown>;

const MintNuggButton: FunctionComponent<Props> = () => {
    const openModal = client.modal.useOpenModal();

    return (
        <Button
            label={t`Mint a Nugg`}
            buttonStyle={styles.mintNuggButton}
            textStyle={styles.mintNuggButtonText}
            onClick={() => openModal({ type: ModalEnum.Mint })}
        />
    );
};

export default MintNuggButton;
