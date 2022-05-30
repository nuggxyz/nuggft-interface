import React from 'react';

const SearchOverlay = React.lazy(() => import('@src/pages/search/SearchOverlay'));

export default React.memo(
    ({ isPhone }: { isPhone: boolean }) => {
        return !isPhone ? <SearchOverlay /> : null;
    },
    (prev, curr) => prev.isPhone === curr.isPhone,
);
