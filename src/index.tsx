import React, { FC, PropsWithChildren } from 'react';
import { ApolloProvider } from '@apollo/client/react/context/ApolloProvider';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';

import './prototypes';
import './lib/analytics';
import './index.css';
import web3 from './web3';
import I18N from './i18n';
import App from './pages/App';
import ErrorBoundary from './components/general/ErrorBoundry';
import useMountLogger from './hooks/useMountLogger';
import useClientUpdater from './client/useClientUpdater';
import useAnalyticsReporter from './lib/analytics/useAnalyticsReporter';

global.Buffer = global.Buffer || (await import('buffer')).Buffer;

const GlobalHooks = () => {
    useMountLogger('GlobalHooks');

    web3.config.useActivate();

    useClientUpdater();

    useAnalyticsReporter();

    return null;
};

const ContentBlock: FC<PropsWithChildren<unknown>> = ({ children }) => {
    const active = web3.hook.usePriorityIsActive();

    return active ? <>{children}</> : null;
};

const container = document.getElementById('root') as HTMLElement;

const root = createRoot(container);

root.render(
    <HashRouter>
        <ApolloProvider client={web3.config.apolloClient}>
            <GlobalHooks />

            <React.StrictMode>
                {/* <div style={{ width: '100%', height: '100%' }}> */}
                <ErrorBoundary>
                    <I18N>
                        <ContentBlock>
                            <App />
                        </ContentBlock>
                    </I18N>
                </ErrorBoundary>
                {/* </div> */}
            </React.StrictMode>
        </ApolloProvider>
    </HashRouter>,
);
