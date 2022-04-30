import React, { FC, PropsWithChildren } from 'react';
import { animated } from '@react-spring/web';

import useAnimateOverlay from '@src/hooks/useAnimateOverlay';
import client from '@src/client';
// eslint-disable-next-line import/no-cycle

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
    // const data = client.modal.useData();
    // const closeModal = client.modal.useCloseModal();

    // const node = useRef<HTMLDivElement>(null);

    // const { screen: screenType } = useDimentions();

    const style = useAnimateOverlay(isOpen, { zIndex: 999000 });

    // useOnClickOutside(node, closeModal);

    // const footerRef = React.useRef<HTMLDivElement>(null);

    // const visualViewport = client.viewport.useVisualViewport();

    // const [page, setPage] = React.useState(0);

    // const [tabFadeTransition] = useTransition(
    //     page,
    //     {
    //         initial: {
    //             opacity: 0,
    //             zIndex: 0,
    //             left: 0,
    //         },
    //         from: (p, i) => ({
    //             opacity: 0,
    //             zIndex: 0,
    //             left: p === i ? 1000 : -1000,
    //         }),
    //         enter: { opacity: 1, left: 0, right: 0, pointerEvents: 'auto', zIndex: 40000 },
    //         leave: (p, i) => {
    //             return {
    //                 opacity: 0,
    //                 zIndex: 0,
    //                 left: p === i ? -1000 : 1000,
    //             };
    //         },
    //         keys: (item) => `tabFadeTransition${item}5`,
    //         config: config.gentle,
    //         expires: true,
    //     },
    //     [page],
    // );

    return isOpen ? (
        <animated.div
            style={{
                ...style,
            }}
        >
            {children}

            {/* {tabFadeTransition((sty, pager) => (
                <animated.div
                    style={{
                        // position: 'relative',
                        position: 'absolute',
                        display: 'flex',
                        justifyContent: 'center',
                        width: '100%',
                        margin: 20,
                        overflow: 'hidden',
                    }}
                    // ref={node}
                >
                    <animated.div
                        style={{
                            width: '93%',
                            padding: '25px',
                            position: 'relative',
                            // pointerEvents: 'none',
                            // ...sty,
                            background: lib.colors.transparentWhite,
                            transition: `.2s all ${lib.layout.animation}`,

                            borderRadius: lib.layout.borderRadius.largish,

                            margin: '0rem',
                            justifyContent: 'flex-start',
                            backdropFilter: 'blur(10px)',
                            WebkitBackdropFilter: 'blur(10px)',
                            ...containerStyle,
                            overflow: 'hidden',
                            ...sty,
                        }}
                    >
                    </animated.div>
                </animated.div>
            ))} */}
        </animated.div>
    ) : null;
};

export default React.memo(Modal);
//    {/* <animated.div
//                 ref={footerRef}
//                 style={{
//                     ...style,
//                     display: 'flex',
//                     justifyContent: 'center',
//                     alignItems: 'flex-start',
//                     position: 'absolute',
//                     // paddingTop: 20,
//                     width: '100%',

//                     top: visualViewport.height,
//                     height: 60,
//                 }}
//             >
//                 <div
//                     style={{
//                         width: '98%',
//                         height: '96%',
//                         background: lib.colors.transparentWhite,
//                         borderRadius: lib.layout.borderRadius.medium,
//                     }}
//                 />
//             </animated.div> */}
