import { createSelectors } from '../helpers';

import AppInitialState from './initialState';

import { STATE_NAME } from '.';

const AppSelectors = createSelectors(AppInitialState, STATE_NAME);

export default AppSelectors;
