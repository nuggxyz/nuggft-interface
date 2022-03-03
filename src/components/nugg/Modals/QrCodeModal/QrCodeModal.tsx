import React, { FunctionComponent } from 'react';
import QRCode from 'qrcode.react';

import Text from '@src/components/general/Texts/Text/Text';
import state from '@src/state';
import NLStaticImage from '@src/components/general/NLStaticImage';
import { colors } from '@src/lib';
import { PeerInfo } from '@src/web3/core/interfaces';

import styles from './QrCodeModal.styles';
type Props = {};

type ModalsData = {
    data: { info: PeerInfo; uri: string };
};
// declare namespace NL.Redux.App {}

// @dub call setModalOpen from appState to open, you can pass info to it via the modalData arg,
// you can also add more fields to the modal data arg if you need to pass more info to the modal

const QrCodeModal: FunctionComponent<Props> = () => {
    const { data } = state.app.select.modalData() as ModalsData;

    // const provider = web3.config.connectors[data.info.label];

    return data?.uri ? (
        <div style={{ padding: '20px', ...styles.container }}>
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-around',
                    padding: '15px',
                    width: '400px',
                }}
            >
                <Text size="larger" textStyle={{ color: colors.default.primaryColor }}>
                    Sign in with {data?.info.name}
                </Text>
                <NLStaticImage image={`${data?.info.peer}_icon`} />
            </div>

            <QRCode
                value={data?.uri || ''}
                size={400}
                style={{ padding: '10px' }}
                fgColor={colors.default.primaryColor}
                numOctaves={3}
            />
        </div>
    ) : null;
};

export default QrCodeModal;
