import * as React from 'react';
import { Helmet } from 'react-helmet';

import PageContainer from '../components/nugg/PageLayout/PageContainer/PageContainer';
import AppState from '../state/app';
import SearchOverlay from '../structure/desktop/SearchOverlay';
import SwapPage from '../structure/desktop/SwapPage';
// import loadable from '@loadable/component';

// const Structure = loadable(() => import('../structure'));

const IndexPage = () => {
    const isMobile = AppState.select.isSmallDevice();

    return isMobile ? (
        <></>
    ) : (
        <PageContainer>
            <Helmet></Helmet>
            <SearchOverlay />
            <SwapPage />
        </PageContainer>
    );
};

export default IndexPage;
//
