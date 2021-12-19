declare namespace NL.Redux.Web3 {
    interface State {
        web3address: string;
        web3status: Web3Status;
        web3error: boolean;
        implements3085: boolean;
        connectivityWarning: boolean;
        error?: Error;
        success?: Success;
    }

    type Web3Status = 'NOT_SELECTED' | 'PENDING' | 'SELECTED' | 'ERROR';
    type Error = 'ERROR';
    type Success = 'Success';
    type AddressMap = { [chainId: number]: string };

    interface WalletInfo {
        connector?: import('@web3-react/abstract-connector').AbstractConnector;
        name: string;
        iconURL: string;
        description: string;
        href: string | null;
        color: string;
        primary?: true;
        mobile?: true;
        mobileOnly?: true;
    }
    interface L1ChainInfo {
        readonly blockWaitMsBeforeWarning?: number;
        readonly docs: string;
        readonly explorer: string;
        readonly infoLink: string;
        readonly label: string;
        readonly logoUrl?: string;
        readonly rpcUrls?: string[];
        readonly nativeCurrency: {
            name: string; // 'Goerli ETH',
            symbol: string; // 'gorETH',
            decimals: number; //18,
        };
    }
}
