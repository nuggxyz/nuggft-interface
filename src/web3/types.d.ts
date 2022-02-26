declare namespace NL.Redux.Web32 {
    interface State {
        // web3address: string;
        // web3error: boolean;
        // implements3085: boolean;
        // connectivityWarning: boolean;
        // error?: Error;
        // success?: Success;
        // currentChain: import('./config').SupportedChainId;
    }

    type Error = 'ERROR';
    type Success = 'Success';
    type AddressMap = { [chainId: number]: string };

    interface WalletInfo {
        connector?: import('./core/core').ResWithStore<T>;

        name: string;
        iconURL: string;
        description: string;
        href: string | null;
        color: string;
        primary?: true;
        mobile?: true;
        mobileOnly?: true;
    }
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
    readonly name: string;
}
