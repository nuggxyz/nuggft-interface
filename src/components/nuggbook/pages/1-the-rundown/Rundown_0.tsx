import { t } from '@lingui/macro';
import React, { FunctionComponent } from 'react';

import Text from '@src/components/general/Texts/Text/Text';
import { NuggBookPage, Page } from '@src/interfaces/nuggbook';
import NuggBookBackButton from '@src/components/nuggbook/NuggBookBackButton';
import Button from '@src/components/general/Buttons/Button/Button';
import lib from '@src/lib';
import List, { ListRenderItemProps } from '@src/components/general/List/List';
import TokenViewer from '@src/components/nugg/TokenViewer';

const categories: TokenId[] = [
    'item-001',
    'item-002',
    'item-003',
    'item-004',
    'item-005',
    'item-006',
    'item-007',
    'item-008',
    'item-009',
    'item-010',
    'item-011',
];

const RenderItem: FunctionComponent<ListRenderItemProps<TokenId, undefined, unknown>> = ({
    item,
}) => {
    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
            }}
        >
            <TokenViewer tokenId={item} style={{ height: '40px', width: '40px' }} />
        </div>
    );
};

const Rundown_0: NuggBookPage = ({ setPage }) => {
    return (
        <div>
            <Text size="largest">{t`what's going on here?`}</Text>
            <div>
                <Text>
                    {t`we found that there was a lack of food-related nfts, so we brought the joy and deliciousness of chicken nuggets to the world 🌎`}
                </Text>
                <Text>{t`each nuggft is composed of one base and multiple items`}</Text>
                <Text>{t`the base comes in many different colors:`}</Text>
                <List
                    data={categories}
                    extraData={undefined}
                    RenderItem={RenderItem}
                    horizontal
                    style={{
                        justifyContent: 'space-between',
                        padding: '.7rem .4rem',
                    }}
                />
                <Text>{t`it is the only part of the nugg that can't be sold or changed, unless you sell the actual nft`}</Text>
            </div>
            <div>
                <Button
                    className="mobile-pressable-div"
                    label={t`tell me more about these nuggets 🐥`}
                    onClick={() => {
                        setPage(Page.Rundown_1, true);
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
                <NuggBookBackButton />
            </div>
        </div>
    );
};

export default Rundown_0;
