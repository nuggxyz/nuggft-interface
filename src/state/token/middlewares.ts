import { PayloadAction } from '@reduxjs/toolkit';

import { isUndefinedOrNullOrObjectEmpty } from '../../lib';
import AppState from '../app';

import nuggThumbnailQuery from './queries/nuggThumbnailQuery';

import TokenState from '.';

const onTokenSet: NL.Redux.Middleware<
    Record<string, unknown>,
    NL.Redux.RootState,
    NL.Redux.Dispatch<any>
> =
    ({ getState }) =>
    (next) =>
    async (action: PayloadAction<any>) => {
        const go = next(action);
        if (TokenState.isOwnFulfilledAction(action, 'setTokenFromThumbnail')) {
            TokenState.dispatch.getSwapHistory({ tokenId: action.payload.id });
            AppState.dispatch.silentlySetRoute(`#/nugg/${action.payload.id}`);
        } else if (TokenState.isOwnFulfilledAction(action, 'setTokenFromId')) {
            const thumbnail = await nuggThumbnailQuery(action.payload);
            if (!isUndefinedOrNullOrObjectEmpty(thumbnail)) {
                TokenState.dispatch.setTokenFromThumbnail(thumbnail);
            }
        }
        return go;
    };

export default { onTokenSet };
