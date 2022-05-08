/* eslint-disable no-param-reassign */
import create from 'zustand';
import { combine, persist } from 'zustand/middleware';

import { Page } from '@src/interfaces/nuggbook';

const useStore = create(
    persist(
        combine(
            {
                page: Page.Close,
                visits: {
                    [Page.Start]: false,
                    [Page.Welcome]: false,
                    [Page.TableOfContents]: false,
                    [Page.Close]: false,
                    [Page.WhatIsAWallet]: false,
                    [Page.WhatIsAnNFT]: false,
                    [Page.WhatIsDefi]: false,
                } as { [i in Page]: boolean },
            },
            (set) => {
                const setVisit = (p: Page) => {
                    set((data) => {
                        data.visits[p] = true;
                    });
                };

                const closeNuggBook = () => {
                    set(() => {
                        return {
                            page: Page.Close,
                        };
                    });
                };

                const openNuggBook = (page: Page) => {
                    set(() => {
                        return {
                            page,
                        };
                    });
                };

                return { closeNuggBook, openNuggBook, setVisit };
            },
        ),
        { name: 'nugg.xyz-nuggbook' },
    ),
);

export type NuggBookState = ReturnType<typeof useStore['getState']>;

export default {
    useNuggBookPage: () => useStore((state) => state.page),
    useOpenNuggBook: () => useStore((state) => state.openNuggBook),
    useVisits: () => useStore((state) => state.visits),
    useSetVisit: () => useStore((state) => state.setVisit),

    useCloseNuggBook: () => useStore((state) => state.closeNuggBook),
    ...useStore,
};
