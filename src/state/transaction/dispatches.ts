import { createDispatches } from '../helpers';

import TransactionSlice from '.';

const TransactionDispatches = createDispatches(TransactionSlice.actions, {});

export default TransactionDispatches;
