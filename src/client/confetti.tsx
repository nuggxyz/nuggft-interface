/* eslint-disable no-param-reassign */
import React, { CSSProperties } from 'react';
import Confetti from 'react-confetti';
import create from 'zustand';
import { combine } from 'zustand/middleware';

const useStore = create(
    combine(
        {
            on: false,
            destroy: true,
        },
        (set) => {
            const triggerDatShit = (life = 5000, death = 10000) => {
                set(() => {
                    return {
                        on: true,
                        destroy: false,
                    };
                });

                setTimeout(() => {
                    set(() => {
                        return {
                            on: false,
                        };
                    });

                    setTimeout(() => {
                        set(() => {
                            return {
                                destroy: true,
                            };
                        });
                    }, death);
                }, life);
            };

            return { triggerDatShit };
        },
    ),
);

const useMe = (style: CSSProperties) => {
    const on = useStore((data) => data.on);
    const destroy = useStore((data) => data.destroy);

    return React.useMemo(() => {
        return destroy ? null : (
            <Confetti
                wind={0.02}
                numberOfPieces={50}
                run={on}
                style={{
                    ...style,
                }}
            />
        );
    }, [on, destroy, style]);
};

export default {
    useTrigger: () => useStore((data) => data.triggerDatShit),
    useMe,
};
