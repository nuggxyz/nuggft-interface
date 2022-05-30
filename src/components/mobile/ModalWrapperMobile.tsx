import React, { FC } from 'react';
import { animated } from '@react-spring/web';

import client from '@src/client';
import useAnimateOverlayBackdrop from '@src/hooks/useAnimateOverlayBackdrop';
import { ModalEnum } from '@src/interfaces/modals';

import OfferModalMobile from './OfferModalMobile';
import SellNuggOrItemModalMobile from './SellModalMobile';
import ClaimModalMobile from './ClaimModalMobile';

export const ModalSwitchMobile = () => {
    const data = client.modal.useData();

    switch (data?.modalType) {
        case ModalEnum.Offer:
            return <OfferModalMobile data={data} />;
        case ModalEnum.Sell:
            return <SellNuggOrItemModalMobile data={data} />;

        case ModalEnum.Claim:
            return <ClaimModalMobile data={data} />;

        case undefined:
        default:
            return null;
    }
};

const ModalWrapperMobile: FC<unknown> = () => {
    const isOpen = client.modal.useOpen();

    const style = useAnimateOverlayBackdrop(isOpen, { zIndex: 999000 });

    return isOpen ? (
        <animated.div
            style={{
                ...style,
            }}
        >
            <ModalSwitchMobile />

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

export default React.memo(ModalWrapperMobile);
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
