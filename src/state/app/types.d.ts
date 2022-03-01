declare namespace NL.Redux.App {
    interface State {
        dimensions: {
            height: number;
            width: number;
        };
        screenType: 'desktop' | 'tablet' | 'phone';
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
        action?: (setClosed?: React.Dispatch<React.SetStateAction<boolean>>) => void;
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
        | 'PayOffLoan'
        | 'HappyTipper'
        | 'QrCode';

    type ModalsData = {
        backgroundStyle?: import('react').CSSProperties;
        containerStyle?: import('react').CSSProperties;
        targetId?: string;
        type?: Modals;
    };

    type Error = 'ERROR';
}
