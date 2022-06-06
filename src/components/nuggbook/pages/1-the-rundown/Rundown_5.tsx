import React from 'react';
import { t } from '@lingui/macro';

import Text from '@src/components/general/Texts/Text/Text';
import { NuggBookPage, Page } from '@src/interfaces/nuggbook';
import Button from '@src/components/general/Buttons/Button/Button';
import lib from '@src/lib';
import NuggBookBackButton from '@src/components/nuggbook/NuggBookBackButton';

import styles from './Rundown.styles';

const Rundown_5: NuggBookPage = ({ setPage }) => {
    return (
        <div>
            <Text size="largest" textStyle={styles.title}>{t`the nugg pool 🤿`}</Text>
            <div>
                <Text textStyle={styles.text}>
                    {t`At the end of each auction, the winning bid is sent to a`}&nbsp;
                    <b>{t`pool of money `}&nbsp;</b>
                    {t`controlled by the nuggft platform`}
                </Text>
                <Text textStyle={styles.text}>
                    {t`In addition to being a fun nft, your nugg also represents`}&nbsp;
                    <b>{t`a share`}&nbsp;</b>
                    {t`of this pool (this is how we calculate the nugg's floor price)`}
                </Text>
                <Text textStyle={styles.text}>
                    <i>{t`so the more nuggs you have, the more money is attributed to you!`}</i>
                </Text>
                <Text
                    textStyle={styles.text}
                >{t`You can sell your nuggs to liquidate what belongs to you, or you can even take out a loan using your nugg as collateral   ⚖️`}</Text>
            </div>
            <div style={styles.buttonContainer}>
                <Button
                    className="mobile-pressable-div"
                    label={t`tell me more! 🤩`}
                    onClick={() => {
                        setPage(Page.Rundown_6, true);
                    }}
                    size="large"
                    buttonStyle={styles.actionButton}
                    textStyle={{ fontWeight: lib.layout.fontWeight.thicc }}
                />
                <NuggBookBackButton page={Page.Rundown_4} />
            </div>
        </div>
    );
};

export default Rundown_5;
