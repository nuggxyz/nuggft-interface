import React from 'react';
import { t } from '@lingui/macro';

import Text from '@src/components/general/Texts/Text/Text';
import { NuggBookPage, Page } from '@src/interfaces/nuggbook';
import Button from '@src/components/general/Buttons/Button/Button';
import lib from '@src/lib';
import NuggBookBackButton from '@src/components/nuggbook/NuggBookBackButton';

const Rundown_7: NuggBookPage = ({ setPage }) => {
    return (
        <div>
            <Text size="largest">{t`what you can do with your nugg 🤌`}</Text>
            <div>
                <Text>{t`1️⃣ you can sell your nugg`}</Text>
                <Text>{t`2️⃣ you can loan your nugg`}</Text>
                <Text>{t`3️⃣ you can edit your nugg`}</Text>
            </div>
            <div>
                <Button
                    className="mobile-pressable-div"
                    label={t`how exactly does selling work? `}
                    onClick={() => {
                        setPage(Page.Rundown_8, true);
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
                <NuggBookBackButton page={Page.Rundown_6} />
            </div>
        </div>
    );
};

export default Rundown_7;
