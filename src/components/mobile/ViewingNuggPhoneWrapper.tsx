import React from 'react';

import useMobileViewingNugg from '@src/client/hooks/useMobileViewingNugg';

const ViewingNuggPhone = React.lazy(() => import('./ViewingNuggPhone'));

const MemoizedViewingNuggPhone = React.memo(
	({ isPhone }: { isPhone: boolean }) => {
		const { tokenId } = useMobileViewingNugg();
		return isPhone ? <ViewingNuggPhone tokenId={tokenId} /> : null;
	},
	(prev, curr) => prev.isPhone === curr.isPhone,
);

export default MemoizedViewingNuggPhone;
