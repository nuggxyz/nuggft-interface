import { PropsWithChildren, FC } from 'react';

export enum Page {
    Close,
    Start,
    Welcome,
    TableOfContents,
    WhatIsAWallet,
    WhatIsAnNFT,
    WhatIsDefi,
}

export const initialNuggBookLocalStorage: { [i in Page]: boolean } = {
    [Page.Start]: false,
    [Page.Welcome]: false,
    [Page.TableOfContents]: false,
    [Page.Close]: false,
    [Page.WhatIsAWallet]: false,
    [Page.WhatIsAnNFT]: false,
    [Page.WhatIsDefi]: false,
};

export type NuggBookPageProps = {
    visits: typeof initialNuggBookLocalStorage;
    setPage: (page: Page) => void;
    close: () => void;
    clear: () => void;
};

export type NuggBookPage = FC<PropsWithChildren<NuggBookPageProps>>;
