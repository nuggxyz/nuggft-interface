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
import { isUndefinedOrNullOrArrayEmpty, range } from '@src/lib';
import usePrevious from '@src/hooks/usePrevious';
import useForceUpdate from '@src/hooks/useForceUpdate';

import styles from './List.styles';

export interface InfiniteListRenderItemProps<T, B, A> {
    item: T;
    extraData: B;
    action?: (arg: A) => void;
    onScrollEnd?: ({ addToList }: { addToList: boolean }) => void;
    index: number;
    rootRef?: unknown;
    selected?: boolean;
    style?: CSSProperties;
}

interface Props<T, B, A> {
    data: T[];
    RenderItem: FunctionComponent<InfiniteListRenderItemProps<T, B, A>>;
    loading?: boolean;
    extraData: B;
    action?: (arg: A) => void;
    onScrollEnd?: ({ addToList }: { addToList: boolean }) => void;
    label?: string;
    border?: boolean;
    horizontal?: boolean;
    style?: CSSProperties;
    onScroll?: () => void;
    selected?: unknown;
    listEmptyText?: string;
    labelStyle?: CSSProperties;
    listEmptyStyle?: CSSProperties;
    loaderColor?: string;
    itemHeight: number;
    animationToggle?: boolean;
    TitleButton?: FunctionComponent;
    titleLoading?: boolean;
}

const LIST_PADDING = 4;

const InfiniteList = <T, B, A>({
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
    itemHeight = 10,
    animationToggle,
    TitleButton,
    titleLoading,
}: Props<T, B, A>) => {
    const windowRef = useRef<HTMLDivElement>(null);
    const [windowHeight, setWindowHeight] = useState(0);

    const forceUpdate = useForceUpdate();

    useEffect(() => {
        if (windowRef.current) {
            setWindowHeight(windowRef.current.scrollHeight);
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
                scrollTop + windowHeight === 0
                    ? 0
                    : Math.floor((scrollTop + windowHeight) / itemHeight) + LIST_PADDING,
            ),
        [scrollTop, data, windowHeight, itemHeight],
    );
    const prevStart = usePrevious(startIndex);
    const prevEnd = usePrevious(endIndex);
    const prevData = usePrevious(data);

    const [items, setItems] = useState<JSX.Element[]>([]);

    // console.log({ startIndex, endIndex });

    useEffect(() => {
        if (
            prevEnd !== endIndex ||
            prevStart !== startIndex ||
            JSON.stringify(prevData) !== JSON.stringify(data)
        ) {
            // console.log('setItems');
            // const temp = [];
            // for (let i = startIndex; i <= endIndex; i++) {
            //     temp.push(
            //         <div
            //             key={JSON.stringify(data[i])}
            //             style={{
            //                 position: 'absolute',
            //                 top: `${i * itemHeight}px`,
            //                 width: '100%',
            //                 height: `${itemHeight}px`,
            //             }}
            //         >
            //             <RenderItem
            //                 item={data[i]}
            //                 key={JSON.stringify(data[i])}
            //                 index={i}
            //                 extraData={extraData}
            //                 action={action}
            //                 selected={JSON.stringify(selected) === JSON.stringify(data[i])}
            //             />
            //         </div>,
            //     );
            // }
            // setItems(temp);
            setItems((_items) => {
                const len = _items.length;
                range(startIndex, endIndex).forEach((i) => {
                    if (
                        !_items[i - startIndex] ||
                        _items[i - startIndex].key !== JSON.stringify(data[i])
                    ) {
                        // eslint-disable-next-line no-param-reassign
                        _items[i - startIndex] = (
                            <div
                                key={`infinite-${i}`}
                                style={{
                                    position: 'absolute',
                                    top: `${i * itemHeight}px`,
                                    width: '100%',
                                    height: `${itemHeight}px`,
                                }}
                            >
                                <RenderItem
                                    item={data[i]}
                                    index={i}
                                    extraData={extraData}
                                    action={action}
                                    selected={JSON.stringify(selected) === JSON.stringify(data[i])}
                                />
                            </div>
                        );
                    }
                });
                // console.log(_items);
                const diff = endIndex - startIndex + 1;
                if (diff !== _items.length) {
                    // console.log(_items.length - diff);
                    range(0, _items.length - diff).forEach(() => _items.pop());
                }
                if (len !== _items.length) {
                    // console.log('FORCE');
                    forceUpdate();
                }
                return _items;
            });
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
        if (onScrollEnd) {
            if (
                items.length !== 0 &&
                items.length * itemHeight + scrollTop >= innerHeight &&
                prevEnd !== endIndex &&
                !loading
            ) {
                void onScrollEnd({ addToList: true });
            }
        }
    }, [scrollTop, items, innerHeight, onScrollEnd, prevEnd, endIndex, loading, itemHeight]);

    const _onScroll = useCallback(
        (e: { currentTarget: { scrollTop: number } }) => {
            setScrollTop(e.currentTarget?.scrollTop);
            if (onScroll) onScroll();
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
            loading ? (
                <div
                    style={{
                        marginTop: '1rem',
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
            ) : null,
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

export default React.memo(InfiniteList) as typeof InfiniteList;
