/* eslint-disable no-param-reassign */
import create, { GetState, SetState, StoreApi } from 'zustand';
import { NamedSet } from 'zustand/middleware/devtools';

declare type Combine<T, U> = Omit<T, keyof U> & U;

export declare const combine: <PrimaryState extends object, SecondaryState extends object>(
    initialState: PrimaryState,
    create: (
        set: SetState<PrimaryState> & NamedSet<PrimaryState>,
        get: GetState<PrimaryState>,
        api: StoreApi<PrimaryState>,
    ) => SecondaryState,
) => (
    set: SetState<Combine<PrimaryState, SecondaryState>>,
    get: GetState<Combine<PrimaryState, SecondaryState>>,
    api: StoreApi<Combine<PrimaryState, SecondaryState>>,
) => Combine<PrimaryState, SecondaryState>;

const stateA = combine(
    {
        dataA: 0 as number,
    },
    (set) => {
        const closeDataA = () => {
            set((data) => {
                // @ts-ignore
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                data.stateB.dataB = -99;
                // @ts-ignore
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                // data.stateA.dataA = 0;
            });
        };

        const openDataA = (dataA: number) => {
            set(() => {
                return {
                    dataA,
                };
            });
        };

        return { closeDataA, openDataA };
    },
);

const stateB = combine(
    {
        dataB: '0' as string,
    },
    (set) => {
        const closeDataB = () => {
            set((data) => {
                // @ts-ignore
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                data.stateA.dataA = -98;
                // @ts-ignore
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                // data.dataB = -98;
            });
        };
        const openDataB = (dataB: string) => {
            set(() => {
                return {
                    dataB,
                };
            });
        };

        return { closeDataB, openDataB };
    },
);

type ab = ReturnType<typeof stateB> & ReturnType<typeof stateA>;

const states = { stateA, stateB };

// @ts-ignore
const c = create<ab>((...b) => {
    // @ts-ignore
    return Object.keys(states).reduce((prev, curr: keyof typeof states) => {
        // @ts-ignore
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        return { ...prev, [curr]: states[curr](...b) };
    }, {});
});

export const useCheckA = () =>
    c((state) => {
        console.log({ state });
        return state;
    });

export const useCloseB = () =>
    c((state) => {
        console.log('B');
        // @ts-ignore
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        return state.stateB.closeDataB as () => undefined;
    });

export const useCloseA = () =>
    c((state) => {
        console.log('A');
        // @ts-ignore
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        return state.stateA.closeDataA as () => undefined;
    });

// inside index.tsx
// const Hook = () => {
//     const closeB = useCloseB();
//     const closeA = useCloseA();

//     React.useEffect(() => {
//         closeB();
//         closeA();
//     }, []);

//     useCheckA();
//     // useCloseA()();

//     return null;
// };

// root.render(<Hook />);
