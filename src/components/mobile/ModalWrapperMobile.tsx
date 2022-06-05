import React, { FC } from 'react';
import { animated } from '@react-spring/web';

import client from '@src/client';
import useAnimateOverlayBackdrop from '@src/hooks/useAnimateOverlayBackdrop';
import { ModalEnum } from '@src/interfaces/modals';

import OfferModalMobile from './OfferModalMobile';
import SellNuggOrItemModalMobile from './SellModalMobile';
import ClaimModalMobile from './ClaimModalMobile';
import HotRotateOModalMobile from './HotRotateOModalMobile';

export const ModalSwitchMobile = () => {
    const data = client.modal.useData();

    switch (data?.modalType) {
        case ModalEnum.Offer:
            return <OfferModalMobile data={data} />;
        case ModalEnum.Sell:
            return <SellNuggOrItemModalMobile data={data} />;
        case ModalEnum.Claim:
            return <ClaimModalMobile data={data} />;
        case ModalEnum.RotateO:
            return <HotRotateOModalMobile data={data} />;
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
        </animated.div>
    ) : null;
};

export default React.memo(ModalWrapperMobile);
