import React, {
    CSSProperties,
    FunctionComponent,
    RefCallback,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react';

import Text from '../Texts/Text/Text';
import Loader from '../Loader/Loader';
import { isUndefinedOrNullOrArrayEmpty } from '../../../lib';
import useOnScroll from '../../../hooks/useOnScroll';
import usePrevious from '../../../hooks/usePrevious';

import styles from './List.styles';

export type ListRenderItemProps<T> = {
    item: T;
    extraData?: any[];
    action?: any;
    onScrollEnd?: any;
    index: number;
    rootRef?: any;
    selected?: boolean;
};

type Props = {
    data: any[];
    RenderItem: FunctionComponent<ListRenderItemProps<any>>;
    loading?: boolean;
    extraData?: any[];
    action?: any;
    onScrollEnd?: any;
    label?: string;
    border?: boolean;
    horizontal?: boolean;
    style?: CSSProperties;
    onScroll?: RefCallback<any>;
    selected?: any;
};

const List: FunctionComponent<Props> = ({
    data = [],
    RenderItem,
    loading = false,
    extraData,
    action,
    onScrollEnd,
    label,
    border = false,
    horizontal = false,
    style,
    onScroll,
    selected,
}) => {
    const ref = useOnScroll(onScroll);
    const containerStyle = useMemo(() => {
        return {
            ...styles.container,
            ...(border && styles.border),
            ...(horizontal && styles.horizontal),
            ...style,
        };
    }, [border, horizontal, style]);

    const List = useCallback(
        ({ selected }) =>
            !isUndefinedOrNullOrArrayEmpty(data) ? (
                <>
                    {data.map((item, index) => (
                        <RenderItem
                            item={item}
                            key={JSON.stringify(item)}
                            index={index}
                            extraData={extraData}
                            action={action}
                            rootRef={ref}
                            selected={
                                JSON.stringify(selected) ===
                                JSON.stringify(item)
                            }
                        />
                    ))}
                </>
            ) : (
                <div
                    style={{
                        ...styles.container,
                        justifyContent: 'center',
                    }}>
                    <Text weight="light" textStyle={styles.noItems}>
                        No items to display...
                    </Text>
                </div>
            ),
        [data, action, extraData, RenderItem, ref],
    );

    const EndOfList = useCallback(
        ({ onScrollEnd }) => (
            <RenderItem
                item=""
                key="w0w0w0w0w0w"
                index={-1}
                onScrollEnd={onScrollEnd}
                rootRef={ref}
            />
        ),
        [ref, RenderItem],
    );

    const Loading = useCallback(
        () => (
            <div style={{ marginTop: '1rem' }}>
                {loading && <Loader color="black" />}
            </div>
        ),
        [loading],
    );

    const Label = useCallback(
        () => (label ? <Text textStyle={styles.label}>{label}</Text> : null),
        [label],
    );

    return (
        <>
            <Label />
            <div style={containerStyle} ref={ref}>
                <List selected={selected} />
                <EndOfList onScrollEnd={onScrollEnd} />
                <Loading />
            </div>
        </>
    );
};

export default List;
