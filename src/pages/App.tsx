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

import MobileViewScreen from './mobile/MobileViewScreen';

const MobileWalletView = React.lazy(() => import('@src/pages/mobile/MobileWalletView'));
// const HotRotateO = React.lazy(() => import('@src/pages/HotRotateO'));
const SearchOverlay = React.lazy(() => import('@src/pages/SearchOverlay'));

const Router = () => {
    const { isPhone } = useDimentions();

    // const isPageLoaded = client.live.pageIsLoaded();

    // const [loadSearchOverlay, setLoadSearchOverlay] = React.useState(false);

    // const isView =

    // React.useEffect(() => {
    //     if (isPageLoaded) {
    //         if (!loadSearchOverlay) {
    //             if (isPhone) setTimeout(() => setLoadSearchOverlay(true), isPhone ? 2000 : 1000);
    //         }
    //     }
    // }, [isPageLoaded, loadSearchOverlay, isPhone]);

    const epoch = client.live.epoch.id();

    const route = useRoutes([
        {
            path: '/',
            element: <Outlet />,
            children: [
                {
                    path: 'view/*',
                    element: <SearchOverlay />,
                    overlay: 997,
                },
                {
                    path: 'edit/:id',
                    element: <HotRotateOController />,
                },
                // instead of hiding this for mobile here, we redirect inside the component to avoid lots of rerenders
                { path: 'wallet', element: <MobileWalletView /> },
                { path: 'swap/:id', element: isPhone ? <Navigate to="/live" /> : null },
                { path: 'live', element: null },
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
            <MobileViewScreen />
            <HotRotateO />
            <Router />
            <SwapPage />
        </>
    );
};

export default App;
