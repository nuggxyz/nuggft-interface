/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { createSelector } from 'reselect';
import { AnyAction, isPending, SliceCaseReducers, Slice } from '@reduxjs/toolkit';
import { useSelector } from 'react-redux';

import { isUndefinedOrNullOrObjectEmpty } from '@src/lib/index';

import store, { NLSelector } from './store';

/* eslint-disable react-hooks/rules-of-hooks */

// eslint-disable-next-line import/prefer-default-export
export class NLState<S> {
    // eslint-disable-next-line no-use-before-define
    protected static _instance: NLState<any>;

    private static _selectors: unknown;

    private static _dispatches: unknown;

    private _thactions: NL.Redux.Thactions;

    private _middlewares: NL.Redux.Middlewares;

    protected _hooks: Dictionary<NL.Redux.Hook>;

    protected _name: string;

    protected _initialState: S;

    protected _updater: NL.Redux.Updater;

    protected _slice: Slice<S, SliceCaseReducers<S>, string> | undefined;

    protected _isOwnFulfilledAction: (action: AnyAction, suffix: string) => boolean;

    protected constructor(
        name: string,
        updater: NL.Redux.Updater,
        middlewares: NL.Redux.Middlewares,
        thactions: NL.Redux.Thactions,
        hooks: Dictionary<NL.Redux.Hook>,
        initialState: S,
    ) {
        if (new.target === NLState) {
            throw new TypeError('Cannot construct Abstract instances directly');
        }
        this._middlewares = middlewares;
        this._thactions = thactions;
        this._name = name;
        this._hooks = hooks;
        this._initialState = initialState;
        this._updater = updater;

        this._isOwnFulfilledAction = (action: AnyAction, suffix: string): action is AnyAction =>
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            !NLState.isPendingAction(this._name)(action) &&
            // !NLState.isRejectedAction(this._name)(action) &&
            NLState.hasPrefix(action, this._name) &&
            NLState.hasSuffix(action, suffix);
    }

    static get instance() {
        if (this._instance === undefined) throw new Error('Should not reach here');
        return this._instance;
    }

    public static get nombre() {
        return this.instance._name;
    }

    public static get reducer() {
        if (this.instance._slice === undefined)
            throw new Error('NLState:reducer | this.instance._slice is undefined');
        return this.instance._slice.reducer;
    }

    public static get middlewares() {
        return Object.values(this.instance._middlewares);
    }

    public static get updater() {
        return this.instance._updater;
    }

    protected static get actions() {
        if (this.instance._slice === undefined)
            throw new Error('NLState:actions | this.instance._slice is undefined');
        return this.instance._slice.actions;
    }

    protected static get thactions() {
        return this.instance._thactions;
    }

    public static get hook() {
        return this.instance._hooks;
    }

    // @ts-ignore
    public static get select() {
        if (isUndefinedOrNullOrObjectEmpty(this._selectors)) {
            this._selectors = Object.keys(this.instance._initialState).reduce((selectors, key) => {
                // @ts-ignore
                // eslint-disable-next-line no-param-reassign
                selectors[key] = (eqFn?: (prev: any, cur: any) => boolean) =>
                    useSelector(
                        // @ts-ignore
                        createSelector(NLSelector, (s) => s[this.instance._name][key]),
                        eqFn,
                    );
                return selectors;
            }, {});
        }
        return this._selectors;
    }

    public static get dispatch() {
        if (isUndefinedOrNullOrObjectEmpty(this._dispatches)) {
            this._dispatches = [
                ...Object.entries(this.actions),
                ...Object.entries(this.thactions),
            ].reduce((dispatches, [name, action]) => {
                // @ts-ignore
                // eslint-disable-next-line no-param-reassign
                dispatches[name] = (value?: any) => store.dispatch(action(value));
                return dispatches;
            }, {});
        }
        return this._dispatches;
    }

    public static get isOwnFulfilledAction() {
        return this.instance._isOwnFulfilledAction;
    }

    public static hasPrefix = (action: AnyAction, prefix: string) => action.type.startsWith(prefix);

    public static hasSuffix = (action: AnyAction, suffix: string) => action.type.includes(suffix);

    public static isPending = (action: AnyAction) => action.type.endsWith('/pending');

    public static isFulfilled = (action: AnyAction) => action.type.endsWith('/fulfilled');

    public static isRejected = (action: AnyAction) => action.type.endsWith('/rejected');

    public static isPendingAction =
        (prefix: string) =>
        (action: AnyAction): action is AnyAction => {
            return this.hasPrefix(action, prefix) && isPending(action);
        };

    public static isRejectedAction =
        (prefix: string) =>
        (action: AnyAction): action is AnyAction => {
            return this.hasPrefix(action, prefix) && this.isRejected(action);
        };

    public static isFulfilledAction =
        (prefix: string) =>
        (action: AnyAction): action is AnyAction => {
            return this.hasPrefix(action, prefix) && this.isFulfilled(action);
        };
}
