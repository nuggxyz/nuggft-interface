import React, { CSSProperties, FunctionComponent, useMemo, useRef, useState } from 'react';
import { animated, config, SpringProps, useSpring } from '@react-spring/web';

import useMeasure from '@src/hooks/useMeasure';
import usePrevious from '@src/hooks/usePrevious';

import { ListRenderItemProps } from './List';
import styles from './List.styles';

type Props<T, B, A> = {
    data: { title: string; items: T[] }[];
    ChildRenderItem: FunctionComponent<ListRenderItemProps<T, B, A>>;
    TitleRenderItem: FunctionComponent<{
        title: string;
        extraData: B;
        open?: boolean;
        setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
    }>;
    FeatureRenderItem?: FunctionComponent<{
        feature: string;
        isSelected: boolean;
        onClick: () => void;
        numberOfItems: number;
    }>;
    extraData: B;
    style?: CSSProperties | SpringProps;
    styleLeft?: CSSProperties;
    styleRight?: CSSProperties;
    children?: FunctionComponent<any>;
};

const StickyList = <T extends unknown, B extends unknown, A extends unknown>({
    data,
    ChildRenderItem,
    TitleRenderItem,
    FeatureRenderItem,
    extraData,
    style,
    styleLeft,
    styleRight,
    children,
}: // ...props
Props<T, B, A>) => {
    const refData = useMemo(
        () =>
            data.map((item) => {
                return {
                    ...item,
                    ref: React.createRef<HTMLDivElement>(),
                };
            }),
        [data],
    );
    const [animating, setAnimating] = useState(false);
    const listRef = useRef<HTMLDivElement>(null);

    const [y, setY] = useSpring(
        () => ({
            immediate: false,
            y: 0,
            onChange: (props) => {
                listRef.current && listRef.current.scroll(0, props.value.y);
            },
            config: config.default,
            onStart: () => setAnimating(true),
            onRest: () => setAnimating(false),
        }),
        [listRef],
    );
    const [current, setCurrent] = useState(refData?.map((item) => item.title));

    return listRef ? (
        <animated.div style={{ display: 'flex', ...style }}>
            <div style={styleLeft}>
                {FeatureRenderItem &&
                    refData.map((item, index) =>
                        refData[index].items.length > 0 ? (
                            <React.Fragment key={`feature-${index}`}>
                                <FeatureRenderItem
                                    onClick={() =>
                                        setY({
                                            y:
                                                (item.ref.current
                                                    ? item.ref.current.getBoundingClientRect().top
                                                    : 0) +
                                                (listRef.current
                                                    ? listRef.current.scrollTop -
                                                      listRef.current.offsetHeight / 4.7
                                                    : 0),
                                        })
                                    }
                                    isSelected={!current.includes(item.title)}
                                    feature={item.title}
                                    numberOfItems={refData[index].items.length}
                                />
                            </React.Fragment>
                        ) : null,
                    )}
            </div>
            <div
                style={{
                    // height: '100%',
                    // overflow: 'scroll',
                    ...styleRight,
                }}
                ref={listRef}
            >
                {refData.map((item, index) =>
                    refData[index].items && refData[index].items.length > 0 ? (
                        <React.Fragment key={`list-${index}`}>
                            <RenderItem
                                {...{
                                    item,
                                    TitleRenderItem,
                                    ChildRenderItem,
                                    extraData,
                                    animating,
                                    refData: refData.map((item) => item.title),
                                    // setCurrent,
                                    // index,
                                }}
                            />
                        </React.Fragment>
                    ) : null,
                )}
            </div>
            {children && children}
        </animated.div>
    ) : null;
};

export default StickyList;

type RenderProps<T, B, A> = {
    ChildRenderItem: FunctionComponent<ListRenderItemProps<T, B, A>>;
    TitleRenderItem: FunctionComponent<{
        title: string;
        extraData: B;
        open?: boolean;
        setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
    }>;
    FeatureRenderItem?: FunctionComponent<{
        feature: string;
        isSelected: boolean;
        onClick: () => void;
        numberOfItems: number;
    }>;
    extraData: B;
    animating: boolean;
    item: {
        ref: React.RefObject<HTMLDivElement>;
        title: string;
        items: T[];
    };
    refData: string[];
};

const RenderItem = <T extends unknown, B extends unknown, A extends unknown>({
    item,
    TitleRenderItem,
    ChildRenderItem,
    extraData,
    animating,
    refData,
}: RenderProps<T, B, A>) => {
    const [open, setOpen] = useState(true);
    const [ref, { height: viewHeight }] = useMeasure();
    const previous = usePrevious(open);
    const { opacity, height, y } = useSpring({
        from: { height: 0, opacity: 0, y: 0 },
        to: {
            height: open ? viewHeight : 0,
            opacity: open ? 1 : 0,
            y: open ? 0 : -20,
        },
    });
    return (
        <div id={item.title} ref={item.ref}>
            <div style={styles.sticky}>
                <TitleRenderItem
                    title={item.title}
                    setOpen={setOpen}
                    extraData={extraData}
                    open={open}
                />
            </div>
            <animated.div
                style={{
                    opacity,
                    height: open && previous === open ? 'auto' : height,
                    overflow: 'hidden',
                }}
            >
                <animated.div style={{ opacity, y }} ref={ref}>
                    {item.items.map((childItem, index) => (
                        <React.Fragment key={`child-${index}`}>
                            <ChildRenderItem
                                item={childItem}
                                index={index}
                                extraData={extraData}
                                {...animating}
                                {...refData}
                                action={() => undefined}
                                // extraData={[...extraData, extraData.last()[parentIndex]]}
                            />
                        </React.Fragment>
                    ))}
                </animated.div>
            </animated.div>
        </div>
    );
};
