import { t } from '@lingui/macro';
import React, { FunctionComponent } from 'react';

import Text from '@src/components/general/Texts/Text/Text';
import Button from '@src/components/general/Buttons/Button/Button';
import { NuggBookPage, Page } from '@src/interfaces/nuggbook';
import lib from '@src/lib';
import NuggBookBackButton from '@src/components/nuggbook/NuggBookBackButton';
import List, { ListRenderItemProps } from '@src/components/general/List/List';
import TokenViewer from '@src/components/nugg/TokenViewer';

import styles from './Rundown.styles';

const categories: [string, TokenId][] = [
    ['eyes', 'item-1001'],
    ['mouth', 'item-2001'],
    ['hair', 'item-3004'],
    ['head', 'item-4003'],
    ['back', 'item-5008'],
    ['neck', 'item-6006'],
    ['hold', 'item-7001'],
];

const RenderItem: FunctionComponent<ListRenderItemProps<[string, TokenId], undefined, unknown>> = ({
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
            <TokenViewer
                tokenId={item[1]}
                style={{ height: '30px', width: '30px' }}
                disableOnClick
            />
            <Text>{item[0]}</Text>
        </div>
    );
};

const Rundown_1: NuggBookPage = ({ setPage }) => {
    return (
        <div>
            <Text size="largest" textStyle={styles.title}>{t`a nugg and its items 🐤`}</Text>
            <div>
                <Text
                    textStyle={styles.text}
                >{t`Your nugg is randomly given 6 items when it is minted, however those can be sold and others can be bought`}</Text>
                <Text textStyle={styles.text} size="small">
                    <i>{t`That's right! You can swap items without even selling your nft!`}</i>
                </Text>
                <Text>{t`There are 7 different categories of items, each containing many different items:`}</Text>
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
                >{t`Only one of each category can be displayed at a time, but your nugg can hold up to 15 different items`}</Text>
            </div>
            <div style={styles.buttonContainer}>
                <Button
                    className="mobile-pressable-div"
                    label={t`ok, so how do I buy em? 💸`}
                    onClick={() => {
                        setPage(Page.Rundown_2, true);
                    }}
                    size="large"
                    buttonStyle={styles.actionButton}
                    textStyle={{ fontWeight: lib.layout.fontWeight.thicc }}
                />
                <NuggBookBackButton page={Page.Rundown_0} />
            </div>
        </div>
    );
};

export default Rundown_1;
