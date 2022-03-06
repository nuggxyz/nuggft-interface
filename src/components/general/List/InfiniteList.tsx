import React, {
    CSSProperties,
    FunctionComponent,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';

import Text from '@src/components/general/Texts/Text/Text';
import Loader from '@src/components/general/Loader/Loader';
import { isUndefinedOrNullOrArrayEmpty, isUndefinedOrNullOrNotFunction } from '@src/lib';
import usePrevious from '@src/hooks/usePrevious';

import styles from './List.styles';

export type ListRenderItemProps<T> = {
    item: T;
    extraData?: any[];
    action?: any;
    onScrollEnd?: any;
    index: number;
    rootRef?: any;
    selected?: boolean;
    style?: CSSProperties;
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
    onScroll?: () => void;
    selected?: any;
    listEmptyText?: string;
    labelStyle?: CSSProperties;
    listEmptyStyle?: CSSProperties;
    loaderColor?: string;
    itemHeight: number;
    animationToggle?: boolean;
    TitleButton?: FunctionComponent;
    titleLoading?: boolean;
};

const LIST_PADDING = 2;

const InfiniteList: FunctionComponent<Props> = ({
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
    listEmptyText,
    labelStyle,
    loaderColor,
    listEmptyStyle,
    itemHeight = 10,
    animationToggle,
    TitleButton,
    titleLoading,
}) => {
    const windowRef = useRef<HTMLDivElement>();
    const [windowHeight, setWindowHeight] = useState(100);

    useEffect(() => {
        if (windowRef.current) {
            setWindowHeight(windowRef.current.clientHeight);
        }
    }, [windowRef, animationToggle]);

    const [scrollTop, setScrollTop] = useState(0);
    const innerHeight = useMemo(() => data.length * itemHeight, [data, itemHeight]);
    const startIndex = useMemo(
        () => Math.max(Math.floor(scrollTop / itemHeight) - LIST_PADDING, 0),
        [scrollTop, itemHeight],
    );
    const endIndex = useMemo(
        () =>
            Math.min(
                data.length - 1,
                Math.floor((scrollTop + windowHeight) / itemHeight) + LIST_PADDING,
            ),
        [scrollTop, data, windowHeight, itemHeight],
    );

    const prevStart = usePrevious(startIndex);
    const prevEnd = usePrevious(endIndex);
    const prevData = usePrevious(data);

    const [items, setItems] = useState([]);

    useEffect(() => {
        if (
            prevEnd !== endIndex ||
            prevStart !== startIndex ||
            JSON.stringify(prevData[startIndex]) !== JSON.stringify(data[startIndex])
        ) {
            let temp = [];
            for (let i = startIndex; i <= endIndex; i++) {
                temp.push(
                    <div
                        key={JSON.stringify(data[i])}
                        style={{
                            position: 'absolute',
                            top: `${i * itemHeight}px`,
                            width: '100%',
                            height: `${itemHeight}px`,
                        }}
                    >
                        <RenderItem
                            item={data[i]}
                            key={JSON.stringify(data[i])}
                            index={i}
                            extraData={extraData}
                            action={action}
                            selected={JSON.stringify(selected) === JSON.stringify(data[i])}
                        />
                    </div>,
                );
            }
            setItems(temp);
        }
    }, [
        endIndex,
        startIndex,
        prevEnd,
        prevStart,
        RenderItem,
        action,
        data,
        prevData,
        extraData,
        selected,
        items,
        itemHeight,
    ]);

    useEffect(() => {
        if (!isUndefinedOrNullOrNotFunction(onScrollEnd)) {
            if (
                items.length !== 0 &&
                items.length * itemHeight + scrollTop >= innerHeight &&
                prevEnd !== endIndex &&
                !loading &&
                onScrollEnd
            ) {
                onScrollEnd();
            }
        }
    }, [scrollTop, items, innerHeight, onScrollEnd, prevEnd, endIndex, loading, itemHeight]);

    const _onScroll = useCallback(
        (e) => {
            setScrollTop(e.currentTarget.scrollTop);
            onScroll && onScroll();
        },
        [onScroll],
    );
    const containerStyle = useMemo(() => {
        return {
            ...styles.container,
            ...(border && styles.border),
            ...(horizontal && styles.horizontal),
            ...style,
        };
    }, [border, horizontal, style]);

    const List = useCallback(
        () =>
            !isUndefinedOrNullOrArrayEmpty(items) ? (
                <div
                    style={{
                        position: 'relative',
                        height: `${innerHeight}px`,
                        width: '100%',
                    }}
                >
                    {items}
                </div>
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
        [items, listEmptyText, loading, innerHeight, listEmptyStyle],
    );

    const Loading = useCallback(
        () =>
            loading && (
                <div
                    style={{
                        marginTop: '1rem',
                        // height: '1rem',
                        position: 'absolute',
                        top: `${(endIndex + 1) * itemHeight}px`,
                        width: '100%',
                        height: `${itemHeight}px`,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    <Loader color={loaderColor || 'black'} />
                </div>
            ),
        [loading, loaderColor, itemHeight, endIndex],
    );

    const Label = useCallback(
        () =>
            label ? (
                <Text
                    textStyle={{
                        ...styles.label,
                        ...labelStyle,
                        display: 'flex',
                        alignItems: 'center',
                    }}
                >
                    {label}
                    {titleLoading && (
                        <Loader color={loaderColor || 'black'} style={{ marginLeft: '.5rem' }} />
                    )}
                </Text>
            ) : null,
        [label, labelStyle, titleLoading, loaderColor],
    );

    return (
        <>
            {(label || TitleButton) && (
                <div style={styles.labelContainer}>
                    {label && <Label />}
                    {TitleButton && <TitleButton />}
                </div>
            )}
            <div
                ref={windowRef}
                style={{
                    ...containerStyle,
                    overflow: 'scroll',
                }}
                onScroll={_onScroll}
            >
                <List />
                <Loading />
            </div>
        </>
    );
};

export default React.memo(InfiniteList);
