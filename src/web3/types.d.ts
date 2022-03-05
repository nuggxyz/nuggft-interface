declare namespace NL.Web3 {
    interface State {
        // web3address: string;
        // web3error: boolean;
        // implements3085: boolean;
        // connectivityWarning: boolean;
        // error?: Error;
        // success?: Success;
        // currentChain: import('./config').Chain;
    }

    type Error = 'ERROR';
    type Success = 'Success';
    type AddressMap = { [chainId: number]: string };

    interface WalletInfo {
        name: string;
        label: string;
        description: string;
        href: string | null;
        color: string;
        primary?: true;
        mobile?: true;
        mobileOnly?: true;
        peerName?: string;
        peerurl?: string;
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
