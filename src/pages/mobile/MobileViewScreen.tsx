/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { FC, PropsWithChildren } from 'react';
import { animated, config, useSpring } from '@react-spring/web';
import { useNavigate } from 'react-router-dom';

import client from '@src/client';
import lib from '@src/lib';
import ViewingNuggPhone from '@src/components/mobile/ViewingNuggPhone';
import useAnimateOverlayBackdrop from '@src/hooks/useAnimateOverlayBackdrop';
import Button from '@src/components/general/Buttons/Button/Button';
import useMobileViewingNugg from '@src/client/hooks/useMobileViewingNugg';

const TOP = 0;
const HIDDEN = 1000;

// this makes the MobileViewScreen behave like a regular component
// MobileViewScreen is always rendered, just hidden and this triggers it

// there are probably 1400000 better ways to do this, but we can fix that later, this works lol
export const MobileViewScreenController = () => {
    const openViewScreen = client.viewscreen.useOpenViewScreen();
    const closeViewScreen = client.viewscreen.useCloseViewScreen();

    const { tokenId } = useMobileViewingNugg();

    const navigate = useNavigate();

    React.useEffect(() => {
        if (tokenId) {
            openViewScreen(tokenId);
            return () => {
                closeViewScreen();
            };
        }
        return undefined;
    }, [tokenId, openViewScreen, closeViewScreen, navigate]);

    return <></>;
};

const MobileViewScreen: FC<PropsWithChildren<{ onClose?: () => void }>> = () => {
    const { tokenId } = useMobileViewingNugg();

    const [, startTransiton] = React.useTransition();

    const top = React.useMemo(() => {
        return tokenId ? TOP : HIDDEN;
    }, [tokenId]);

    const navigate = useNavigate();

    const [draggedTop, setDraggedTop] = React.useState<number>(top);

    const containerStyle = useSpring({
        from: {
            top: 1000,
        },
        to: {
            top: draggedTop,
        },
        delay: 0,
        config: config.default,
    });

    React.useEffect(() => {
        setDraggedTop(top);
    }, [top]);

    const style = useAnimateOverlayBackdrop(!!tokenId, undefined, 200);

    const node = React.useRef<HTMLDivElement>(null);

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
                    <ViewingNuggPhone tokenId={tokenId} />
                </animated.div>
            </animated.div>

            {/* {show && <MobileViewScreenController />} */}
        </>
    );
};

export default MobileViewScreen;
