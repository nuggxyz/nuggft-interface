import { PayloadAction } from '@reduxjs/toolkit';

import { isUndefinedOrNullOrObjectEmpty } from '../../lib';
import AppState from '../app';
import { hasSuffix } from '../helpers';

import nuggThumbnailQuery from './queries/nuggThumbnailQuery';
import TokenDispatches from './dispatches';

const onTokenSet: NL.Redux.Middleware<
    Record<string, unknown>,
    NL.Redux.RootState,
    NL.Redux.Dispatch<any>
> =
    ({ getState }) =>
    (next) =>
    async (action: PayloadAction<any>) => {
        const go = next(action);
        if (hasSuffix(action, 'setTokenFromThumbnail')) {
            TokenDispatches.getSwapHistory({ tokenId: action.payload.id });
            AppState.silentlySetRoute(`#/nugg/${action.payload.id}`);
        } else if (hasSuffix(action, 'setTokenFromId')) {
            const thumbnail = await nuggThumbnailQuery(action.payload);
            if (!isUndefinedOrNullOrObjectEmpty(thumbnail)) {
                TokenDispatches.setTokenFromThumbnail(thumbnail);
            }
        }
        return go;
    };

const TokenMiddlewares = { onTokenSet };

export default TokenMiddlewares;
