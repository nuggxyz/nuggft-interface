import React, { FunctionComponent } from 'react';

import styles from './QrCodeModal.styles';

type Props = {};

// @dub call setModalOpen from appState to open, you can pass info to it via the modalData arg,
// you can also add more fields to the modal data arg if you need to pass more info to the modal

const QrCodeModal: FunctionComponent<Props> = () => {
    return (
        <div style={styles.container}>
            <h1>QrCodeModal</h1>
        </div>
    );
};

export default QrCodeModal;
