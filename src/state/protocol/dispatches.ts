import { createDispatches } from '../helpers';

import ProtocolThactions from './thactions';

import ProtocolSlice from '.';

const ProtocolDispatches = createDispatches(
    ProtocolSlice.actions,
    ProtocolThactions,
);

export default ProtocolDispatches;
