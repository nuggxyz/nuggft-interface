import React, { FunctionComponent, useLayoutEffect, useState } from 'react';
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
    backgroundStyle: { background: string };
};

const QrCodeModal: FunctionComponent<Props> = () => {
    const modalsData = state.app.select.modalData() as ModalsData;
    const [stableData, setStableData] = useState<typeof modalsData>(modalsData);

    useLayoutEffect(() => {
        modalsData && modalsData.data && setStableData(modalsData);
    }, [modalsData, stableData]);

    return (
        <div style={styles.container}>
            <div style={styles.textContainer}>
                <Text size="larger" textStyle={{ color: lib.colors.primaryColor }}>
                    Sign in with {stableData?.data.info.name}
                </Text>
                <NLStaticImage
                    image={`${stableData?.data.info.peer}_icon`}
                    style={{ marginLeft: '1rem' }}
                />
            </div>
            <div>
                <QRCode
                    value={stableData?.data.uri || ''}
                    size={400}
                    level={'L'}
                    fgColor={stableData?.backgroundStyle.background}
                    bgColor={lib.colors.transparent}
                />
            </div>
        </div>
    );
};

export default QrCodeModal;
