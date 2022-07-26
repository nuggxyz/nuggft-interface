import { useEffect } from 'react';

import { Theme } from '@src/client/interfaces';

// eslint-disable-next-line import/no-cycle
import client from '..';

const useMediaUpdater = () => {
	const updateMediaDarkMode = client.mutate.updateMediaDarkMode();

	// keep dark mode in sync with the system
	useEffect(() => {
		const darkHandler = (match: MediaQueryListEvent) => {
			updateMediaDarkMode(match.matches ? Theme.DARK : undefined);
		};

		const match = window?.matchMedia('(prefers-color-scheme: dark)');
		updateMediaDarkMode(match.matches ? Theme.DARK : undefined);

		if (match?.addListener) {
			match?.addListener(darkHandler);
		} else if (match?.addEventListener) {
			match?.addEventListener('change', darkHandler);
		}

		return () => {
			if (match?.removeListener) {
				match?.removeListener(darkHandler);
			} else if (match?.removeEventListener) {
				match?.removeEventListener('change', darkHandler);
			}
		};
	}, [updateMediaDarkMode]);
};

export default useMediaUpdater;
