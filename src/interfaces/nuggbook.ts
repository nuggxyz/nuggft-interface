import { PropsWithChildren, FC } from 'react';

export enum Page {
    Close,
    Start,
    Welcome,
    TableOfContents,
    WhatIsAWallet,
    WhatIsAnNFT,
    WhatIsDefi,
    TheRundown,
    SetUpAWallet,
}

export type NuggBookPageProps = {
    setPage: (page: Page) => void;
    close: () => void;
    clear: () => void;
};

export type NuggBookPage = FC<PropsWithChildren<NuggBookPageProps>>;
