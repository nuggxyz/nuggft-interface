/* eslint-disable no-param-reassign */
import React from 'react';
import create from 'zustand';
import { combine } from 'zustand/middleware';

import usePrevious from '@src/hooks/usePrevious';
import emitter from '@src/emitter';

const useStore = create(
    combine(
        {
            visualViewport: {
                height: window.visualViewport.height,
                width: window.visualViewport.width,
                offsetTop: window.visualViewport.offsetTop,
                pageTop: window.visualViewport.pageTop,
            },
        },
        (set) => {
            const resize = () => {
                document.documentElement.style.setProperty(
                    '--window-inner-height',
                    `${window.innerHeight}px`,
                );
                set(() => {
                    return {
                        visualViewport: {
                            height: window.visualViewport.height,
                            width: window.visualViewport.width,
                            offsetTop: window.visualViewport.offsetTop,
                            pageTop: window.visualViewport.pageTop,
                        },
                    };
                });
            };

            const onClose = () => {
                window.visualViewport.onresize = () => undefined;
            };
            const onMount = () => {
                window.visualViewport.onresize = resize;

                return onClose;
            };

            return { onMount };
        },
    ),
);

export type EditScreenState = ReturnType<typeof useStore['getState']>;

export const useVisualViewportUpdater = () => {
    const callback = useStore((state) => state.onMount);
    React.useEffect(callback, [callback]);
    return null;
};

export const useEmitOnKeyboardClose = () => {
    const vp = useStore((state) => state.visualViewport.height);
    const prev = usePrevious(vp);

    React.useEffect(() => {
        if (prev && prev * 1.25 < vp) {
            emitter.emit({ type: emitter.events.KeyboardClosed });
        }
    }, [prev, vp]);

    return null;
};

export default {
    useVisualViewport: () => useStore((state) => state.visualViewport),
    ...useStore,
};
