declare namespace NL.Redux.App {
    interface State {
        toasts: Toast[];
        modalIsOpen: Modals;
        modalData: ModalsData;
        view: Views;
        mobileView: MobileViews;
        walletVisible: boolean;
    }

    interface Toast {
        title: string;
        message:
            | NLAccountError
            | NLAccountSuccess
            | NLEpochError
            | NLEpochSuccess
            | NLSwapError
            | NLSwapSuccess
            | NLxNUGGError
            | NLxNUGGSuccess
            | NLTransactionError
            | NLTransactionSuccess
            | string;
        error: boolean;
        duration: number;
        index: number;
        id: string;
        loading: boolean;
        action?: () => void;
        callback?: () => void;
    }

    type Views = 'Swap' | 'Search';

    type MobileViews = 'Mint' | 'Search' | 'Wallet';

    type Modals =
        | 'Burn'
        | 'Offer'
        | 'StartSale'
        | 'Loan'
        | 'LoanOrBurn'
        | 'OfferOrSell'
        | 'Wallet'
        | 'ExtendLoan'
        | 'PayOffLoan';

    type ModalsData = {
        backgroundStyle?: import('react').CSSProperties;
        containerStyle?: import('react').CSSProperties;
        targetId?: string;
        type?: Modals;
    };

    type Error = 'ERROR';
}
