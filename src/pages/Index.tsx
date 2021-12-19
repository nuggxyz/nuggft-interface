import * as React from 'react';
import { Helmet } from 'react-helmet';

import Loader from '../components/general/Loader/Loader';
import PageContainer from '../components/nugg/PageLayout/PageContainer/PageContainer';
import SwapPage from '../structure/desktop/SwapPage';
const SearchOverlay = React.lazy(
    () => import('../structure/desktop/SearchOverlay'),
);
// const SwapPage = React.lazy(() => import('../structure/desktop/SwapPage'));
// import loadable from '@loadable/component';

// const Structure = loadable(() => import('../structure'));

const IndexPage = () => {
    return (
        <PageContainer>
            <Helmet></Helmet>
            <React.Suspense
                fallback={
                    <div style={{ position: 'absolute' }}>
                        <Loader />
                    </div>
                }>
                <SearchOverlay />
            </React.Suspense>
            <SwapPage />
        </PageContainer>
    );
};

export default IndexPage;
//
