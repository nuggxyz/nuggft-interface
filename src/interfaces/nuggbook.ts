import { PropsWithChildren, FC } from 'react';

export enum Page {
    Start,
    Welcome,
    TableOfContents,
    WhatIsAWallet,
    WhatIsAnNFT,
    WhatIsDefi,
    TheRundown,
    Setup_0,
    Setup_1,
    Setup_2,
    Setup_3,
    Status,
    HelpingTest_0,
    Feedback,
}

export type NuggBookPageProps = {
    setPage: (page: Page, direction?: boolean) => void;
    close: () => void;
    clear: () => void;
};

export type NuggBookPage = FC<PropsWithChildren<NuggBookPageProps>>;
