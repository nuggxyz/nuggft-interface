import { createDispatches } from '../helpers';

import WalletThactions from './thactions';

import WalletSlice from '.';

let _dispatches;

const WalletDispatches = createDispatches(WalletSlice.actions, WalletThactions);

export default WalletDispatches;
