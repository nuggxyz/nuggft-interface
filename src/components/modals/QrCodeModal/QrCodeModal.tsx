import React from 'react';
import QRCode from 'qrcode.react';
import { t } from '@lingui/macro';

import Text from '@src/components/general/Texts/Text/Text';
import NLStaticImage from '@src/components/general/NLStaticImage';
import lib from '@src/lib';
import { QRCodeModalData } from '@src/interfaces/modals';
import useDimentions from '@src/client/hooks/useDimentions';

import styles from './QrCodeModal.styles';

const QrCodeModal = ({ data }: { data: QRCodeModalData }) => {
    const { isPhone } = useDimentions();
    return (
        <div style={styles.container}>
            <div style={styles.textContainer}>
                <Text size="larger" textStyle={{ color: lib.colors.primaryColor }}>
                    {t`Sign in with ${data.info.name}`}
                </Text>
                <NLStaticImage image={`${data.info.peer}_icon`} style={{ marginLeft: '1rem' }} />
            </div>
            <div>
                <QRCode
                    value={data.uri || ''}
                    size={isPhone ? 200 : 400}
                    level="L"
                    // fgColor={data.backgroundStyle.background}
                    bgColor={lib.colors.background}
                />
            </div>
        </div>
    );
};

export default QrCodeModal;
