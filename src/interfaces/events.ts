import {} from '../typechain/NuggftV1';
import {
    ClaimEvent,
    ClaimItemEvent,
    LoanEvent,
    MintEvent,
    OfferEvent,
    OfferItemEvent,
    OfferMintEvent,
    StakeEvent,
    TransferEvent,
    TransferItemEvent,
    LiquidateEvent,
    RebalanceEvent,
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
    Loan = 'Loan',
    Rebalance = 'Rebalance',
    Liquidate = 'Liquidate',
}

interface BaseEvent {
    name: EventNames;
}

interface Mint extends MintEvent, BaseEvent {
    name: EventNames.Mint;
}

interface Loan extends LoanEvent, BaseEvent {
    name: EventNames.Loan;
}

interface Rebalance extends RebalanceEvent, BaseEvent {
    name: EventNames.Rebalance;
}
interface Liquidate extends LiquidateEvent, BaseEvent {
    name: EventNames.Liquidate;
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
    | TransferItem
    | Liquidate
    | Loan
    | Rebalance;
