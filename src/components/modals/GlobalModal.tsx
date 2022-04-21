import React from 'react';

import { ModalEnum } from '@src/interfaces/modals';
import client from '@src/client';

import LoanInputModal from './LoanInputModal/LoanInputModal';
import LoanOrBurnModal from './LoanOrBurnModal/LoanOrBurnModal';
import MintModal from './MintModal/MintModal';
import ModalWrapper from './ModalWrapper';
import OfferModal from './OfferModal/OfferModal';
import QrCodeModal from './QrCodeModal/QrCodeModal';
import SellNuggOrItemModal from './SellNuggOrItemModal/SellNuggOrItemModal';

const ModalSwitch = () => {
    const data = client.modal.useData();

    switch (data?.modalType) {
        case ModalEnum.Offer:
            return <OfferModal data={data} />;
        case ModalEnum.Sell:
            return <SellNuggOrItemModal data={data} />;
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
    return (
        <ModalWrapper>
            <ModalSwitch />
        </ModalWrapper>
    );
};
