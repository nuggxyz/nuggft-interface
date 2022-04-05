import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Navigate, Outlet } from 'react-router-dom';

import ErrorBoundary from '@src/components/general/ErrorBoundry';
import Loader from '@src/components/general/Loader/Loader';
import NavigationBar from '@src/components/nugg/PageLayout/NavigationBar/NavigationBar';
import ToastContainer from '@src/components/general/Toast/ToastContainer';
import Modal from '@src/components/nugg/Modals/Modal/Modal';
import { useRoutes } from '@src/lib/router';
import client from '@src/client';
import useAnalyticsReporter from '@src/lib/analytics/useAnalyticsReporter';
import SwapPage from '@src/structure/desktop/SwapPage';

const WalletView = React.lazy(() => import('@src/structure/mobile/WalletView'));
const HotRotateO = React.lazy(() => import('@src/structure/desktop/HotRotateO'));
const SearchOverlay = React.lazy(() => import('@src/structure/desktop/SearchOverlay'));

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
                { path: 'edit', element: <HotRotateO /> },
                { path: 'wallet', element: <WalletView /> },
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
            <React.Suspense fallback={<Loader />}>{route} </React.Suspense>

            <SwapPage />
        </ErrorBoundary>
    );
};

export default App;
