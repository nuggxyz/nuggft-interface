import React from 'react';
import { t } from '@lingui/macro';

import Text from '@src/components/general/Texts/Text/Text';
import { NuggBookPage, Page } from '@src/interfaces/nuggbook';
import Button from '@src/components/general/Buttons/Button/Button';
import lib from '@src/lib';
import NuggBookBackButton from '@src/components/nuggbook/NuggBookBackButton';

const Rundown_4: NuggBookPage = ({ setPage }) => {
    return (
        <div>
            <Text size="largest">{t`item auctions`}</Text>
            <div>
                <Text>{t`item auctions work exactly like nugg auctions except for one thing: all interactions with the items happen through the nuggs`}</Text>
                <Text>{t`📍 items are put up for auction by the nuggs that own them`}</Text>
                <Text>{t`📍 because of this, there can be multiple pending auctions of the same item each with different floor prices`}</Text>
                <Text>{t`📍 to offer on an item auction, you must pick which nugg of yours will place the offer on your behalf`}</Text>
                <Text>{t`📍 you cannot own an item by itself, it will always belong to a nugg`}</Text>
            </div>
            <div>
                <Button
                    className="mobile-pressable-div"
                    label={t`how do I benefit from owning a nugg? ⏳`}
                    onClick={() => {
                        setPage(Page.Rundown_5, true);
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
                <NuggBookBackButton page={Page.Rundown_3} />
            </div>
        </div>
    );
};

export default Rundown_4;
