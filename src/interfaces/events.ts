import {
    ClaimEvent,
    ClaimItemEvent,
    MintEvent,
    OfferEvent,
    OfferItemEvent,
    OfferMintEvent,
    StakeEvent,
    TransferEvent,
    TransferItemEvent,
} from '../typechain/NuggftV1';

enum EventNames {
    Mint = 'Mint',
    Offer = 'Offer',
    OfferMint = 'OfferMint',
    OfferItem = 'OfferItem',
    Stake = 'Stake',
    Claim = 'Claim',
    ClaimItem = 'ClaimItem',
    Transfer = 'Transfer',
    TransferItem = 'TransferItem',
}

interface BaseEvent {
    name: EventNames;
}

interface Mint extends MintEvent, BaseEvent {
    name: EventNames.Mint;
}

interface Offer extends OfferEvent, BaseEvent {
    name: EventNames.Offer;
}

interface OfferMint extends OfferMintEvent, BaseEvent {
    name: EventNames.OfferMint;
}

interface OfferItem extends OfferItemEvent, BaseEvent {
    name: EventNames.OfferItem;
}

interface Claim extends ClaimEvent, BaseEvent {
    name: EventNames.Claim;
}

interface ClaimItem extends ClaimItemEvent, BaseEvent {
    name: EventNames.ClaimItem;
}

interface Stake extends StakeEvent, BaseEvent {
    name: EventNames.Stake;
}

interface Transfer extends TransferEvent, BaseEvent {
    name: EventNames.Transfer;
}

interface TransferItem extends TransferItemEvent, BaseEvent {
    name: EventNames.TransferItem;
}

export type InterfacedEvent =
    | Mint
    | OfferMint
    | OfferItem
    | Claim
    | ClaimItem
    | Stake
    | Offer
    | Transfer
    | TransferItem;
