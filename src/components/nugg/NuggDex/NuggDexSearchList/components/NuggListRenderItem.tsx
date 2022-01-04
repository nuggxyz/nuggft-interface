import React, {
    FunctionComponent,
    memo,
    useCallback,
    useEffect,
    useMemo,
} from 'react';

import { isUndefinedOrNullOrObjectEmpty, isUndefinedOrNullOrStringEmpty } from '../../../../../lib';
import Label from '../../../../general/Label/Label';
import { ListRenderItemProps } from '../../../../general/List/List';
import TokenState from '../../../../../state/token';
import TokenViewer from '../../../TokenViewer';
import Colors from '../../../../../lib/colors';
import FontSize from '../../../../../lib/fontSize';

import styles from './NuggDexComponents.styles';

type Props = ListRenderItemProps<NL.GraphQL.Fragments.Nugg.ListItem>;

const NuggListRenderItem: FunctionComponent<Props> = ({
    item,
    index,
    extraData,
    action,
}) => {
    const selected = TokenState.select.tokenId();

    const style = useMemo(() => {
        return {
            ...(!isUndefinedOrNullOrObjectEmpty(item)
                ? styles.nuggListRenderItemContainer
                : {}),
            ...(selected === item.id ? styles.selected : {}),
        };
    }, [item, selected]);

    const Body = useCallback(() => {
        return !isUndefinedOrNullOrObjectEmpty(item) ? (
            <div style={styles.nuggListRenderItemNugg}>
                <TokenViewer
                    tokenId={item.id || ''}
                    style={{ height: '140px', width: '140px' }}
                    data={item.dotnuggRawCache}
                />
                <Label
                    text={'Nugg #' + item.id}
                    size="larger"
                    // containerStyles={{ color: Colors.nuggBlueText }}
                />
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
