import React from 'react';
import { t } from '@lingui/macro';

import Text from '@src/components/general/Texts/Text/Text';
import { NuggBookPage, Page } from '@src/interfaces/nuggbook';
import Button from '@src/components/general/Buttons/Button/Button';
import lib from '@src/lib';
import NuggBookBackButton from '@src/components/nuggbook/NuggBookBackButton';

const Rundown_8: NuggBookPage = ({ setPage }) => {
    return (
        <div>
            <Text size="largest">{t`1️⃣ selling your nugg`}</Text>
            <div>
                <Text>{t`you define the asking price. This is the amount you will receive at the end of the auction. Any excess earnings are sent to the pool`}</Text>
                <Text>{t`note that the auction doesn't start until it receives a first bid, then it lasts until the end of the next full period`}</Text>
                <Text>{t`once everything is done, you must claim your money in order for it to be sent to you`}</Text>
            </div>
            <div>
                <Button
                    className="mobile-pressable-div"
                    label={t`how do I loan it?`}
                    onClick={() => {
                        setPage(Page.Rundown_9, true);
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
                <NuggBookBackButton page={Page.Rundown_7} />
            </div>
        </div>
    );
};

export default Rundown_8;
