import React, { FunctionComponent } from 'react';
import QRCode from 'qrcode.react';

import Text from '@src/components/general/Texts/Text/Text';
import state from '@src/state';
import NLStaticImage from '@src/components/general/NLStaticImage';
import lib from '@src/lib';
import { PeerInfo } from '@src/web3/core/interfaces';

import styles from './QrCodeModal.styles';
type Props = Record<string, never>;

type ModalsData = {
    data: { info: PeerInfo; uri: string };
};
// declare namespace NL.Redux.App {}

// @dub call setModalOpen from appState to open, you can pass info to it via the modalData arg,
// you can also add more fields to the modal data arg if you need to pass more info to the modal

const QrCodeModal: FunctionComponent<Props> = () => {
    const { data } = state.app.select.modalData() as ModalsData;

    const [hack, setHack] = React.useState<typeof data>(data);

    React.useEffect(() => {
        if (!data && !hack) {
            setHack(data);
        }
    }, [data, hack]);

    return (
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
                <Text size="larger" textStyle={{ color: lib.colors.primaryColor }}>
                    Sign in with {hack?.info.name}
                </Text>
                <NLStaticImage image={`${hack?.info.peer}_icon`} />
            </div>
            <div>
                <QRCode
                    value={hack?.uri || ''}
                    size={400}
                    level={'Q'}
                    style={{ padding: '10px' }}
                    fgColor={lib.colors.primaryColor}
                />
            </div>
        </div>
    );
};

export default QrCodeModal;
