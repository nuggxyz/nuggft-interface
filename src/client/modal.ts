/* eslint-disable no-param-reassign */
import create from 'zustand';
import { combine } from 'zustand/middleware';

import { ModalType } from '@src/interfaces/modals';

const store = create(
    combine(
        {
            data: undefined as ModalType | undefined,
            open: false,
        },
        (set) => {
            const openModal = (modalData: ModalType | undefined) => {
                set(() => {
                    return {
                        data: modalData,
                        open: true,
                    };
                });
            };

            const closeModal = () => {
                set((state) => {
                    state.open = false;
                    return {
                        ...state,
                        open: false,
                    };
                });
            };

            return { openModal, closeModal };
        },
    ),
);

export type ModalState = ReturnType<typeof store['getState']>;

export default {
    useData: () => store((state) => state.data),
    useOpen: () => store((state) => state.open),
    useOpenModal: () => store((state) => state.openModal),
    useCloseModal: () => store((state) => state.closeModal),
    ...store,
};
