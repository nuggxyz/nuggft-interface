import React, { FunctionComponent } from 'react';
import { Helmet } from 'react-helmet';

import PageContainer from '../../components/nugg/PageLayout/PageContainer/PageContainer';

import SearchOverlay from './SearchOverlay';
import SwapPage from './SwapPage';

type Props = {};

const Desktop: FunctionComponent<Props> = () => {
    return (
        <PageContainer>
            <Helmet></Helmet>
            <SearchOverlay />
            <SwapPage />
        </PageContainer>
    );
};

export default Desktop;
