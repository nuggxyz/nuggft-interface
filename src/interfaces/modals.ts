import { CSSProperties } from 'react';

import { PeerInfo } from '@src/web3/core/interfaces';

export enum ModalEnum {
    Offer,
    Loan,
    Mint,
    LoanInput,
    QrCode,
    Sell,
    Claim,
    Adjust,
    RotateO,
    NuggBook,
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

export interface ClaimModalData extends ModalDataBase {
    modalType: ModalEnum.Claim;
}

export interface OfferModalDataBase extends TokenIdFactoryBase, ModalDataBase {
    modalType: ModalEnum.Offer;
    nuggToBuyFrom: null | NuggId;
    nuggToBuyFor: null | NuggId;
    endingEpoch: number | null;
}

export type OfferModalData = TokenIdFactoryCreator<
    OfferModalDataBase,
    { nuggToBuyFrom: null; nuggToBuyFor: null },
    { nuggToBuyFrom: NuggId; nuggToBuyFor: NuggId }
>;

export interface MintModalData extends ModalDataBase {
    modalType: ModalEnum.Mint;
}

export interface RotateOModalData extends ModalDataBase {
    modalType: ModalEnum.RotateO;
    tokenId: NuggId;
    currentVersion: number;
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

export interface SellModalDataBase extends TokenIdFactoryBase, ModalDataBase {
    modalType: ModalEnum.Sell;
    sellingNuggId: null | NuggId;
}

export interface NuggBookModalData extends ModalDataBase {
    modalType: ModalEnum.NuggBook;
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
    | ClaimModalData
    | SellModalData
    | RotateOModalData
    | NuggBookModalData;
