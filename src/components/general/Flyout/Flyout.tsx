import React, { CSSProperties, FunctionComponent, PropsWithChildren } from 'react';
import { animated, AnimatedProps, config, useTransition } from '@react-spring/web';

import useOnHover from '@src/hooks/useOnHover';

import styles from './Flyout.styles';

type Props = {
    button: JSX.Element;
    style?: AnimatedProps<any>;
    containerStyle?: CSSProperties;
    float?: 'left' | 'right';
};

const Flyout: FunctionComponent<PropsWithChildren<Props>> = ({
    style,
    button,
    children,
    containerStyle,
    float = 'right',
}) => {
    const [open, setOpen] = React.useState(true);
    const [openRef, openHover] = useOnHover(() => setOpen(true));
    const [closeRef, closeHover] = useOnHover(() => setOpen(openHover || closeHover));

    const transition = useTransition(open, {
        from: {
            width: '50px',
            height: '100px',
            zIndex: 99,
            pointerEvents: 'none' as const,
            position: 'absolute' as const,
            top: 0,
            [float]: 0,
            opacity: 0,
            y: -5,
        },
        enter: { opacity: 1, pointerEvents: 'auto' as const, y: 0 },
        leave: { opacity: 0, pointerEvents: 'none' as const, y: -5 },
        config: config.stiff,
    });

    return (
        <div style={containerStyle} ref={openRef}>
            <div aria-hidden="true" role="button" onClick={() => setOpen(false)}>
                {button}
            </div>
            {transition(
                (animatedStyle, isOpen) =>
                    isOpen && (
                        <animated.div style={animatedStyle}>
                            <div
                                ref={closeRef}
                                style={{
                                    ...styles.container,
                                    ...style,
                                }}
                            >
                                {children}
                            </div>
                        </animated.div>
                    ),
            )}
        </div>
    );
};

export default React.memo(Flyout);
