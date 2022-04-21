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
    type: ModalEnum;
    backgroundStyle?: CSSProperties;
    containerStyle?: CSSProperties;
}

export interface LoanModalData extends ModalDataBase {
    type: ModalEnum.Loan;
    tokenId: NuggId;
    actionType: 'burn' | 'loan';
}

export interface OfferModalDataBase<T extends TokenType> extends ModalDataBase, TokenIdAsType<T> {
    type: ModalEnum.Offer;
    nuggToBuyFrom: PickFromTokenType<T, null, NuggId>;
    token: PickFromTokenType<T, LiveNugg, LiveItem>;
}
export type OfferModalData = { [S in TokenType]: OfferModalDataBase<S> }[TokenType];

export interface MintModalData extends ModalDataBase {
    type: ModalEnum.Mint;
}

export interface LoanInputModalData extends ModalDataBase {
    type: ModalEnum.LoanInput;
    actionType: 'liquidate' | 'rebalance';
    tokenId: NuggId;
}

export interface QRCodeModalData extends ModalDataBase {
    type: ModalEnum.QrCode;
    info: PeerInfo;
    uri: string;
    backgroundStyle: { background: string };
}

interface SellModalDataBase<T extends TokenType> extends ModalDataBase, TokenIdAsType<T> {
    type: ModalEnum.Sell;
    sellingNuggId: PickFromTokenType<T, null, NuggId>;
}

export type SellModalData = { [S in TokenType]: SellModalDataBase<S> }[TokenType];

export type ModalType =
    | LoanModalData
    | OfferModalData
    | QRCodeModalData
    | LoanInputModalData
    | MintModalData
    | SellModalData;
