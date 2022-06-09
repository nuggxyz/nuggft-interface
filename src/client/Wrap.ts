/* eslint-disable max-classes-per-file */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-var */
/* eslint-disable no-param-reassign */
import create, { StateCreator } from 'zustand';

export class Wrap {
    public static stores: { store: StateCreator<any, [], [], any> }[] = [];

    // @ts-ignore
    declare static add: typeof create;

    // @ts-ignore
    public static _inst: ReturnType<typeof this.add>;

    private static TOTAL = 12;

    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-dupe-class-members
    public static add(arg) {
        // @ts-ignore
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        this.stores.push({ store: arg });

        // @ts-ignore
        // eslint-disable-next-line
        return () => {
            // @ts-ignore
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            return this;
        };
    }

    public static get default() {
        if (this._inst === undefined) {
            console.log('BUILLLDDDDDDD');

            this.build();
        }
        return this._inst;
    }

    public static build() {
        // @ts-ignore
        this._inst = create((...b) => {
            return this.stores.reduce((prev, curr) => {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                return { ...prev, ...curr.store(...b) };
            }, {});
        });
    }
}
