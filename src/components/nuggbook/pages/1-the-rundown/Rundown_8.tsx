import React from 'react';
import { t } from '@lingui/macro';

import Text from '@src/components/general/Texts/Text/Text';
import { NuggBookPage, Page } from '@src/interfaces/nuggbook';
import Button from '@src/components/general/Buttons/Button/Button';
import lib from '@src/lib';
import NuggBookBackButton from '@src/components/nuggbook/NuggBookBackButton';

import styles from './Rundown.styles';

const Rundown_8: NuggBookPage = ({ setPage }) => {
    return (
        <div>
            <Text size="largest" textStyle={styles.title}>{t`1️⃣ selling your nugg`}</Text>
            <div>
                <Text textStyle={styles.text}>
                    <b>{t`You define the asking price.`}&nbsp;</b>
                    {t`This is the amount you will receive at the end of the auction. Any excess earnings are sent to the pool`}
                </Text>
                <Text
                    textStyle={styles.text}
                >{t`The auction doesn't start until it receives a first bid, then it lasts until the end of the next full period`}</Text>
                <Text
                    textStyle={styles.text}
                >{t`Once everything is done and the nugg has been sold, you must claim your money in order for it to be sent to you`}</Text>
            </div>
            <div style={styles.buttonContainer}>
                <Button
                    className="mobile-pressable-div"
                    label={t`how do I loan it?`}
                    onClick={() => {
                        setPage(Page.Rundown_9, true);
                    }}
                    size="large"
                    buttonStyle={styles.actionButton}
                    textStyle={{ fontWeight: lib.layout.fontWeight.thicc }}
                />
                <NuggBookBackButton page={Page.Rundown_7} />
            </div>
        </div>
    );
};

export default Rundown_8;
