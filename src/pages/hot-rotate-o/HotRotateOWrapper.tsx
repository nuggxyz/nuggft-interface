import React from 'react';

const HotRotateOController = React.lazy(() => import('./HotRotateO'));

const SwapPageWrapper = React.memo<{ screen: 'phone' | 'tablet' | 'desktop' }>(
    ({ screen }) => {
        return screen === 'phone' ? null : <HotRotateOController />;
    },
    (a, b) => a.screen === b.screen,
);

export default SwapPageWrapper;
