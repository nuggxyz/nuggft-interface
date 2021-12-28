import React, { FunctionComponent, Suspense } from 'react';
import { Helmet } from 'react-helmet';

import Loader from '../../components/general/Loader/Loader';
import PageContainer from '../../components/nugg/PageLayout/PageContainer/PageContainer';

const SearchOverlay = React.lazy(() => import('./SearchOverlay'));
const SwapPage = React.lazy(() => import('./SwapPage'));

type Props = {};

const Desktop: FunctionComponent<Props> = () => {
    return (
        <PageContainer>
            <Helmet></Helmet>
            <Suspense fallback={<Loader />}>
                <SearchOverlay />
                <SwapPage />
            </Suspense>
        </PageContainer>
    );
};

export default Desktop;
