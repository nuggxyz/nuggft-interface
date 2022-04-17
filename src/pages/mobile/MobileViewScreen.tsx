import React, { FC, PropsWithChildren } from 'react';
import { animated, config, useSpring } from '@react-spring/web';
import { useNavigate } from 'react-router-dom';

import client from '@src/client';
import lib from '@src/lib';
import useOnClickOutside from '@src/hooks/useOnClickOutside';
import ViewingNuggPhone from '@src/components/nugg/ViewingNugg/ViewingNuggPhone';
import useAnimateOverlayBackdrop from '@src/hooks/useAnimateOverlayBackdrop';

const TOP = 0;
const HIDDEN = 1000;

const MobileViewScreen: FC<PropsWithChildren<{ onClose?: () => void }>> = ({ onClose }) => {
    const close = client.viewscreen.useCloseViewScreen();
    const isopen = client.viewscreen.useViewScreenOpen();

    const [, startTransiton] = React.useTransition();

    const top = React.useMemo(() => {
        return isopen ? TOP : HIDDEN;
    }, [isopen]);

    const navigate = useNavigate();

    const handleClose = React.useCallback(() => {
        if (isopen) {
            console.log('h554');
            if (onClose) onClose();
            navigate(-1);
            startTransiton(close);
        }
    }, [isopen, close, startTransiton, onClose, navigate]);

    const [draggedTop, setDraggedTop] = React.useState<number>(top);

    const containerStyle = useSpring({
        from: {
            top: 1000,
        },
        to: {
            top: draggedTop,
        },
        config: config.gentle,
    });

    React.useEffect(() => {
        setDraggedTop(top);
    }, [top]);

    const style = useAnimateOverlayBackdrop(isopen);

    const node = React.useRef<HTMLDivElement>(null);

    useOnClickOutside(node, handleClose);

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
                    if (event.clientY > top + 300) handleClose();
                }}
                onDragEnd={() => {
                    setDraggedTop(top);
                }}
                style={{
                    ...containerStyle,
                    height: '100%',
                    width: '100%',
                    // boxShadow: '0 6px 10px rgba(102, 102, 102,1)',
                    // background: lib.colors.white,
                    borderTopLeftRadius: lib.layout.borderRadius.largish,
                    borderTopRightRadius: lib.layout.borderRadius.largish,
                    position: 'absolute',
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    background: 'transparent',
                    // background: lib.colors.transparentDarkGrey2,
                    backdropFilter: 'blur(10px) darkness(1.2)',
                    // @danny7even this seemed to cause problems with issue #67 - but it didnt solve any
                    WebkitBackdropFilter: 'blur(10px)',
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
                <ViewingNuggPhone />
            </animated.div>
        </animated.div>
    );
};

export default MobileViewScreen;
