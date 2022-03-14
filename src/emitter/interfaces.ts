/*  BASE: DO NOT CHANGE  */

interface EmitEventBase {
    type: EmitEventNames;
    callback: (arg: Omit<this, 'callback'>) => void;
}

/*  INTERFACES: add new ones here  */

interface EmitTransactionComplemted extends EmitEventBase {
    type: EmitEventNames.TransactionComplete;
    txhash: string;
}

interface EmitModalOpen extends EmitEventBase {
    type: EmitEventNames.OfferModalOpened;
    onModalOpen: () => void;
}

/*  EXPORTS: must be manually updated  */

export enum EmitEventNames {
    TransactionComplete = 'TransactionComplete',
    OfferModalOpened = 'OfferModalOpened',
}

export type EmitEventsListPayload =
    | Omit<EmitTransactionComplemted, 'callback'>
    | Omit<EmitModalOpen, 'callback'>;

export type EmitEventsListCallback =
    | Pick<EmitTransactionComplemted, 'type' | 'callback'>
    | Pick<EmitModalOpen, 'type' | 'callback'>;
