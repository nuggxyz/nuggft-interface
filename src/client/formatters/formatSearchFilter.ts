import { t } from '@lingui/macro';

import { SearchView } from '@src/client/interfaces';

// this is in place of a string enum to allow for i18n
export default (value: SearchView): string => {
	switch (value) {
		case SearchView.AllNuggs: {
			return t`All Nuggs`;
		}
		case SearchView.AllItems:
			return t`All Items`;
		case SearchView.Pending:
			return t`Pending Auctions`;
		case SearchView.OnSale:
			return t`On Sale`;
		default: {
			return 'Search Results';
		}
	}
};
