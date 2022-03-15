export class timer {
    private _start: Date | undefined;

    private _end: Date | undefined;

    private _name: string | undefined;

    private static _map: Dictionary<timer> = {};

    private constructor() {}

    public static start(name: string) {
        const me = new timer();
        me._start = new Date();
        me._name = name;
        timer._map[name] = me;
    }

    public static stop(name: string) {
        const me = timer._map[name];
        me._end = new Date();
        me.calc();
        delete timer._map[name];
    }

    private calc() {
        const dtime = this._end!.getMilliseconds() - this._start!.getMilliseconds();
        console.info(`Execution time for ${this._name}: %dms`, dtime);
    }
}
