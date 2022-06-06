import { t } from '@lingui/macro';
import React, { FunctionComponent } from 'react';

import Text from '@src/components/general/Texts/Text/Text';
import { NuggBookPage, Page } from '@src/interfaces/nuggbook';
import NuggBookBackButton from '@src/components/nuggbook/NuggBookBackButton';
import Button from '@src/components/general/Buttons/Button/Button';
import lib from '@src/lib';
import List, { ListRenderItemProps } from '@src/components/general/List/List';
import TokenViewer from '@src/components/nugg/TokenViewer';

import styles from './Rundown.styles';

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
            <TokenViewer tokenId={item} style={{ height: '30px', width: '30px' }} disableOnClick />
        </div>
    );
};

const Rundown_0: NuggBookPage = ({ setPage }) => {
    return (
        <div>
            <Text size="largest" textStyle={styles.title}>{t`what's going on here?`}</Text>
            <div>
                <Text
                    textStyle={styles.text}
                >{t`It all began with an idea to store and assemble images right on the blockchain, which led us to nuggft!`}</Text>
                <Text>{t`Each nuggft (or nugg) starts out as a plain nugget, randomly selected from the following:`}</Text>
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
                <Text
                    textStyle={styles.text}
                >{t`The nugget is the only part of the nugg that can't be sold or replaced, unless you sell the actual nft`}</Text>
            </div>
            <div style={styles.buttonContainer}>
                <Button
                    className="mobile-pressable-div"
                    label={t`tell me more 🐥`}
                    onClick={() => {
                        setPage(Page.Rundown_1, true);
                    }}
                    size="large"
                    buttonStyle={styles.actionButton}
                    textStyle={{ fontWeight: lib.layout.fontWeight.thicc }}
                />
                <NuggBookBackButton />
            </div>
        </div>
    );
};

export default Rundown_0;
