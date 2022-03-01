import React, { FunctionComponent, useMemo } from 'react';

import { isUndefinedOrNullOrObjectEmpty } from '@src/lib';
import Label from '@src/components/general/Label/Label';
import { ListRenderItemProps } from '@src/components/general/List/List';
import TokenState from '@src/state/token';
import TokenViewer from '@src/components/nugg/TokenViewer';

import styles from './NuggDexComponents.styles';

type Props = ListRenderItemProps<NL.GraphQL.Fragments.Nugg.ListItem>;

const NuggListRenderItem: FunctionComponent<Props> = ({ item, index, extraData, action }) => {
    const selected = TokenState.select.tokenId();

    const style = useMemo(() => {
        return {
            ...(!isUndefinedOrNullOrObjectEmpty(item) ? styles.nuggListRenderItemContainer : {}),
            ...(selected === item.id ? styles.selected : {}),
        };
    }, [item, selected]);

    return (
        <div style={style} onClick={() => action(item)}>
            <TokenViewer
                tokenId={item.id || ''}
                style={{
                    height: '200px',
                    width: '200px',
                    // objectFit: 'contain',
                    // overflow: 'visible',
                }}
                data={item.dotnuggRawCache}
            />
            <Label text={'Nugg #' + item.id} size="larger" />
        </div>
    );
};

export default React.memo(
    NuggListRenderItem,
    (prevProps, props) =>
        JSON.stringify(prevProps.item) === JSON.stringify(props.item) &&
        prevProps.selected === props.selected &&
        JSON.stringify(prevProps.action) === JSON.stringify(props.action),
);
