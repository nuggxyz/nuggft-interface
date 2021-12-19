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

const NuggListRenderItem: FunctionComponent<Props> = memo(
    ({ item, index, extraData, rootRef, action, onScrollEnd }) => {
        const [ref, isVisible] = useIsVisible(rootRef.current, '10px');
        const selected = TokenState.select.tokenId();

        useEffect(() => {
            if (
                !isUndefinedOrNullOrBooleanFalse(isVisible) &&
                !isUndefinedOrNullOrNotFunction(onScrollEnd)
            ) {
                onScrollEnd();
            }
        }, [isVisible]);

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
            <div ref={ref} style={style} onClick={() => action(item)}>
                <Body />
            </div>
        );
    },
    (prevProps, props) =>
        JSON.stringify(prevProps.item) === JSON.stringify(props.item) &&
        props.item !== '' &&
        prevProps.selected === props.selected &&
        JSON.stringify(prevProps.action) === JSON.stringify(props.action),
);

export default React.memo(NuggListRenderItem);
