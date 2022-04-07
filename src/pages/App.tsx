import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Navigate, Outlet } from 'react-router-dom';

import SwapPage from '@src/pages/SwapPage';
import ErrorBoundary from '@src/components/general/ErrorBoundry';
import NavigationBar from '@src/components/nugg/PageLayout/NavigationBar/NavigationBar';
import ToastContainer from '@src/components/general/Toast/ToastContainer';
import Modal from '@src/components/nugg/Modals/Modal/Modal';
import { useRoutes } from '@src/lib/router';
import client from '@src/client';
import useAnalyticsReporter from '@src/lib/analytics/useAnalyticsReporter';

const MobileWalletView = React.lazy(() => import('@src/pages/mobile/MobileWalletView'));
const HotRotateO = React.lazy(() => import('@src/pages/HotRotateO'));
const SearchOverlay = React.lazy(() => import('@src/pages/SearchOverlay'));

const App = () => {
    useAnalyticsReporter();

    const [loaded, setLoaded] = React.useState<boolean>(false);

    useEffect(() => {
        setTimeout(() => {
            setLoaded(true);
        }, 0);
    }, []);

    const epoch = client.live.epoch.id();

    const route = useRoutes([
        {
            path: '/',
            element: <Outlet />,
            children: [
                { path: 'view/*', element: loaded ? <SearchOverlay /> : null, overlay: 997 },
                { path: 'edit/:id', element: <HotRotateO /> },
                // instead of hiding this for mobile here, we redirect inside the component to avoid lots of rerenders
                { path: 'wallet', element: <MobileWalletView /> },
                { path: 'swap/:id', element: null },
                { path: '*', element: <Navigate to={`swap/${epoch || ''}`} /> },
            ],
        },
    ]);

    return (
        <ErrorBoundary>
            <ToastContainer />
            <Modal />
            <Helmet />
            <NavigationBar />
            <React.Suspense fallback={<div />}>{route} </React.Suspense>

            <SwapPage />
        </ErrorBoundary>
    );
};

export default App;
