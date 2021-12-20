import { createSelectors } from '../helpers';

import Web3InitialState from './initialState';

import { STATE_NAME } from '.';

const Web3Selectors = createSelectors(Web3InitialState, STATE_NAME);

export default Web3Selectors;
