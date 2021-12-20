import { createDispatches } from '../helpers';

import Web3Thactions from './thactions';

import Web3Slice from '.';

const Web3Dispatches = createDispatches(Web3Slice.actions, Web3Thactions);

export default Web3Dispatches;
