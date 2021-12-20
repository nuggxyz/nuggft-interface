import { createSelectors } from '../helpers';

import NuggDexInitialState from './initialState';

import { STATE_NAME } from '.';

const NuggDexSelectors = createSelectors(NuggDexInitialState, STATE_NAME);

export default NuggDexSelectors;
