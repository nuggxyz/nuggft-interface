import { createSelectors } from '../helpers';

import ProtocolInitialState from './initialState';

import { STATE_NAME } from '.';

const ProtocolSelectors = createSelectors(ProtocolInitialState, STATE_NAME);

export default ProtocolSelectors;
