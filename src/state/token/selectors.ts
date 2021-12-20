import { createSelectors } from '../helpers';

import TokenInitialState from './initialState';

import { STATE_NAME } from '.';

const TokenSelectors = createSelectors(TokenInitialState, STATE_NAME);

export default TokenSelectors;
