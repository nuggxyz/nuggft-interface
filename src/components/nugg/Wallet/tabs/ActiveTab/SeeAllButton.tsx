import React from 'react';
import { t } from '@lingui/macro';

import state from '@src/state';
import Button from '@src/components/general/Buttons/Button/Button';

import styles from './ActiveTab.styles';

export default () => {
    return (
        <Button
            label={t`See All`}
            buttonStyle={styles.mintNuggButton}
            textStyle={styles.mintNuggButtonText}
            onClick={() => state.app.dispatch.setModalOpen({ name: 'MintModal' })}
        />
    );
};
