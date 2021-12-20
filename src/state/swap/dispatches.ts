import { createDispatches } from '../helpers';

import SwapThactions from './thactions';

import SwapSlice from '.';

const SwapDispatches = createDispatches(SwapSlice.actions, SwapThactions);

export default SwapDispatches;
