declare namespace NL.Redux.App {
    interface State {
        toasts: Toast[];
        modalIsOpen: Modals;
        modalData: ModalsData;
        view: Views;
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
        callback?: () => void;
    }

    type Views = 'Swap' | 'Search';

    type Modals = 'Burn' | 'Offer' | 'StartSale';

    type ModalsData = {
        backgroundStyle?: import('react').CSSProperties;
        containerStyle?: import('react').CSSProperties;
        targetId?: string;
        type?: Modals;
    };

    type Error = 'ERROR';
}
