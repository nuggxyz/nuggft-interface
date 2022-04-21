import { CSSProperties } from 'react';

import { LiveNugg, LiveItem } from '@src/client/interfaces';
import { PeerInfo } from '@src/web3/core/interfaces';

export enum ModalEnum {
    Offer,
    Loan,
    Mint,
    LoanInput,
    QrCode,
    Sell,
}

export interface ModalDataBase {
    modalType: ModalEnum;
    backgroundStyle?: CSSProperties;
    containerStyle?: CSSProperties;
}

export interface LoanModalData extends ModalDataBase {
    modalType: ModalEnum.Loan;
    tokenId: NuggId;
    actionType: 'burn' | 'loan';
}

export interface OfferModalDataBase extends TokenIdFactory, ModalDataBase {
    modalType: ModalEnum.Offer;
    nuggToBuyFrom: null | NuggId;
    token: LiveNugg | LiveItem;
}

export type OfferModalData = TokenIdFactoryCreator<
    OfferModalDataBase,
    { nuggToBuyFrom: null; token: LiveNugg },
    { nuggToBuyFrom: NuggId; token: LiveItem }
>;

// export type OfferModalData = IdDiff<
//     {
//         modalType: ModalEnum.Offer;
//     } & ModalDataBase,
//     { nuggToBuyFrom: null | NuggId; token: LiveNugg | LiveItem },
//     { nuggToBuyFrom: null; token: LiveNugg },
//     { nuggToBuyFrom: NuggId; token: LiveItem }
// >;

export interface MintModalData extends ModalDataBase {
    modalType: ModalEnum.Mint;
}

export interface LoanInputModalData extends ModalDataBase {
    modalType: ModalEnum.LoanInput;
    actionType: 'liquidate' | 'rebalance';
    tokenId: NuggId;
}

export interface QRCodeModalData extends ModalDataBase {
    modalType: ModalEnum.QrCode;
    info: PeerInfo;
    uri: string;
    backgroundStyle: { background: string };
}

export interface SellModalDataBase extends TokenIdFactory, ModalDataBase {
    modalType: ModalEnum.Sell;
    sellingNuggId: null | NuggId;
}

export type SellModalData = TokenIdFactoryCreator<
    SellModalDataBase,
    { sellingNuggId: null },
    { sellingNuggId: NuggId }
>;

export type ModalType =
    | LoanModalData
    | OfferModalData
    | QRCodeModalData
    | LoanInputModalData
    | MintModalData
    | SellModalData;
