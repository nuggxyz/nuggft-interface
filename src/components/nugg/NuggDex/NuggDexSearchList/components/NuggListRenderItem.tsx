import React, {
    FunctionComponent,
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
    rootRef,
    action,
}) => {
    const [ref, isVisible] = useIsVisible(rootRef.current, '10px');
    const selectedId = TokenState.select.tokenId();

    useEffect(() => {
        if (
            !isUndefinedOrNullOrBooleanFalse(isVisible) &&
            !isUndefinedOrNullOrNotFunction(action)
        ) {
            action();
        }
    }, [isVisible]);

    const style = useMemo(() => {
        return {
            ...(!isUndefinedOrNullOrStringEmpty(item)
                ? styles.nuggListRenderItemContainer
                : {}),
            ...(selectedId === item ? styles.selected : {}),
        };
    }, [item, selectedId]);

    const Body = useCallback(({ item }) => {
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
    }, []);

    const onClick = useCallback(() => {
        batch(() => {
            TokenState.dispatch.setTokenFromId(item);
            NuggDexState.dispatch.addToRecents({
                _localStorageValue: item,
                _localStorageTarget: 'recents',
                _localStorageExpectedType: 'array',
            });
        });
    }, [item]);

    return (
        <div ref={ref} style={style} onClick={onClick}>
            <Body item={item} />
        </div>
    );
};

export default NuggListRenderItem;
