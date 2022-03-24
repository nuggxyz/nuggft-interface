import { t } from '@lingui/macro';

import { SearchView } from '@src/client/interfaces';

export default (value: SearchView): string => {
    switch (value) {
        case SearchView.AllNuggs: {
            return t`All Nuggs`;
        }
        default: {
            return 'All Nuggs';
        }
    }
};
