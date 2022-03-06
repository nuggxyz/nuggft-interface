import invariant from 'tiny-invariant';
import { createAsyncThunk } from '@reduxjs/toolkit';

import { isUndefinedOrNullOrNotObject, isUndefinedOrNullOrStringEmpty } from '@src/lib';
import { Chain } from '@src/web3/core/interfaces';

import pollOffersQuery from './queries/pollOffersQuery';

// const initSwap = createAsyncThunk<
//     {
//         success: NL.Redux.Swap.Success;
//         data: {
//             swap: NL.GraphQL.Fragments.Swap.Bare;
//             status: NL.Redux.Swap.Status;
//         };
//     },
//     { swapId: string; chainId: Chain },
//     { rejectValue: NL.Redux.Swap.Error; state: NL.Redux.RootState }
// >('swap/initSwap', async ({ swapId, chainId }, thunkAPI) => {
//     const currentEpoch = thunkAPI.getState().protocol.epoch;
//     try {
//         invariant(swapId, 'swap id passed as undefined');
//         const res = await initSwapQuery(chainId, swapId);
//         if (!isUndefinedOrNullOrObjectEmpty(res)) {
//             const status =
//                 res.endingEpoch === null
//                     ? 'waiting'
//                     : currentEpoch && +res.endingEpoch >= +currentEpoch.id
//                     ? 'ongoing'
//                     : 'over';
//             return {
//                 success: 'SUCCESS',
//                 data: { swap: res, status },
//             };
//         } else {
//             if (currentEpoch && !swapId.includes(currentEpoch.id)) {
//                 AppState.onRouteUpdate(chainId, '/');
//             }
//             return thunkAPI.rejectWithValue('UNKNOWN');
//         }
//     } catch (err) {
//         console.log({ err });
//         if (currentEpoch && !swapId.includes(currentEpoch.id)) {
//             AppState.onRouteUpdate(chainId, '/');
//         }
//         if (
//             !isUndefinedOrNullOrNotObject(err) &&
//             !isUndefinedOrNullOrNotObject(err.data) &&
//             !isUndefinedOrNullOrStringEmpty(err.data.message)
//         ) {
//             const code = err.data.message.replace(
//                 'execution reverted: ',
//                 '',
//             ) as NL.Redux.Token.Error;
//             return thunkAPI.rejectWithValue(code);
//         }
//         return thunkAPI.rejectWithValue('UNKNOWN');
//     }
// });

const pollOffers = createAsyncThunk<
    {
        success: NL.Redux.Swap.Success;
        data: { offers: NL.GraphQL.Fragments.Offer.Bare[]; swapId: string };
    },
    { swapId: string; chainId: Chain },
    { rejectValue: NL.Redux.Swap.Error; state: NL.Redux.RootState }
>('swap/pollOffers', async ({ chainId, swapId }, thunkAPI) => {
    try {
        invariant(swapId, 'swap id passed as undefined');
        let res = await pollOffersQuery(chainId, swapId);
        return {
            success: 'SUCCESS',
            data: { offers: res, swapId },
        };
    } catch (err) {
        console.log({ err });
        if (
            !isUndefinedOrNullOrNotObject(err) &&
            !isUndefinedOrNullOrNotObject(err.data) &&
            !isUndefinedOrNullOrStringEmpty(err.data.message)
        ) {
            const code = err.data.message.replace(
                'execution reverted: ',
                '',
            ) as NL.Redux.Swap.Error;
            return thunkAPI.rejectWithValue(code);
        }
        return thunkAPI.rejectWithValue('UNKNOWN');
    }
});

export default {
    pollOffers,
};
