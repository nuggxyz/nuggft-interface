import React from 'react';
import { t } from '@lingui/macro';

import Text from '@src/components/general/Texts/Text/Text';
import { NuggBookPage, Page } from '@src/interfaces/nuggbook';
import Button from '@src/components/general/Buttons/Button/Button';
import lib from '@src/lib';
import NuggBookBackButton from '@src/components/nuggbook/NuggBookBackButton';

const Rundown_9: NuggBookPage = ({ setPage }) => {
    return (
        <div>
            <Text size="largest">{t`2️⃣ loaning your nugg`}</Text>
            <div>
                <Text>{t`you will receive the value of the current share price and your nugg will be used as collateral for 1024 periods (~1024 hours)`}</Text>
                <Text>{t`anytime during the duration of the loan you can either extend or pay off the loan`}</Text>
                <Text>{t`to extend the loan you must pay the amount the share price increased since you took out the loan`}</Text>
                <Text>{t`to pay off the loan, you pay the same amount as you would to extend it, as well as the original value of the loan and a small fee`}</Text>
                <Text>{t`if you let your loan expire, your nugg will be put up for sale`}</Text>
            </div>
            <div>
                <Button
                    className="mobile-pressable-div"
                    label={t`what part of the nugg can I edit?`}
                    onClick={() => {
                        setPage(Page.Rundown_10, true);
                    }}
                    size="large"
                    buttonStyle={{
                        color: lib.colors.white,
                        boxShadow: lib.layout.boxShadow.basic,
                        padding: '.7rem 1.3rem',
                        background: lib.colors.primaryColor,
                        borderRadius: lib.layout.borderRadius.large,
                        marginBottom: 15,
                    }}
                    textStyle={{ fontWeight: lib.layout.fontWeight.thicc }}
                />
                <NuggBookBackButton page={Page.Rundown_8} />
            </div>
        </div>
    );
};

export default Rundown_9;
