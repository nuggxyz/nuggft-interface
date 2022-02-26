export class timer {
    private _start: Date;

    private _end: Date;

    private _name: string;

    private static _map: Dictionary<timer> = {};

    private constructor() {}

    public static start(name: string) {
        let me = new timer();
        me._start = new Date();
        me._name = name;
        timer._map[name] = me;
    }

    public static stop(name: string) {
        let me = timer._map[name];
        me._end = new Date();
        me.calc();
        delete timer._map[name];
    }

    private calc() {
        const dtime = this._end.getMilliseconds() - this._start.getMilliseconds();
        console.info(`Execution time for ${this._name}: %dms`, dtime);
    }
}
