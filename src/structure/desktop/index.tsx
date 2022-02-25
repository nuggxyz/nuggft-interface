import React, { FunctionComponent, Suspense } from 'react';
import { Helmet } from 'react-helmet';

import PageContainer from '../../components/nugg/PageLayout/PageContainer/PageContainer';
import { isUndefinedOrNullOrObjectEmpty } from '../../lib';
import ProtocolState from '../../state/protocol';

const SearchOverlay = React.lazy(() => import('./SearchOverlay'));
const SwapPage = React.lazy(() => import('./SwapPage'));

type Props = {};

const Desktop: FunctionComponent<Props> = () => {
    const epoch = ProtocolState.select.epoch();
    return (
        <PageContainer>
            <Helmet></Helmet>
            {!isUndefinedOrNullOrObjectEmpty(epoch) && epoch.id !== '0' && (
                <Suspense fallback={<div />}>
                    <SearchOverlay />
                    <SwapPage />
                </Suspense>
            )}
        </PageContainer>
    );
};

export default Desktop;
