import React from 'react';
import { t } from '@lingui/macro';

import Text from '@src/components/general/Texts/Text/Text';
import { NuggBookPage, Page } from '@src/interfaces/nuggbook';
import Button from '@src/components/general/Buttons/Button/Button';
import lib from '@src/lib';
import NuggBookBackButton from '@src/components/nuggbook/NuggBookBackButton';

const Rundown_10: NuggBookPage = ({ setPage }) => {
    return (
        <div>
            <Text size="largest">{t`3️⃣ editing your nugg`}</Text>
            <div>
                <Text>{t`you can customize your nugg any way you like! except for the base, every category of items can be edited`}</Text>
                <Text>{t`start by buying items that interest you, and then have fun mixing and matching`}</Text>
                <Text>{t`this actually modifies your nft on the blockchain, so you have to pay the gas fees to save your work of art`}</Text>
            </div>
            <div>
                <Button
                    className="mobile-pressable-div"
                    label={t`how exactly does selling work? `}
                    onClick={() => {
                        setPage(Page.TableOfContents, false);
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
                <NuggBookBackButton page={Page.Rundown_9} />
            </div>
        </div>
    );
};

export default Rundown_10;
