/* eslint-disable no-param-reassign */
import create from 'zustand';
import { combine } from 'zustand/middleware';

import { Page } from '@src/interfaces/nuggbook';

const store = create(
    combine(
        {
            page: Page.Close,
        },
        (set) => {
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

            return { closeNuggBook, openNuggBook };
        },
    ),
);

export type NuggBookState = ReturnType<typeof store['getState']>;

export default {
    useNuggBookPage: () => store((state) => state.page),
    useOpenNuggBook: () => store((state) => state.openNuggBook),

    useCloseNuggBook: () => store((state) => state.closeNuggBook),
    ...store,
};
