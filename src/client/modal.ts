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
                    document.documentElement.classList.add('is-locked');
                    window.onscroll = () => window.scroll({ behavior: 'smooth', top: 0 });

                    return {
                        data: modalData,
                        open: true,
                    };
                });
            };

            const closeModal = () => {
                document.documentElement.classList.remove('is-locked');
                window.onscroll = () => undefined;
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

export const useCloseModalOnKeyboardClose = () => {
    // const close = store((state) => state.closeModal);
    // emitter.on({
    //     type: emitter.events.KeyboardClosed,
    //     callback: React.useCallback(close, [close]),
    // });

    return null;
};

export default {
    useData: () => store((state) => state.data),
    useOpen: () => store((state) => state.open),
    useOpenModal: () => store((state) => state.openModal),
    useCloseModal: () => store((state) => state.closeModal),
    ...store,
};
