/* eslint-disable no-param-reassign */
import create from 'zustand';
import { combine } from 'zustand/middleware';

import { ModalType } from '@src/interfaces/modals';

const store = create(
    combine(
        {
            data: undefined as ModalType | undefined,
            phase: 0 as number,
            open: false,
        },
        (set) => {
            const openModal = (modalData: ModalType | undefined, phase = 0, lock = false) => {
                set(() => {
                    if (lock) document.documentElement.classList.add('is-locked');
                    window.onscroll = () => window.scroll({ behavior: 'smooth', top: 0 });

                    return {
                        data: modalData,
                        open: true,
                        phase,
                    };
                });
            };

            const updatePhase = (input: number) => {
                set((draft) => {
                    draft.phase = input;
                    return draft;
                });
            };

            const closeModal = () => {
                document.documentElement.classList.remove('is-locked');
                window.onscroll = () => undefined;
                set((draft) => {
                    draft.open = false;
                    return {
                        ...draft,
                        open: false,
                    };
                });
            };

            return { openModal, closeModal, updatePhase };
        },
    ),
);

export const useCloseModalOnKeyboardClose = () => {
    // const close = store((state) => state.closeModal);
    // emitter.useOn({
    //     type: emitter.events.KeyboardClosed,
    //     callback: React.useCallback(close, [close]),
    // });

    return null;
};

export default {
    usePhase: (): [number, (input: number) => void] =>
        store((state) => [state.phase, state.updatePhase]),

    useData: () => store((state) => state.data),
    useOpen: () => store((state) => state.open),
    useOpenModal: () => store((state) => state.openModal),
    useCloseModal: () => store((state) => state.closeModal),
    ...store,
};
