/* eslint-disable no-param-reassign */
import create from 'zustand';
import { combine, persist } from 'zustand/middleware';

import { Page } from '@src/interfaces/nuggbook';

const useStore = create(
    persist(
        combine(
            {
                page: Page.Start,
                open: true,
                height: 300 as number | null,
                visits: {
                    [Page.Start]: false,
                    [Page.Welcome]: false,
                    [Page.TableOfContents]: false,
                    // [Page.Close]: false,
                    [Page.WhatIsAWallet]: false,
                    [Page.WhatIsAnNFT]: false,
                    [Page.WhatIsDefi]: false,
                } as { [i in Page]: boolean },
            },
            (set, get) => {
                const visit = (p: Page) => {
                    // @ts-ignore
                    set((draft) => {
                        draft.visits[p] = true;
                    });
                };

                const toggle = (page?: Page) => {
                    const { open } = get();

                    set(() => {
                        return {
                            ...(page && { page }),

                            open: !open,
                            height: null,
                        };
                    });
                };

                const goto = (page?: Page) => {
                    set(() => {
                        return {
                            ...(page && { page }),
                            height: null,
                        };
                    });
                };

                const gotoHeight = (page?: Page, height?: number) => {
                    set(() => {
                        return {
                            ...(page && { page }),
                            ...(height && { height }),
                        };
                    });
                };

                const gotoOpen = (page?: Page) => {
                    const { open } = get();

                    if (!open) toggle();

                    goto(page);
                };

                const close = () => {
                    const { open } = get();

                    if (open) toggle();
                };

                return { goto, visit, toggle, gotoOpen, close, gotoHeight };
            },
        ),
        { name: 'nugg.xyz-nuggbook' },
    ),
);

export type NuggBookState = ReturnType<typeof useStore['getState']>;

export default {
    useNuggBookPage: () => useStore((state) => state.page),
    useOpenNuggBook: () => useStore((state) => state.goto),
    useVisits: () => useStore((state) => state.visits),
    useSetVisit: () => useStore((state) => state.visit),
    useOpen: () => useStore((state) => state.open),
    useGotoHeight: () => useStore((state) => state.gotoHeight),

    useGotoOpen: () => useStore((state) => state.gotoOpen),
    useToggle: () => useStore((state) => state.toggle),
    useHeight: () => useStore((state) => state.height),

    useGoto: () => useStore((state) => state.goto),
    useCloseNuggBook: () => useStore((state) => state.close),
    ...useStore,
};
