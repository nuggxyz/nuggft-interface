import { createSelectors } from '../helpers';

import SwapInitialState from './initialState';

import { STATE_NAME } from '.';

const SwapSelectors = createSelectors(SwapInitialState, STATE_NAME);

export default SwapSelectors;
