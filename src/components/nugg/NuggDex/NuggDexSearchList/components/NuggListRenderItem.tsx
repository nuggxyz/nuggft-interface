import React, {
    FunctionComponent,
    memo,
    useCallback,
    useEffect,
    useMemo,
} from 'react';
import { batch } from 'react-redux';

import useIsVisible from '../../../../../hooks/useIsVisible';
import {
    isUndefinedOrNullOrBooleanFalse,
    isUndefinedOrNullOrNotFunction,
    isUndefinedOrNullOrStringEmpty,
} from '../../../../../lib';
import Label from '../../../../general/Label/Label';
import { ListRenderItemProps } from '../../../../general/List/List';
import TokenState from '../../../../../state/token';
import NuggDexState from '../../../../../state/nuggdex';
import TokenViewer from '../../../TokenViewer';

import styles from './NuggDexComponents.styles';

type Props = ListRenderItemProps<string>;

const NuggListRenderItem: FunctionComponent<Props> = ({
    item,
    index,
    extraData,
    action,
}) => {
    const selected = TokenState.select.tokenId();

    const style = useMemo(() => {
        return {
            ...(!isUndefinedOrNullOrStringEmpty(item)
                ? styles.nuggListRenderItemContainer
                : {}),
            ...(selected === item ? styles.selected : {}),
        };
    }, [item, selected]);

    const Body = useCallback(() => {
        console.log('rendering', item);
        return !isUndefinedOrNullOrStringEmpty(item) ? (
            <div style={styles.nuggListRenderItemNugg}>
                <TokenViewer
                    tokenId={item || ''}
                    style={{ height: '80px', width: '80px' }}
                />
                <Label text={'NuggFT #' + item} />
            </div>
        ) : null;
    }, [item]);

    return (
        <div style={style} onClick={() => action(item)}>
            <Body />
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
