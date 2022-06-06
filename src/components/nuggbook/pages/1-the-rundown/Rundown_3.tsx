import React from 'react';
import { t } from '@lingui/macro';

import Text from '@src/components/general/Texts/Text/Text';
import { NuggBookPage, Page } from '@src/interfaces/nuggbook';
import Button from '@src/components/general/Buttons/Button/Button';
import lib from '@src/lib';
import NuggBookBackButton from '@src/components/nuggbook/NuggBookBackButton';

const Rundown_3: NuggBookPage = ({ setPage }) => {
    return (
        <div>
            <Text size="largest">{t`offering on a nugg`}</Text>
            <div>
                <Text>{t`🆙 the person with the highest bid at the end of the period gets the nugg`}</Text>
                <Text>{t`🏧 if you are not the highest bidder, you must relcaim your bid in order for the money to return to your wallet`}</Text>
                <Text>{t`📫 when you sell a nugg, the auction does not start until someone else offers on it. We call these pending auctions`}</Text>
                <Text>{t`🔁 if someone outbids you, you can replace your bid with a new one`}</Text>
                <Text>
                    {t`📝 note: this means that the value you type in is not `}
                    <i>{t`added`}</i>
                    {t` to the value of the existing bid, it replaces it entirely such that each participant only has their one bid throughout the duration of the auction`}
                </Text>
            </div>
            <div>
                <Button
                    className="mobile-pressable-div"
                    label={t`what's this about selling items? ⁉`}
                    onClick={() => {
                        setPage(Page.Rundown_4, true);
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
                <NuggBookBackButton page={Page.Rundown_2} />
            </div>
        </div>
    );
};

export default Rundown_3;
