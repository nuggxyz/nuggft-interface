import React, { FunctionComponent } from 'react';

import state from '@src/state';

import styles from './HomeTab.styles';
import Button from '@src/components/general/Buttons/Button/Button';

type Props = Record<string, unknown>;

const MintNuggButton: FunctionComponent<Props> = () => {
    return (
        <Button
            label="Mint a Nugg "
            buttonStyle={styles.mintNuggButton}
            textStyle={styles.mintNuggButtonText}
            onClick={() => state.app.dispatch.setModalOpen({ name: 'MintModal' })}
        />
    );
};

export default MintNuggButton;
