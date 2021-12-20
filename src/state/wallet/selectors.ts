import { createSelectors } from '../helpers';

import WalletInitialState from './initialState';

import { STATE_NAME } from '.';

const WalletSelectors = createSelectors(WalletInitialState, STATE_NAME);

export default WalletSelectors;
