/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import React, { CSSProperties, FunctionComponent, PropsWithChildren } from 'react';
import { animated, AnimatedProps, config, useTransition } from '@react-spring/web';

import useOnHover from '@src/hooks/useOnHover';
import useOnClickOutside from '@src/hooks/useOnClickOutside';
import AppState from '@src/state/app';

import styles from './Flyout.styles';

type Props = {
    button: JSX.Element;
    style?: AnimatedProps<any>;
    containerStyle?: CSSProperties;
    float?: 'left' | 'right';
    top?: number;
    openOnHover?: boolean;
};

const Flyout: FunctionComponent<PropsWithChildren<Props>> = ({
    style,
    button,
    children,
    containerStyle,
    float = 'right',
    top = 0,
    openOnHover = false,
}) => {
    const [open, setOpen] = React.useState(false);
    const [openRef, openHover] = useOnHover(() => {
        if (openOnHover) setOpen(true);
    });

    const [closeRef, closeHover] = useOnHover(() => {
        if (openOnHover) setOpen(openHover || closeHover);
        else if (open && !closeHover) setOpen(false);
        // else setOpen(false);
    });
    const screen = AppState.select.screenType();
    const dimentions = AppState.select.dimensions();

    useOnClickOutside<HTMLDivElement>(closeRef, () => {
        setOpen(false);
    });

    const transition = useTransition(open, {
        from: {
            width: '50px',
            height: '100px',
            pointerEvents: 'none' as const,
            position: 'absolute' as const,
            top,
            [float]: 0,
            opacity: 0,
            y: -5,
        },
        enter: { opacity: 1, pointerEvents: 'auto' as const, y: 0 },
        leave: { opacity: 0, pointerEvents: 'none' as const, y: -5 },
        config: config.stiff,
    });

    // const Child = children;

    return (
        <div
            style={{ cursor: 'pointer', ...containerStyle }}
            ref={closeRef}
            aria-hidden="true"
            onClick={() => {
                setOpen(!open);
            }}
        >
            <div aria-hidden="true" role="button" onClick={() => setOpen(!open)}>
                {button}
            </div>
            {transition(
                (animatedStyle, isOpen) =>
                    isOpen && (
                        <>
                            <animated.div style={animatedStyle}>
                                <div
                                    ref={openRef}
                                    style={{
                                        ...styles.container,
                                        ...style,
                                        zIndex: 1100,
                                    }}
                                >
                                    {children}
                                </div>
                            </animated.div>
                            {screen === 'phone' && (
                                <div
                                    aria-hidden="true"
                                    style={{
                                        cursor: 'default',
                                        position: 'absolute',
                                        zIndex: 1099,
                                        ...dimentions,
                                        top: 0,
                                        right: 0,
                                    }}
                                    onClick={() => {}}
                                />
                            )}
                        </>
                    ),
            )}
        </div>
    );
};

export default React.memo(Flyout);
