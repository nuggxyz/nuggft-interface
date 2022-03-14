import { NuggId } from '@src/client/router';
/*  BASE: DO NOT CHANGE  */

interface EmitEventBase {
    type: EmitEventNames;
    callback: (arg: Omit<this, 'callback'>) => void;
}

type BuildPayload<T> = Omit<T, 'callback'>;
type BuildCallback<T extends { type: any; callback: any }> = Pick<T, 'type' | 'callback'>;

/*  INTERFACES: add new ones here  */

interface EmitTransactionComplemted extends EmitEventBase {
    type: EmitEventNames.TransactionComplete;
    txhash: string;
}

interface EmitModalOpen extends EmitEventBase {
    type: EmitEventNames.OfferModalOpened;
    onModalOpen: () => void;
}

interface EmitMint extends EmitEventBase {
    type: EmitEventNames.Mint;
    tokenId: NuggId;
}

/*  EXPORTS: must be manually updated  */

export enum EmitEventNames {
    TransactionComplete = 'local.TransactionComplete',
    OfferModalOpened = 'local.OfferModalOpened',
    Mint = 'local.rpc.event.Mint',
}

export type EmitEventsListPayload =
    | BuildPayload<EmitTransactionComplemted>
    | BuildPayload<EmitMint>
    | BuildPayload<EmitModalOpen>;

export type EmitEventsListCallback =
    | BuildCallback<EmitTransactionComplemted>
    | BuildCallback<EmitMint>
    | BuildCallback<EmitModalOpen>;
