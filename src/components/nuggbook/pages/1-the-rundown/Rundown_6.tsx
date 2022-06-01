import React from 'react';
import { t } from '@lingui/macro';

import { NuggBookPage, Page } from '@src/interfaces/nuggbook';
import Text from '@src/components/general/Texts/Text/Text';
import Button from '@src/components/general/Buttons/Button/Button';
import lib from '@src/lib';
import NuggBookBackButton from '@src/components/nuggbook/NuggBookBackButton';

const Rundown_6: NuggBookPage = ({ setPage }) => {
    return (
        <div>
            <Text size="largest">{t`the nugg pool pt.2`}</Text>
            <div>
                <Text>{t`naturally, as periods pass by and auctions end, the pool will increase in value`}</Text>
                <Text>{t`this means that each share will always increase in value as well`}</Text>
                <Text>{t`we've actually made it mathematically impossible for the share to decrease in value, so the longer your nugg belongs to you, the more benefits you will have`}</Text>
            </div>
            <div>
                <Button
                    className="mobile-pressable-div"
                    label={t`what's this about selling and loaning?`}
                    onClick={() => {
                        setPage(Page.Rundown_7, true);
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
                <NuggBookBackButton page={Page.Rundown_5} />
            </div>
        </div>
    );
};

export default Rundown_6;
