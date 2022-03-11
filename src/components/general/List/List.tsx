import React, {
    CSSProperties,
    FunctionComponent,
    LegacyRef,
    RefCallback,
    useCallback,
    useEffect,
    useMemo,
} from 'react';

import Text from '@src/components/general/Texts/Text/Text';
import Loader from '@src/components/general/Loader/Loader';
import {
    isUndefinedOrNullOrArrayEmpty,
    isUndefinedOrNullOrBooleanFalse,
    isUndefinedOrNullOrNotFunction,
} from '@src/lib';
import useOnScroll from '@src/hooks/useOnScroll';
import usePrevious from '@src/hooks/usePrevious';
import useIsVisible from '@src/hooks/useIsVisible';

import styles from './List.styles';

export interface ListRenderItemProps<T extends unknown, B extends unknown> {
    item: T;
    extraData?: B;
    action?: (() => void) | React.Dispatch<React.SetStateAction<any>>;
    onScrollEnd?: () => void;
    index: number;
    rootRef?: LegacyRef<HTMLDivElement>;
    selected?: boolean;
    style?: CSSProperties;
}

export interface ListProps<T extends unknown, B extends unknown> {
    RenderItem: FunctionComponent<ListRenderItemProps<T, B>>;
    loading?: boolean;
    extraData?: B;
    action?: (() => void) | React.Dispatch<React.SetStateAction<any>> | any;
    onScrollEnd?: () => void;
    label?: string;
    border?: boolean;
    horizontal?: boolean;
    style?: CSSProperties;
    onScroll?: RefCallback<any>;
    selected?: T;
    listEmptyText?: string;
    labelStyle?: CSSProperties;
    listEmptyStyle?: CSSProperties;
    loaderColor?: string;
    TitleButton?: FunctionComponent;
    titleLoading?: boolean;
    // itemHeight: number;
    data: T[];
}

const List = <T extends unknown, B extends unknown>({
    data,
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
    listEmptyText,
    labelStyle,
    loaderColor,
    listEmptyStyle,
    TitleButton,
    titleLoading,
}: ListProps<T, B>) => {
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
                            selected={JSON.stringify(selected) === JSON.stringify(item)}
                        />
                    ))}
                </>
            ) : (
                <div
                    style={{
                        ...styles.container,
                        justifyContent: 'center',
                    }}
                >
                    {!loading && (
                        <Text weight="light" size="small" type="text" textStyle={listEmptyStyle}>
                            {listEmptyText || 'No items to display...'}
                        </Text>
                    )}
                </div>
            ),
        [data, action, extraData, RenderItem, listEmptyText, loading],
    );

    const Loading = useCallback(
        () =>
            loading && (
                <div
                    style={{
                        marginTop: '1rem',
                        height: '1rem',
                        position: 'relative',
                    }}
                >
                    <Loader color={loaderColor || 'black'} />
                </div>
            ),
        [loading, loaderColor],
    );

    const Label = useCallback(
        () =>
            label ? (
                <div style={styles.labelContainer}>
                    <div style={styles.title}>
                        <Text textStyle={{ ...styles.label, ...labelStyle }}>{label}</Text>
                        <div
                            style={{
                                marginLeft: '.5rem',
                                position: 'relative',
                            }}
                        >
                            {titleLoading && <Loader color={loaderColor || 'black'} />}
                        </div>
                    </div>
                    <div style={{ marginTop: '-2px' }}>{TitleButton && <TitleButton />}</div>
                </div>
            ) : null,
        [label, labelStyle, TitleButton, titleLoading, loaderColor],
    );

    return (
        <>
            <Label />
            <div style={containerStyle} ref={ref}>
                <List selected={selected} />
                <Loading />
                {!isUndefinedOrNullOrNotFunction(onScrollEnd) && (
                    <EndOfListAnchor onScrollEnd={onScrollEnd} rootRef={ref} loading={loading} />
                )}
            </div>
        </>
    );
};

export default React.memo(List) as typeof List;

const EndOfListAnchor = ({ rootRef, onScrollEnd, loading }) => {
    const [ref, isVisible] = useIsVisible(rootRef.current, '10px');
    const prevVisible = usePrevious(isVisible);
    useEffect(() => {
        if (!isUndefinedOrNullOrBooleanFalse(isVisible) && isVisible !== prevVisible && !loading) {
            onScrollEnd();
        }
    }, [isVisible, prevVisible, loading]);

    return <div ref={ref} key="NUGGNUGGNUGGNUGGNUGG" />;
};
