/// <reference types="node" />
/// <reference types="react" />
/// <reference types="react-dom" />

declare namespace NodeJS {
    interface ProcessEnv {
        readonly NODE_ENV: 'development' | 'production' | 'test';
        readonly PUBLIC_URL: string;
    }
}

declare module '*.avif' {
    const src: string;
    export default src;
}

declare module '*.bmp' {
    const src: string;
    export default src;
}

declare module '*.gif' {
    const src: string;
    export default src;
}

declare module '*.jpg' {
    const src: string;
    export default src;
}

declare module '*.jpeg' {
    const src: string;
    export default src;
}

declare module '*.png' {
    const src: string;
    export default src;
}

declare module '*.webp' {
    const src: string;
    export default src;
}

declare module '*.svg' {
    import * as React from 'react';

    export const ReactComponent: React.FunctionComponent<
        React.SVGProps<SVGSVGElement> & { title?: string }
    >;

    const src: string;
    export default src;
}

declare module '*.module.css' {
    const classes: { readonly [key: string]: string };
    export default classes;
}

declare module '*.module.scss' {
    const classes: { readonly [key: string]: string };
    export default classes;
}

declare module '*.module.sass' {
    const classes: { readonly [key: string]: string };
    export default classes;
}

declare module '*.svg' {
    const content: React.ReactSVG;
    export default content;
}

interface Window {
    ethereum?: {
        isMetaMask?: true;
        on?: (...args: any[]) => void;
        removeListener?: (...args: any[]) => void;
        autoRefreshOnNetworkChange?: boolean;
        enable?: () => void;
        request?: (...args: any[]) => Promise<any>;
        _state?: {
            initialized: boolean;
            isConnected: boolean;
            isUnlocked: boolean;
            isPermanentlyDisconnected: boolean;
            accounts: string[];
        };
        selectedProvider?: {
            selectedAddress: string;
        };
        selectedAddress?: string;
    };
    web3?: Record<string, unknown>;
    __APOLLO_CLIENT__?: any;
}

interface Array<T> {
    first(count?: number): Array<T>;
    last(count?: number): Array<T>;
    insert<U extends { index: number }>(element: U): Array<U>;
    toggle<U>(element: U, field?: keyof U);
    remove<U extends { index: number }>(element: U): Array<U>;
    replace<U extends { id: string } | object>(element: U, field?: keyof U): Array<U>;
    smartInsert<U>(element: U, field?: keyof U): Array<U>;
}

namespace NL {
    type Address = import('./classes/Address').Address;
    type AddressSigner = import('./classes/Address').AddressSigner;
    type EthInt = import('./classes/Fraction').EthInt;
    type PairInt = import('./classes/Fraction').PairInt;

    type Fraction = import('./classes/Fraction').Fraction;
    type Fraction2x96 = import('./classes/Fraction').Fraction2x96;
    type Fraction2x128 = import('./classes/Fraction').Fraction2x128;

    type Fractionish = import('./classes/Fraction').Fractionish;
    type BigNumber = import('ethers').BigNumber;
    type BigNumberish = import('ethers').BigNumberish;

    enum Currency {
        ETH = 0,
        WETH = 1,
        xNUGG = 2,
    }

    type TransactionResponse = import('@ethersproject/providers').TransactionResponse;

    type TransactionReceipt = import('@ethersproject/providers').TransactionReceipt;
}
