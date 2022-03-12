import React, { FunctionComponent, useMemo } from 'react';

import { isUndefinedOrNullOrObjectEmpty, parseTokenId } from '@src/lib';
import Label from '@src/components/general/Label/Label';
import TokenViewer from '@src/components/nugg/TokenViewer';
import constants from '@src/lib/constants';
import client from '@src/client';
import { ListRenderItemProps } from '@src/components/general/List/InfiniteList';

import styles from './NuggDexComponents.styles';

type Props = ListRenderItemProps<
    NL.GraphQL.Fragments.Nugg.ListItem,
    undefined,
    NL.GraphQL.Fragments.Nugg.ListItem
>;

const NuggListRenderItem: FunctionComponent<Props> = ({ item, index, extraData, action }) => {
    const lastView__tokenId = client.live.lastView__tokenId();
    const isNuggItem = useMemo(
        () => item && item.id && item.id.startsWith(constants.ID_PREFIX_ITEM),
        [item],
    );

    const style = useMemo(() => {
        return {
            ...(!isUndefinedOrNullOrObjectEmpty(item) ? styles.nuggListRenderItemContainer : {}),
            ...(lastView__tokenId === item?.id ? styles.selected : {}),
        };
    }, [item, lastView__tokenId]);

    return (
        <div style={style} onClick={() => action(item)}>
            <TokenViewer
                tokenId={item?.id || ''}
                style={{
                    height: '200px',
                    width: '200px',
                }}
                disableOnClick
            />
            <Label text={parseTokenId(item?.id, true)} size="larger" />
        </div>
    );
};

export default React.memo(
    NuggListRenderItem,
    (prevProps, props) =>
        JSON.stringify(prevProps.item) === JSON.stringify(props.item) &&
        prevProps.selected === props.selected &&
        JSON.stringify(prevProps.action) === JSON.stringify(props.action),
) as typeof NuggListRenderItem;
