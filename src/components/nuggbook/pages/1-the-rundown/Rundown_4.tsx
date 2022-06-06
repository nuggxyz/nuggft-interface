import React from 'react';
import { t } from '@lingui/macro';

import Text from '@src/components/general/Texts/Text/Text';
import { NuggBookPage, Page } from '@src/interfaces/nuggbook';
import Button from '@src/components/general/Buttons/Button/Button';
import lib from '@src/lib';
import NuggBookBackButton from '@src/components/nuggbook/NuggBookBackButton';
import BulletPoint from '@src/components/nuggbook/BulletPoint';

import styles from './Rundown.styles';

const Rundown_4: NuggBookPage = ({ setPage }) => {
    return (
        <div>
            <Text size="largest" textStyle={styles.title}>{t`item auctions`}</Text>
            <div>
                <Text textStyle={styles.text}>
                    {t`Item auctions work exactly like nugg auctions except for one thing:`}&nbsp;
                    <b>{t`all interactions with the items happen via the nuggs`}</b>
                </Text>
                <div style={{ marginLeft: '.5rem' }}>
                    <BulletPoint
                        text={t`items are put up for auction by the nuggs that own them`}
                    />
                    <BulletPoint
                        text={t`because of this, there can be multiple pending auctions of the same item each with different floor prices`}
                    />
                    <BulletPoint
                        text={t`to offer on an item auction, you must pick which nugg of yours will place the offer on your behalf`}
                    />
                    <BulletPoint
                        text={t`you cannot own an item by itself, it will always belong to a nugg`}
                    />
                </div>
            </div>
            <div style={styles.buttonContainer}>
                <Button
                    className="mobile-pressable-div"
                    label={t`how do I benefit from owning a nugg? ⏳`}
                    onClick={() => {
                        setPage(Page.Rundown_5, true);
                    }}
                    size="large"
                    buttonStyle={styles.actionButton}
                    textStyle={{ fontWeight: lib.layout.fontWeight.thicc }}
                />
                <NuggBookBackButton page={Page.Rundown_3} />
            </div>
        </div>
    );
};

export default Rundown_4;
