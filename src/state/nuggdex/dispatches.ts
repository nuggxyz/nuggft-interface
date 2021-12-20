import { createDispatches } from '../helpers';

import NuggDexThactions from './thactions';

import NuggDexSlice from '.';

const NuggDexDispatches = createDispatches(
    NuggDexSlice.actions,
    NuggDexThactions,
);

export default NuggDexDispatches;
