import { createDispatches } from '../helpers';

import AppSlice from '.';

const AppDispatches = createDispatches(AppSlice.actions, {});

export default AppDispatches;
