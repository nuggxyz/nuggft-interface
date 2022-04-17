/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { FC, PropsWithChildren } from 'react';
import { animated, config, useSpring } from '@react-spring/web';
import { useNavigate } from 'react-router-dom';

import client from '@src/client';
import lib from '@src/lib';
import ViewingNuggPhone from '@src/components/nugg/ViewingNugg/ViewingNuggPhone';
import useAnimateOverlayBackdrop from '@src/hooks/useAnimateOverlayBackdrop';
import Button from '@src/components/general/Buttons/Button/Button';
import useViewingNugg from '@src/client/hooks/useViewingNugg';

const TOP = 0;
const HIDDEN = 1000;

// this makes the MobileViewScreen behave like a regular component
// MobileViewScreen is always rendered, just hidden and this triggers it

// there are probably 1400000 better ways to do this, but we can fix that later, this works lol
const MobileViewScreenController = () => {
    const openViewScreen = client.viewscreen.useOpenViewScreen();
    const closeViewScreen = client.viewscreen.useCloseViewScreen();

    const { safeTokenId: tokenid } = useViewingNugg();

    const navigate = useNavigate();

    React.useEffect(() => {
        if (tokenid) openViewScreen(tokenid);
        return () => {
            closeViewScreen();
        };
    }, [tokenid, openViewScreen, closeViewScreen, navigate]);

    return <></>;
};

const MobileViewScreen: FC<PropsWithChildren<{ onClose?: () => void }>> = () => {
    // const close = client.viewscreen.useCloseViewScreen();
    const isopen = client.viewscreen.useViewScreenOpen();

    const [, startTransiton] = React.useTransition();

    const top = React.useMemo(() => {
        return isopen ? TOP : HIDDEN;
    }, [isopen]);

    const navigate = useNavigate();

    const [draggedTop, setDraggedTop] = React.useState<number>(top);

    const containerStyle = useSpring({
        from: {
            top: 1000,
        },
        to: {
            top: draggedTop,
        },
        delay: 200,
        config: config.default,
    });

    React.useEffect(() => {
        setDraggedTop(top);
    }, [top]);

    const style = useAnimateOverlayBackdrop(isopen, undefined, 400);

    const node = React.useRef<HTMLDivElement>(null);

    const { showMobileViewOverlay } = useViewingNugg();

    return (
        <>
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
                    // onTouchStart={(event) => {
                    //     console.log('abc', event.detail);
                    // }}
                    // onTouchMove={(event) => {
                    //     event.preventDefault();
                    //     const check = event.touches.item(0);
                    //     console.log(check);
                    //     setDraggedTop(check.clientY);
                    //     if (check.clientY > top + 300) handleClose();
                    // }}
                    // onTouchEnd={() => {
                    //     setDraggedTop(top);
                    // }}
                    // onDrag={(event) => {
                    //     event.preventDefault();
                    //     setDraggedTop(event.clientY);
                    //     if (event.clientY > top + 300) handleClose();
                    // }}
                    onDragEnd={() => {
                        setDraggedTop(top);
                    }}
                    style={{
                        ...containerStyle,
                        height: '100%',
                        width: '100%',
                        // background: 'white',

                        // boxShadow: '0 6px 10px rgba(80, 80, 80,1)',
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
                        backdropFilter: 'blur(10px)',
                        // @danny7even this seemed to cause problems with issue #67 - but it didnt solve any
                        WebkitBackdropFilter: 'blur(10px)',
                    }}
                >
                    <Button
                        buttonStyle={{
                            position: 'absolute',
                            boxShadow: '0 3px 5px rgba(80, 80, 80,1)',
                            bottom: 30,
                            right: 30,
                            zIndex: 100002,
                            background: lib.colors.gradient3,
                            color: 'white',
                            scale: '1.5',
                            borderRadius: lib.layout.borderRadius.large,
                        }}
                        label="back"
                        onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            startTransiton(() => {
                                navigate(-1);
                            });
                        }}
                    />
                    <ViewingNuggPhone />
                </animated.div>
            </animated.div>

            {showMobileViewOverlay && <MobileViewScreenController />}
        </>
    );
};

export default MobileViewScreen;
