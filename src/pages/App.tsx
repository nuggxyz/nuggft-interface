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

const MobileWalletView = React.lazy(() => import('@src/pages/mobile/MobileWalletView'));
const HotRotateO = React.lazy(() => import('@src/pages/HotRotateO'));
const SearchOverlay = React.lazy(() => import('@src/pages/SearchOverlay'));

const Router = () => {
    // const [loaded, setLoaded] = React.useState<boolean>(false);

    // const [, start] = React.useTransition();

    // React.useEffect(() => {
    //     start(() => {
    //         setLoaded(true);
    //     });
    // }, []);

    const isPageLoaded = client.live.pageIsLoaded();

    const epoch = client.live.epoch.id();

    const route = useRoutes([
        {
            path: '/',
            element: <Outlet />,
            children: [
                { path: 'view/*', element: isPageLoaded ? <SearchOverlay /> : null, overlay: 997 },
                { path: 'edit/:id', element: <HotRotateO /> },
                // instead of hiding this for mobile here, we redirect inside the component to avoid lots of rerenders
                { path: 'wallet', element: <MobileWalletView /> },
                { path: 'swap/:id', element: null },
                { path: '*', element: <Navigate to={`swap/${epoch || ''}`} /> },
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
            <Router />
            <SwapPage />
        </>
    );
};

export default App;
