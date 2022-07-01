import React from 'react';
import '@src/emitter/workers/register';

const MobileSwapPage = React.lazy(() => import('@src/pages/mobile/MobileSwapPage'));
const SwapPageDesktopLarge = React.lazy(() => import('@src/pages/swap/SwapPageDesktopLarge'));
const SwapPageDesktopSmall = React.lazy(() => import('@src/pages/swap/SwapPageDesktopSmall'));

const SwapPageWrapper = React.memo<{ screen: 'phone' | 'tablet' | 'desktop' }>(
	({ screen }) => {
		return screen === 'phone' ? (
			<MobileSwapPage />
		) : screen === 'tablet' ? (
			<SwapPageDesktopSmall />
		) : (
			<SwapPageDesktopLarge />
		);
	},
	(a, b) => a.screen === b.screen,
);

export default SwapPageWrapper;
