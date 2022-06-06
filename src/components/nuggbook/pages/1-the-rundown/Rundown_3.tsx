import React from 'react';
import { t } from '@lingui/macro';

import Text from '@src/components/general/Texts/Text/Text';
import { NuggBookPage, Page } from '@src/interfaces/nuggbook';
import Button from '@src/components/general/Buttons/Button/Button';
import lib from '@src/lib';
import NuggBookBackButton from '@src/components/nuggbook/NuggBookBackButton';

import styles from './Rundown.styles';

const Rundown_3: NuggBookPage = ({ setPage }) => {
    return (
        <div>
            <Text size="largest" textStyle={styles.title}>{t`offering on a nugg`}</Text>
            <div>
                <Text
                    textStyle={styles.text}
                >{t`🆙 The person with the highest bid at the end of the period gets the nugg`}</Text>
                <Text
                    textStyle={styles.text}
                >{t`🏧 If you are not the highest bidder, you must reclaim your bid in order for the money to return to your wallet`}</Text>
                <Text
                    textStyle={styles.text}
                >{t`📫 When you sell a nugg, the auction does not start until someone else offers on it. We call these pending auctions`}</Text>
                <Text
                    textStyle={styles.text}
                >{t`🔁 If someone outbids you, you can replace your bid with a new one`}</Text>
                <Text textStyle={styles.text}>
                    <i>
                        {t`📝 note: this means that the value you type in is not added to the value of the existing bid, it replaces it entirely such that each participant only has their one bid throughout the duration of the auction`}
                    </i>
                </Text>
            </div>
            <div style={styles.buttonContainer}>
                <Button
                    className="mobile-pressable-div"
                    label={t`so I can sell items? 🤯`}
                    onClick={() => {
                        setPage(Page.Rundown_4, true);
                    }}
                    size="large"
                    buttonStyle={styles.actionButton}
                    textStyle={{ fontWeight: lib.layout.fontWeight.thicc }}
                />
                <NuggBookBackButton page={Page.Rundown_2} />
            </div>
        </div>
    );
};

export default Rundown_3;
