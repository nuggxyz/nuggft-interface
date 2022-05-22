import React from 'react';
import { Helmet } from 'react-helmet';
import { Navigate, Outlet } from 'react-router-dom';

import SwapPage from '@src/pages/SwapPage';
import { useRoutes } from '@src/lib/router';
import client from '@src/client';
import GlobalModal from '@src/components/modals/GlobalModal';
import ToastContainer from '@src/components/general/Toast/ToastContainer';
import NuggBook from '@src/components/nuggbook/NuggBook';
import useDimensions from '@src/client/hooks/useDimensions';
import { HotRotateOController } from '@src/pages/HotRotateO';
import NavigationWrapper from '@src/components/nugg/PageLayout/NavigationWrapper/NavigationWrapper';
import {
    MemoizedViewingNuggPhone,
    ViewingNuggPhoneController,
} from '@src/components/mobile/ViewingNuggPhone';

import MobileWalletScreen2 from './mobile/MobileWalletScreen2';
import MobileHotRotateOWrapper from './mobile/MobileHotRotateOWrapper';

// const MobileWalletView = React.lazy(() => import('@src/pages/mobile/MobileWalletView'));
// const HotRotateO = React.lazy(() => import('@src/pages/HotRotateO'));
const SearchOverlay = React.lazy(() => import('@src/pages/SearchOverlay'));

const Router = () => {
    const { isPhone } = useDimensions();

    const epoch = client.epoch.active.useId();

    const route = useRoutes([
        {
            path: '/',
            element: <Outlet />,
            children: [
                {
                    path: 'edit/:id',
                    element: isPhone ? <MobileHotRotateOWrapper /> : <HotRotateOController />,
                    // overlay: 997,
                },
                ...(isPhone
                    ? [{ path: 'wallet', element: <MobileWalletScreen2 /> }]
                    : [
                          {
                              path: 'view/*',
                              element: <SearchOverlay />,
                          },
                      ]),

                { path: 'swap/:id', element: isPhone ? <ViewingNuggPhoneController /> : null },
                { path: 'live', element: null },
                { path: '*', element: <Navigate to={isPhone ? `swap/${epoch || ''}` : 'live'} /> },
            ],
        },
    ]);

    // const mem = React.memo(<MemoizedViewingNuggPhone/>, (a,b) => isPhone === isPhone);

    return (
        <React.Suspense fallback={<div />}>
            {route}
            {isPhone && <MemoizedViewingNuggPhone />}
        </React.Suspense>
    );
};

const App = () => {
    const { isPhone } = useDimensions();

    return (
        <>
            <ToastContainer />
            <GlobalModal />
            <NuggBook />
            <Helmet />
            <NavigationWrapper isPhone={isPhone} />
            <Router />
            <SwapPage />
        </>
    );
};

export default App;
