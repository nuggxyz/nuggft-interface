import React from 'react';
import { t } from '@lingui/macro';

import Text from '@src/components/general/Texts/Text/Text';
import { NuggBookPage, Page } from '@src/interfaces/nuggbook';
import Button from '@src/components/general/Buttons/Button/Button';
import lib from '@src/lib';
import NuggBookBackButton from '@src/components/nuggbook/NuggBookBackButton';

const Rundown_5: NuggBookPage = ({ setPage }) => {
    return (
        <div>
            <Text size="largest">{t`the nugg pool 🤿`}</Text>
            <div>
                <Text>{t`at the end of each auction, the winning bid is stored in a pool of money controlled by the nuggft platform`}</Text>
                <Text>{t`in addition to being a fun nft, your nugg also represents a share of this pool (this is how we calculate the nugg's floor price)`}</Text>
                <Text>{t`so the more nuggs you have, the more money is attributed to you!`}</Text>
                <Text>{t`you can sell your nuggs to liquidate what belongs to you, or you can even take out a loan using your nugg as collateral`}</Text>
            </div>
            <div>
                <Button
                    className="mobile-pressable-div"
                    label={t`I certainly like money, tell me more!`}
                    onClick={() => {
                        setPage(Page.Rundown_6, true);
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
                <NuggBookBackButton page={Page.Rundown_4} />
            </div>
        </div>
    );
};

export default Rundown_5;
