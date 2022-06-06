import React from 'react';
import { t } from '@lingui/macro';

import Text from '@src/components/general/Texts/Text/Text';
import { NuggBookPage, Page } from '@src/interfaces/nuggbook';
import Button from '@src/components/general/Buttons/Button/Button';
import lib from '@src/lib';
import NuggBookBackButton from '@src/components/nuggbook/NuggBookBackButton';
import globalStyles from '@src/lib/globalStyles';

import styles from './Rundown.styles';

const Rundown_2: NuggBookPage = ({ setPage }) => {
    return (
        <div>
            <Text size="largest" textStyle={styles.title}>{t`auctions 🕰`}</Text>
            <div>
                <Text textStyle={styles.text}>
                    {t`The auctions take place during a`}
                    <b>&nbsp;{t`period`}&nbsp;</b>
                    {t` that lasts about an hour`}
                </Text>
                <Text
                    textStyle={styles.text}
                >{t`At the end of each period a new nugg is minted and the next period begins, following this cycle until all 10,000 nuggs have been minted`}</Text>
                <Text size="larger" textStyle={{ ...styles.text, ...globalStyles.centered }}>
                    🥚 🐣 🐥
                </Text>
                <Text
                    textStyle={styles.text}
                >{t`A nugg that you have sold will follow this same pattern of periods. Say you put your nugg up for auction midway through period 100, the auction will last until the end of period 101`}</Text>
                <Text textStyle={styles.text}>
                    <i>{t`this means that there will always be any number of auctions ending at the exact same time`}</i>
                </Text>
                <div style={styles.buttonContainer}>
                    <Button
                        className="mobile-pressable-div"
                        label={t`nice, so how to I take part in these auctions? 🆒`}
                        onClick={() => {
                            setPage(Page.Rundown_3, true);
                        }}
                        size="large"
                        buttonStyle={styles.actionButton}
                        textStyle={{ fontWeight: lib.layout.fontWeight.thicc }}
                    />
                    <NuggBookBackButton page={Page.Rundown_1} />
                </div>
            </div>
        </div>
    );
};

export default Rundown_2;
