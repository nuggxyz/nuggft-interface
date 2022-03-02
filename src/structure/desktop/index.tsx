import React, { FunctionComponent, Suspense, useMemo } from 'react';
import { Helmet } from 'react-helmet';

import PageContainer from '@src/components/nugg/PageLayout/PageContainer/PageContainer';
import ProtocolState from '@src/state/protocol';
import { isUndefinedOrNullOrObjectEmpty } from '@src/lib';

const SearchOverlay = React.lazy(() => import('./SearchOverlay'));
const SwapPage = React.lazy(() => import('./SwapPage'));

type Props = {};

const Desktop: FunctionComponent<Props> = () => {
    const epoch = ProtocolState.select.epoch();
    const show = useMemo(() => !isUndefinedOrNullOrObjectEmpty(epoch) && epoch.id !== '0', [epoch]);

    return (
        <PageContainer>
            <Helmet></Helmet>
            {show && (
                <Suspense fallback={<div />}>
                    <SearchOverlay />
                    <SwapPage />
                </Suspense>
            )}
        </PageContainer>
    );
};

export default Desktop;
