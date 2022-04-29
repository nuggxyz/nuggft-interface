import React, { FC, PropsWithChildren, useRef } from 'react';
import { animated, config, useSpring } from '@react-spring/web';

import lib from '@src/lib';
import useOnClickOutside from '@src/hooks/useOnClickOutside';
import useAnimateOverlay from '@src/hooks/useAnimateOverlay';
import client from '@src/client';
import useDimentions from '@src/client/hooks/useDimentions';

// type SpecialDiv = JSX.IntrinsicElements['div'] & {
//     style: (
//         library: typeof lib,
//     ) => JSX.IntrinsicElements['div']['style'] | JSX.IntrinsicElements['div']['style'];
// };

// type abc = { style: JSX.IntrinsicElements['div']['style'] | JSX.IntrinsicElements['div']['style'] };

// /** The type of the `animated()` function */
// export declare type WithStyles = {
//     <T extends ElementType>(wrappedComponent: T): StylesComponent<T>;
// };
// /** The type of an `animated()` component */
// export declare type StylesComponent<T extends ElementType> = ForwardRefExoticComponent<
//     Merge<
//         ComponentPropsWithRef<T>,
//         {
//             style?: StyleProps;
//         }
//     >
// >;

// declare type StyleProps = Merge<CSSProperties, abc>;

// const withStyles: WithStyles = (Comp) => {
//     const mem = React.useMemo(() => {
//         const { style } = Comp;

//         if (typeof style === 'function') {
//             return style(lib);
//         }

//         return style;
//     }, []);

//     return <Comp style={mem} />;
// };

const Modal: FC<PropsWithChildren<unknown>> = ({ children }) => {
    const isOpen = client.modal.useOpen();
    const data = client.modal.useData();
    const closeModal = client.modal.useCloseModal();

    const node = useRef<HTMLDivElement>(null);

    const { screen: screenType } = useDimentions();

    const containerStyle = useSpring({
        to: {
            transform: isOpen ? 'scale(1.0)' : 'scale(0.9)',
        },
        config: config.default,
    });

    const style = useAnimateOverlay(isOpen, { zIndex: 999000 });

    useOnClickOutside(node, closeModal);

    return (
        <animated.div style={{ ...style, justifyContent: 'flex-start' }}>
            <div
                style={{
                    position: 'relative',
                    ...(screenType === 'phone' && {
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'center',
                    }),
                }}
            >
                <animated.div
                    style={{
                        background: lib.colors.transparentWhite,
                        transition: `.2s all ${lib.layout.animation}`,
                        display: 'flex',
                        flexDirection: 'row',
                        position: 'relative',
                        borderRadius: lib.layout.borderRadius.largish,
                        padding: '1rem',
                        width: '90%',
                        maxHeight: '100%',
                        margin: '0rem',
                        justifyContent: 'flex-start',
                        backdropFilter: 'blur(10px)',
                        WebkitBackdropFilter: 'blur(10px)',
                        minWidth: '0px',
                        ...containerStyle,
                        ...data?.containerStyle,
                    }}
                    ref={node}
                >
                    {children}
                </animated.div>
            </div>
        </animated.div>
    );
};

export default React.memo(Modal);
