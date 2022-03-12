declare namespace NL.Redux.App {
    interface State {
        dimensions: {
            height: number;
            width: number;
        };
        screenType: 'desktop' | 'tablet' | 'phone';
        toasts: Toast[];
        modalIsOpen: ModalNames | undefined;
        modalData: ModalsData;
        view: Views;
        mobileView: MobileViews;
        walletVisible: boolean;
        walletManagerVisable: boolean;
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

    type ModalNames =
        | 'SellNuggOrItemModal'
        | 'LoanInputModal'
        | 'LoanOrBurnModal'
        | 'OfferModal'
        | 'QrCodeModal';

    type ModalTypes =
        | 'SellNugg'
        | 'SellItem'
        | 'OfferNugg'
        | 'OfferItem'
        | 'LoanNugg'
        | 'BurnNugg'
        | 'ExtendLoan'
        | 'PayoffLoan';

    type ModalsData = {
        backgroundStyle?: import('react').CSSProperties;
        containerStyle?: import('react').CSSProperties;
        targetId?: string;
        type?: ModalTypes;
        data?: unknown;
    };

    type Modals = SellModal | OfferModal | LoanInputModal | LoanOrBurnModal | QrCodeModal;

    type SellModal = {
        name: 'SellNuggOrItemModal';
        modalData: ModalsData & {
            type: 'SellNugg' | 'SellItem';
            targetId: string;
        };
    };

    type OfferModal = {
        name: 'OfferModal';
        modalData: ModalsData & {
            type: 'OfferItem' | 'OfferNugg';
            targetId: string;
        };
    };

    type LoanOrBurnModal = {
        name: 'LoanOrBurnModal';
        modalData: ModalsData & {
            type: 'LoanNugg' | 'BurnNugg';
            targetId: string;
        };
    };

    type LoanInputModal = {
        name: 'LoanInputModal';
        modalData: ModalsData & {
            type: 'ExtendLoan' | 'PayoffLoan';
            targetId: string;
        };
    };

    type QrCodeModal = {
        name: 'QrCodeModal';
        modalData: Omit<ModalsData, 'type' | 'targetId'>;
    };

    type Error = 'ERROR';
}
