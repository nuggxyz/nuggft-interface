import React, { FunctionComponent, Suspense } from 'react';
import { Helmet } from 'react-helmet';

import PageContainer from '@src/components/nugg/PageLayout/PageContainer/PageContainer';

const SearchOverlay = React.lazy(() => import('./SearchOverlay'));
const SwapPage = React.lazy(() => import('./SwapPage'));

type Props = Record<string, never>;

const Desktop: FunctionComponent<Props> = () => {
    return (
        <PageContainer>
            <Helmet />
            <Suspense fallback={<div />}>
                <SearchOverlay />
                <SwapPage />
            </Suspense>
        </PageContainer>
    );
};

export default Desktop;
