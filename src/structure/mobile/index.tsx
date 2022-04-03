import React, { FunctionComponent, Suspense } from 'react';
import { Helmet } from 'react-helmet';

import PageContainer from '@src/components/nugg/PageLayout/PageContainer/PageContainer';
import client from '@src/client';

const SearchOverlay = React.lazy(() => import('@src/structure/desktop/SearchOverlay'));
const SwapPage = React.lazy(() => import('@src/structure/desktop/SwapPage'));
const HotRoateO = React.lazy(() => import('@src/structure/desktop/HotRotateO'));
const WalletView = React.lazy(() => import('./WalletView'));
const MobileViewOverlay = React.lazy(() => import('./MobileViewOverlay'));

type Props = Record<string, never>;

const Mobile: FunctionComponent<Props> = () => {
    const isMobileViewOpen = client.live.isMobileViewOpen();
    const isMobileWalletOpen = client.live.isMobileWalletOpen();

    return (
        <PageContainer>
            <Helmet />
            <Suspense fallback={<div />}>
                {isMobileWalletOpen && <WalletView />}

                <HotRoateO />
                {isMobileViewOpen && <MobileViewOverlay />}

                <SearchOverlay />

                <SwapPage />
            </Suspense>
        </PageContainer>
    );
};

export default Mobile;
