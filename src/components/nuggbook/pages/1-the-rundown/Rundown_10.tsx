import React from 'react';
import { t } from '@lingui/macro';

import Text from '@src/components/general/Texts/Text/Text';
import { NuggBookPage, Page } from '@src/interfaces/nuggbook';
import Button from '@src/components/general/Buttons/Button/Button';
import lib from '@src/lib';
import NuggBookBackButton from '@src/components/nuggbook/NuggBookBackButton';

import styles from './Rundown.styles';

const Rundown_10: NuggBookPage = ({ setPage }) => {
    return (
        <div>
            <Text size="largest" textStyle={styles.title}>{t`3️⃣ editing your nugg`}</Text>
            <div>
                <Text
                    textStyle={styles.text}
                >{t`You can customize your nugg any way you like! except for the base, every category of items can be edited`}</Text>
                <Text
                    textStyle={styles.text}
                >{t`Start by buying items that interest you, and then have fun mixing and matching`}</Text>
                <Text
                    textStyle={styles.text}
                >{t`This actually modifies your nft on the blockchain, so you have to pay the gas fees to save your work of art`}</Text>
            </div>
            <div style={styles.buttonContainer}>
                <Button
                    className="mobile-pressable-div"
                    label={t`cool! it all makes sense now 🤠`}
                    onClick={() => {
                        setPage(Page.TableOfContents, false);
                    }}
                    size="large"
                    buttonStyle={styles.actionButton}
                    textStyle={{ fontWeight: lib.layout.fontWeight.thicc }}
                />
                <Button
                    className="mobile-pressable-div"
                    label={t`I'm still confused! 😬`}
                    onClick={() => {
                        window.open('https://twitter.com/nuggxyz', '_blank');
                    }}
                    size="large"
                    buttonStyle={styles.actionButton}
                    textStyle={{ fontWeight: lib.layout.fontWeight.thicc }}
                />
                <NuggBookBackButton page={Page.Rundown_9} />
            </div>
        </div>
    );
};

export default Rundown_10;
