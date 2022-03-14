import { NuggId } from '@src/client/router';
/*  BASE: DO NOT CHANGE  */

interface EmitEventBase {
    type: EmitEventNames;
    callback: (arg: Omit<this, 'callback'>) => void;
}

type BuildPayload<T> = Omit<T, 'callback'>;
type BuildCallback<T extends { type: any; callback: any }> = Pick<T, 'type' | 'callback'>;

/*  INTERFACES: add new ones here  */

interface EmitTransactionCompleted extends EmitEventBase {
    type: EmitEventNames.TransactionComplete;
    txhash: string;
}

interface EmitTransactionInitiated extends EmitEventBase {
    type: EmitEventNames.TransactionInitiated;
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

interface EmitTransfer extends EmitEventBase {
    type: EmitEventNames.Transfer;
    tokenId: NuggId;
}

/*  EXPORTS: must be manually updated  */

export enum EmitEventNames {
    TransactionComplete = 'local.TransactionComplete',
    TransactionInitiated = 'local.TransactionInitiated',
    OfferModalOpened = 'local.OfferModalOpened',
    Mint = 'local.rpc.event.Mint',
    Transfer = 'local.rpc.event.Transfer',
}

export type EmitEventsListPayload =
    | BuildPayload<EmitTransactionCompleted>
    | BuildPayload<EmitTransactionInitiated>
    | BuildPayload<EmitMint>
    | BuildPayload<EmitModalOpen>
    | BuildPayload<EmitTransfer>;

export type EmitEventsListCallback =
    | BuildCallback<EmitTransactionCompleted>
    | BuildCallback<EmitTransactionInitiated>
    | BuildCallback<EmitMint>
    | BuildCallback<EmitModalOpen>
    | BuildCallback<EmitTransfer>;
