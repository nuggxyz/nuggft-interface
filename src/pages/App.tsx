import React from 'react';
import { Helmet } from 'react-helmet';
import { Navigate, Outlet } from 'react-router-dom';

import SwapPage from '@src/pages/SwapPage';
import NavigationBar from '@src/components/nugg/PageLayout/NavigationBar/NavigationBar';
import { useRoutes } from '@src/lib/router';
import client from '@src/client';
import GlobalModal from '@src/components/modals/GlobalModal';
import ToastContainer from '@src/components/general/Toast/ToastContainer';
import NuggBook from '@src/components/nuggbook/NuggBook';
import useDimentions from '@src/client/hooks/useDimentions';
import HotRotateO, { HotRotateOController } from '@src/pages/HotRotateO';

import MobileViewScreen2 from './mobile/MobileViewScreen2';

const MobileWalletView = React.lazy(() => import('@src/pages/mobile/MobileWalletView'));
// const HotRotateO = React.lazy(() => import('@src/pages/HotRotateO'));
const SearchOverlay = React.lazy(() => import('@src/pages/SearchOverlay'));

const Router = () => {
    const { isPhone } = useDimentions();

    const epoch = client.live.epoch.id();

    const route = useRoutes([
        {
            path: '/',
            element: <Outlet />,
            children: [
                {
                    path: 'view/*',
                    element: <SearchOverlay />,
                    // overlay: 997,
                },
                {
                    path: 'edit/:id',
                    element: <HotRotateOController />,
                },
                // instead of hiding this for mobile here, we redirect inside the component to avoid lots of rerenders
                { path: 'wallet', element: <MobileWalletView /> },
                { path: 'swap/:id', element: isPhone ? <MobileViewScreen2 /> : null },
                { path: 'live', element: null },
                { path: '*', element: <Navigate to={isPhone ? `swap/${epoch || ''}` : 'live'} /> },
            ],
        },
    ]);

    return <React.Suspense fallback={<div />}>{route} </React.Suspense>;
};

const App = () => {
    return (
        <>
            <ToastContainer />
            <GlobalModal />
            <NuggBook />
            <Helmet />
            <NavigationBar />

            <HotRotateO />
            <Router />
            <SwapPage />
        </>
    );
};

export default App;
