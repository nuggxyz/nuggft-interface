interface AppStateType {
    dimensions: {
        height: number;
        width: number;
    };
    screenType: 'desktop' | 'tablet' | 'phone';
    toasts: AppStateToast[];
    modalIsOpen: ModalNames | undefined;
    modalData: ModalsData;
    view: AppStateViews;
    mobileView: AppStateMobileViews;
    walletVisible: boolean;
}

interface AppStateToast {
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
    listener?: (
        setClosed: () => void,
        setClosedSoftly: () => void,
        setError: () => void,
    ) => () => void;
}

type AppStateViews = 'Swap' | 'Search';

type AppStateMobileViews = 'Swap' | 'Search' | 'Wallet';

type ModalNames =
    | 'SellNuggOrItemModal'
    | 'LoanInputModal'
    | 'LoanOrBurnModal'
    | 'OfferModal'
    | 'QrCodeModal'
    | 'MintModal';

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

type Modals = SellModal | OfferModal | LoanInputModal | LoanOrBurnModal | QrCodeModal | MintModal;

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

type MintModal = {
    name: 'MintModal';
    modalData?: ModalsData;
};

type Error = 'ERROR';
