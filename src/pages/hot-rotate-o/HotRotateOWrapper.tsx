import React from 'react';

const MobileHotRotateOWrapper = React.lazy(() => import('./MobileHotRotateOWrapper'));
const HotRotateOController = React.lazy(() => import('./HotRotateO'));

const SwapPageWrapper = React.memo<{ screen: 'phone' | 'tablet' | 'desktop' }>(
    ({ screen }) => {
        return screen === 'phone' ? <MobileHotRotateOWrapper /> : <HotRotateOController />;
    },
    (a, b) => a.screen === b.screen,
);

export default SwapPageWrapper;
