import * as React from 'react';
import { Helmet } from 'react-helmet';

import PageContainer from '../components/nugg/PageLayout/PageContainer/PageContainer';
import SearchOverlay from '../structure/desktop/SearchOverlay';
import SwapPage from '../structure/desktop/SwapPage';

const IndexPage = () => {
    return (
        <PageContainer>
            <Helmet></Helmet>
            <SearchOverlay />
            <SwapPage />
        </PageContainer>
    );
};

export default IndexPage;
//
