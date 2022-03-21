import React, { FunctionComponent, useMemo } from 'react';

import { isUndefinedOrNullOrObjectEmpty, parseTokenId } from '@src/lib';
import Label from '@src/components/general/Label/Label';
import TokenViewer from '@src/components/nugg/TokenViewer';
import client from '@src/client';
import { InfiniteListRenderItemProps } from '@src/components/general/List/InfiniteList';

import styles from './NuggDexComponents.styles';

type Props = InfiniteListRenderItemProps<
    NL.GraphQL.Fragments.Nugg.ListItem,
    undefined,
    NL.GraphQL.Fragments.Nugg.ListItem
>;

const NuggListRenderItem: FunctionComponent<Props> = ({ item, action }) => {
    const lastView__tokenId = client.live.lastView.tokenId();

    const style = useMemo(() => {
        return {
            ...(!isUndefinedOrNullOrObjectEmpty(item) ? styles.nuggListRenderItemContainer : {}),
            ...(lastView__tokenId === item?.id ? styles.selected : {}),
        };
    }, [item, lastView__tokenId]);

    return (
        <div aria-hidden="true" role="button" style={style} onClick={() => action && action(item)}>
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
