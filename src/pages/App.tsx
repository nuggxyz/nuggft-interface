import React from 'react';
import { Helmet } from 'react-helmet';
import { Navigate, Outlet } from 'react-router-dom';

import { useRoutes } from '@src/lib/router';
import client from '@src/client';
import ToastContainer from '@src/components/general/Toast/ToastContainer';
import useDimensions from '@src/client/hooks/useDimensions';
import NavigationWrapper from '@src/components/nugg/PageLayout/NavigationWrapper/NavigationWrapper';
import { ViewingNuggPhoneController } from '@src/components/mobile/ViewingNuggPhone';
import useMountLogger from '@src/hooks/useMountLogger';

import SearchOverlayWrapper from './search/SearchOverlayWrapper';

const MemoizedViewingNuggPhone = React.lazy(
	() => import('@src/components/mobile/ViewingNuggPhoneWrapper'),
);
const HotRotateO = React.lazy(() => import('@src/pages/hot-rotate-o/HotRotateOWrapper'));
const SwapPageWrapper = React.lazy(() => import('@src/pages/swap/SwapPageWrapper'));
const GlobalModal = React.lazy(() => import('@src/components/modals/GlobalModal'));

const Router = React.memo(() => {
	const [screen, isPhone] = useDimensions();

	const epoch = client.epoch.active.useId();
	useMountLogger('Router');

	const arr = React.useMemo(
		() => [
			{
				path: '/',
				element: <Outlet />,
				children: [
					{
						path: 'edit/:id',
						element: <HotRotateO screen={screen} />,
					},
					...(isPhone
						? []
						: [
								{
									path: 'view/*',
									element: <SearchOverlayWrapper isPhone={isPhone} />,
								},
						  ]),

					{
						path: 'swap/:id',
						element: isPhone ? <ViewingNuggPhoneController /> : null,
					},
					{ path: 'live', element: null },
					{
						path: '*',
						element: <Navigate to={!isPhone ? `swap/${epoch || ''}` : 'live'} />,
					},
				],
			},
		],
		[epoch, isPhone, screen],
	);

	const route = useRoutes(arr);

	return (
		<>
			<GlobalModal isPhone={isPhone} />
			{route}
			<MemoizedViewingNuggPhone isPhone={isPhone} />
		</>
	);
});

const App = () => {
	const [screen, isPhone] = useDimensions();
	useMountLogger('App');

	return (
		<>
			<ToastContainer />
			<Helmet />
			<NavigationWrapper isPhone={isPhone} />
			<Router />
			<SwapPageWrapper screen={screen} />
		</>
	);
};

export default React.memo(App);
