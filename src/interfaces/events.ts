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

interface Mint extends BaseEvent {
    name: EventNames.Mint;
    args: MintEvent['args'];
}

interface Loan extends BaseEvent {
    name: EventNames.Loan;
    args: LoanEvent['args'];
}

interface Rebalance extends BaseEvent {
    name: EventNames.Rebalance;
    args: RebalanceEvent['args'];
}
interface Liquidate extends BaseEvent {
    name: EventNames.Liquidate;
    args: LiquidateEvent['args'];
}
interface Offer extends BaseEvent {
    name: EventNames.Offer;
    args: OfferEvent['args'];
}

interface OfferMint extends BaseEvent {
    name: EventNames.OfferMint;
    args: OfferMintEvent['args'];
}

interface OfferItem extends BaseEvent {
    name: EventNames.OfferItem;
    args: OfferItemEvent['args'];
}

interface Claim extends BaseEvent {
    name: EventNames.Claim;
    args: ClaimEvent['args'];
}

interface ClaimItem extends BaseEvent {
    name: EventNames.ClaimItem;
    args: ClaimItemEvent['args'];
}

interface Stake extends BaseEvent {
    name: EventNames.Stake;
    args: StakeEvent['args'];
}

interface Transfer extends BaseEvent {
    name: EventNames.Transfer;
    args: TransferEvent['args'];
}

interface TransferItem extends BaseEvent {
    name: EventNames.TransferItem;
    args: TransferItemEvent['args'];
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
