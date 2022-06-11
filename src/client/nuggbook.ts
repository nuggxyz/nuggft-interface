/* eslint-disable no-param-reassign */
import create from 'zustand';
import { combine, persist } from 'zustand/middleware';

import { Page } from '@src/interfaces/nuggbook';

const useStore = create(
    persist(
        combine(
            {
                page: Page.Start,
                init: false,
                open: false,
                direction: true,
                visits: {} as { [i in Page]: boolean },
            },
            (set, get) => {
                const visit = (p: Page) => {
                    // @ts-ignore
                    set((draft) => {
                        draft.visits[p] = true;
                    });
                };

                const checkInit = () => {
                    if (!get().init) {
                        setTimeout(() => {
                            set(() => ({
                                open: true,
                            }));
                        }, 3000);
                    } else {
                        set(() => ({
                            open: false,
                        }));
                    }
                };

                const setInit = () => {
                    set(() => ({
                        open: true,
                    }));
                };

                const toggle = (page?: Page) => {
                    const { open, page: pager } = get();

                    if (pager === null) {
                        page = Page.TableOfContents;
                    }

                    set(() => {
                        return {
                            ...(page && { page }),
                            init: true,

                            open: !open,
                            height: null,
                        };
                    });
                };

                const goto = (page?: Page, direction?: boolean) => {
                    set(() => {
                        return {
                            ...(page && { page }),
                            ...(direction !== undefined && { direction }),

                            height: null,
                            init: true,
                        };
                    });
                };

                const gotoHeight = (page?: Page, height?: number) => {
                    set(() => {
                        return {
                            ...(page && { page }),
                            ...(height && { height }),
                            init: true,
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

                return { goto, visit, toggle, gotoOpen, close, gotoHeight, checkInit, setInit };
            },
        ),
        { name: 'nugg.xyz-nuggbook' },
    ),
);

useStore.getState().checkInit();

export default {
    useNuggBookPage: () => useStore((state) => state.page),
    useOpenNuggBook: () => useStore((state) => state.goto),
    useVisits: () => useStore((state) => state.visits),
    useSetVisit: () => useStore((state) => state.visit),
    useOpen: () => useStore((state) => state.open),
    useDirection: () => useStore((state) => state.direction),

    useGotoHeight: () => useStore((state) => state.gotoHeight),
    useGotoOpen: () => useStore((state) => state.gotoOpen),
    useToggle: () => useStore((state) => state.toggle),
    useSetInit: () => useStore((state) => state.setInit),
    useGoto: () => useStore((state) => state.goto),
    useCloseNuggBook: () => useStore((state) => state.close),
    ...useStore,
};
