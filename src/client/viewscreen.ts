/* eslint-disable no-param-reassign */
import create from 'zustand';
import { combine } from 'zustand/middleware';

const store = create(
    combine(
        {
            open: false,
            tokenId: undefined as TokenId | undefined,
        },
        (set) => {
            const closeViewScreen = () => {
                set(() => {
                    return {
                        open: false,
                        // tokenId: undefined,
                    };
                });
            };

            const updateViewScreen = (tokenId: TokenId) => {
                set(() => {
                    return {
                        tokenId,
                    };
                });

                return () => {
                    set(() => {
                        return {
                            open: true,
                        };
                    });
                };
            };

            const openViewScreen = (tokenId: TokenId) => {
                set(() => {
                    return {
                        open: true,
                        tokenId,
                    };
                });
            };

            return { closeViewScreen, openViewScreen, updateViewScreen };
        },
    ),
);

export type ViewScreenState = ReturnType<typeof store['getState']>;

export default {
    useViewScreenTokenId: () => store((state) => state.tokenId),

    useViewScreenOpen: () => store((state) => state.open),
    useOpenViewScreen: () => store((state) => state.openViewScreen),
    useUpdateViewScreen: () => store((state) => state.updateViewScreen),

    useCloseViewScreen: () => store((state) => state.closeViewScreen),
    ...store,
};
