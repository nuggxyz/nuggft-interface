import { PropsWithChildren, FC } from 'react';

export enum Page {
    Close,
    Start,
    Welcome,
}

export type NuggBookPage = FC<
    PropsWithChildren<{ setPage: (page: Page) => void; close: () => void }>
>;
