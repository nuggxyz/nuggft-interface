import { createSelectors } from '../helpers';

import TransactionInitialState from './initialState';

import { STATE_NAME } from '.';

const TransactionsSelectors = createSelectors(
    TransactionInitialState,
    STATE_NAME,
);

export default TransactionsSelectors;
