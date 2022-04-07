import { CSSProperties } from 'react';

import { NuggId, TokenId } from '@src/client/router';
import { LiveToken } from '@src/client/interfaces';
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
    type: ModalEnum;
    backgroundStyle?: CSSProperties;
    containerStyle?: CSSProperties;
}

export interface LoanModalData extends ModalDataBase {
    type: ModalEnum.Loan;
    tokenId: TokenId;
    actionType: 'burn' | 'loan';
}

export interface OfferModalData extends ModalDataBase {
    type: ModalEnum.Offer;
    tokenId: TokenId;
    nuggToBuyFrom?: NuggId;
    token: LiveToken;
    tokenType: 'nugg' | 'item';
}

export interface MintModalData extends ModalDataBase {
    type: ModalEnum.Mint;
}

export interface LoanInputModalData extends ModalDataBase {
    type: ModalEnum.LoanInput;
    actionType: 'liquidate' | 'rebalance';
    tokenId: TokenId;
}

export interface QRCodeModalData extends ModalDataBase {
    type: ModalEnum.QrCode;
    info: PeerInfo;
    uri: string;
    backgroundStyle: { background: string };
}

interface SellModalDataBase extends ModalDataBase {
    type: ModalEnum.Sell;
    tokenId: TokenId;
    tokenType: 'item' | 'nugg';
}

interface SellModalNuggData extends SellModalDataBase {
    tokenType: 'nugg';
}

interface SellModalItemData extends SellModalDataBase {
    tokenType: 'item';
    sellingNuggId: NuggId;
}

export type SellModalData = SellModalNuggData | SellModalItemData;

export type ModalType =
    | LoanModalData
    | OfferModalData
    | QRCodeModalData
    | LoanInputModalData
    | MintModalData
    | SellModalData;
