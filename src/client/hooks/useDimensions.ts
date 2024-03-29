import { useMemo } from 'react';

import client from '@src/client';

export default () => {
	const dim = client.live.dimensions();

	const [screen, isPhone] = useMemo(() => {
		const res =
			dim.width > 1300
				? ('desktop' as const)
				: dim.width > 750
				? ('tablet' as const)
				: ('phone' as const);

		return [res, res === 'phone'] as const;
	}, [dim]);

	return [screen, isPhone, dim] as const;
};
