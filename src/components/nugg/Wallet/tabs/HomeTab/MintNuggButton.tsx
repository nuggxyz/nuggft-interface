import React, { FunctionComponent } from 'react';
import { t } from '@lingui/macro';

import state from '@src/state';
import Button from '@src/components/general/Buttons/Button/Button';

import styles from './HomeTab.styles';

type Props = Record<string, unknown>;

const MintNuggButton: FunctionComponent<Props> = () => {
    return (
        <Button
            label={t`Mint a Nugg`}
            buttonStyle={styles.mintNuggButton}
            textStyle={styles.mintNuggButtonText}
            onClick={() => state.app.dispatch.setModalOpen({ name: 'MintModal' })}
        />
    );
};

export default MintNuggButton;
