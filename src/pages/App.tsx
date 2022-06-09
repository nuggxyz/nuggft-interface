import React from 'react';
import { Helmet } from 'react-helmet';
import { Navigate, Outlet } from 'react-router-dom';

import { useRoutes } from '@src/lib/router';
import client from '@src/client';
import ToastContainer from '@src/components/general/Toast/ToastContainer';
import useDimensions from '@src/client/hooks/useDimensions';
import NavigationWrapper from '@src/components/nugg/PageLayout/NavigationWrapper/NavigationWrapper';
import { ViewingNuggPhoneController } from '@src/components/mobile/ViewingNuggPhone';
import web3 from '@src/web3';

const MemoizedViewingNuggPhone = React.lazy(
    () => import('@src/components/mobile/ViewingNuggPhoneWrapper'),
);
const HotRotateO = React.lazy(() => import('@src/pages/hot-rotate-o/HotRotateOWrapper'));
const SearchOverlay = React.lazy(() => import('@src/pages/search/SearchOverlayWrapper'));
const SwapPageWrapper = React.lazy(() => import('@src/pages/swap/SwapPageWrapper'));
const GlobalModal = React.lazy(() => import('@src/components/modals/GlobalModal'));

const Router = () => {
    const { isPhone, screen } = useDimensions();

    const chainId = web3.hook.usePriorityChainId();

    console.log(chainId);

    const epoch = client.epoch.active.useId();

    const route = useRoutes([
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
                              element: <SearchOverlay isPhone={isPhone} />,
                          },
                      ]),

                { path: 'swap/:id', element: isPhone ? <ViewingNuggPhoneController /> : null },
                { path: 'live', element: null },
                { path: '*', element: <Navigate to={!isPhone ? `swap/${epoch || ''}` : 'live'} /> },
            ],
        },
    ]);

    return (
        <React.Suspense fallback={<div />}>
            <GlobalModal isPhone={isPhone} />
            {route}
            <MemoizedViewingNuggPhone isPhone={isPhone} />
        </React.Suspense>
    );
};

const App = () => {
    const { isPhone, screen } = useDimensions();

    return (
        <>
            <ToastContainer />
            <Helmet />
            <NavigationWrapper isPhone={isPhone} />
            <Router />
            <React.Suspense>
                <SwapPageWrapper screen={screen} />
            </React.Suspense>
        </>
    );
};

export default App;
