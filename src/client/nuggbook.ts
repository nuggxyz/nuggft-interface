/* eslint-disable no-param-reassign */
import create from 'zustand';
import { combine } from 'zustand/middleware';

import { Page } from '@src/interfaces/nuggbook';

const store = create(
    combine(
        {
            page: Page.Start,
        },
        (set) => {
            const openNuggBookStart = () => {
                set(() => {
                    return {
                        page: Page.Start,
                    };
                });
            };

            const openNuggBookMain = () => {
                set(() => {
                    return {
                        page: Page.Welcome,
                    };
                });
            };

            const closeNuggBook = () => {
                set(() => {
                    return {
                        page: Page.Close,
                    };
                });
            };

            const setNuggBookPage = (page: Page) => {
                set(() => {
                    return {
                        page,
                    };
                });
            };

            return { openNuggBookMain, closeNuggBook, openNuggBookStart, setNuggBookPage };
        },
    ),
);

export type NuggBookState = ReturnType<typeof store['getState']>;

export default {
    useNuggBookPage: () => store((state) => state.page),
    useOpenNuggBookMain: () => store((state) => state.openNuggBookMain),
    useOpenNuggBookStart: () => store((state) => state.openNuggBookStart),
    useSetNuggBookPage: () => store((state) => state.setNuggBookPage),

    useCloseNuggBook: () => store((state) => state.closeNuggBook),
    ...store,
};
