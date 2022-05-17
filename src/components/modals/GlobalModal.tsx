import React from 'react';

import { ModalEnum } from '@src/interfaces/modals';
import client from '@src/client';
import useDimensions from '@src/client/hooks/useDimensions';
import ModalWrapperMobile from '@src/components/mobile/ModalWrapperMobile';
import OfferModalMobile from '@src/components/mobile/OfferModalMobile';
import SellNuggOrItemModalMobile from '@src/components/mobile/SellModalMobile';
import ClaimModalMobile from '@src/components/mobile/ClaimModalMobile';

import LoanInputModal from './LoanInputModal/LoanInputModal';
import LoanOrBurnModal from './LoanOrBurnModal/LoanOrBurnModal';
import MintModal from './MintModal/MintModal';
import ModalWrapper from './ModalWrapper';
import OfferModal from './OfferModal/OfferModal';
import QrCodeModal from './QrCodeModal/QrCodeModal';
import SellNuggOrItemModal from './SellNuggOrItemModal/SellNuggOrItemModal';

export const ModalSwitch = () => {
    const data = client.modal.useData();
    const { isPhone } = useDimensions();

    switch (data?.modalType) {
        case ModalEnum.Offer:
            return isPhone ? <OfferModalMobile data={data} /> : <OfferModal data={data} />;
        case ModalEnum.Sell:
            return isPhone ? (
                <SellNuggOrItemModalMobile data={data} />
            ) : (
                <SellNuggOrItemModal data={data} />
            );
        case ModalEnum.Claim:
            return isPhone ? <ClaimModalMobile data={data} /> : null;

        case ModalEnum.Mint:
            return <MintModal data={data} />;

        case ModalEnum.QrCode:
            return <QrCodeModal data={data} />;

        case ModalEnum.LoanInput:
            return <LoanInputModal data={data} />;
        case ModalEnum.Loan:
            return <LoanOrBurnModal data={data} />;
        case undefined:
        default:
            return null;
    }
};

export default () => {
    const { isPhone } = useDimensions();

    return isPhone ? (
        <ModalWrapperMobile>
            <ModalSwitch />
        </ModalWrapperMobile>
    ) : (
        <ModalWrapper>
            <ModalSwitch />
        </ModalWrapper>
    );
};
