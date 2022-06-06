import React from 'react';
import { t } from '@lingui/macro';

import Text from '@src/components/general/Texts/Text/Text';
import { NuggBookPage, Page } from '@src/interfaces/nuggbook';
import Button from '@src/components/general/Buttons/Button/Button';
import lib from '@src/lib';
import NuggBookBackButton from '@src/components/nuggbook/NuggBookBackButton';
import globalStyles from '@src/lib/globalStyles';

import styles from './Rundown.styles';

const Rundown_7: NuggBookPage = ({ setPage }) => {
    return (
        <div>
            <Text size="largest" textStyle={styles.title}>{t`what to do with your nugg 🤌`}</Text>
            <div
                style={{ marginLeft: '1.5rem', ...globalStyles.centered, flexDirection: 'column' }}
            >
                <Text textStyle={styles.text}>{t`1️⃣ you can sell your nugg`}</Text>
                <Text textStyle={styles.text}>{t`2️⃣ you can loan your nugg`}</Text>
                <Text textStyle={styles.text}>{t`3️⃣ you can edit your nugg`}</Text>
            </div>
            <div style={styles.buttonContainer}>
                <Button
                    className="mobile-pressable-div"
                    label={t`how exactly does selling work? `}
                    onClick={() => {
                        setPage(Page.Rundown_8, true);
                    }}
                    size="large"
                    buttonStyle={styles.actionButton}
                    textStyle={{ fontWeight: lib.layout.fontWeight.thicc }}
                />
                <NuggBookBackButton page={Page.Rundown_6} />
            </div>
        </div>
    );
};

export default Rundown_7;
