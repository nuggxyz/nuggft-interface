import { createDispatches } from '../helpers';

import TokenThactions from './thactions';

import TokenSlice from '.';

const TokenDispatches = createDispatches(TokenSlice.actions, TokenThactions);

export default TokenDispatches;
