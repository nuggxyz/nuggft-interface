import React, { FC, PropsWithChildren, useEffect } from 'react';
import { animated, config, useSpring, useTransition } from '@react-spring/web';

import client from '@src/client';
import useAnimateOverlayBackdrop from '@src/hooks/useAnimateOverlayBackdrop';
import lib from '@src/lib';
import { Page } from '@src/interfaces/nuggbook';
import useOnClickOutside from '@src/hooks/useOnClickOutside';

const Modal: FC<PropsWithChildren<{ top: number; close: () => void }>> = ({
    top,
    children,
    close,
}) => {
    const isOpen = client.nuggbook.useNuggBookPage();

    const [draggedTop, setDraggedTop] = React.useState<number>(top);

    useEffect(() => {
        setDraggedTop(top);
    }, [top]);

    const containerStyle = useSpring({
        from: {
            top: 1000,
        },
        to: {
            top: draggedTop,
        },
        config: config.gentle,
    });

    const style: CSSPropertiesAnimated = useAnimateOverlayBackdrop(isOpen !== Page.Close);

    const tabFadeTransition = useTransition(children, {
        from: {
            opacity: 0,
            height: 0,
            zIndex: 0,
        },
        enter: { opacity: 1 },
        leave: { opacity: 0, height: 0, zIndex: 0 },
        config: config.stiff,
    });

    const node = React.useRef<HTMLDivElement>(null);

    useOnClickOutside(node, close);

    return (
        <animated.div
            style={{
                ...style,
                height: '100%',
                width: '100%',
                justifyContent: 'flex-end',
                display: 'flex',
                flexDirection: 'column',
                zIndex: 100000,
            }}
        >
            <animated.div
                ref={node}
                draggable="true"
                onDragStart={(event) => {
                    event.dataTransfer.setData('text/plain', 'draggable');
                }}
                onDrag={(event) => {
                    event.preventDefault();
                    setDraggedTop(event.clientY);
                    if (event.clientY > top + 200) close();
                }}
                onDragEnd={() => {
                    setDraggedTop(top);
                }}
                style={{
                    ...containerStyle,
                    height: '2000px',
                    width: '100%',
                    background: lib.colors.white,
                    borderTopLeftRadius: lib.layout.borderRadius.largish,
                    borderTopRightRadius: lib.layout.borderRadius.largish,
                    position: 'absolute',
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                <div
                    style={{
                        margin: '.8rem',
                        background: lib.colors.grey,
                        height: '8px',
                        width: '40px',
                        borderRadius: 100,
                        alignSelf: 'center',
                        justifySelf: 'center',
                    }}
                />
                {tabFadeTransition((_styles, kids) => (
                    <animated.div style={_styles}>{kids}</animated.div>
                ))}
            </animated.div>
        </animated.div>
    );
};

export default React.memo(Modal);
