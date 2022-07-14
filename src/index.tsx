import './sentry';

import React, { FC, PropsWithChildren } from 'react';
import { ApolloProvider } from '@apollo/client/react/context/ApolloProvider';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';

import './prototypes';
import './lib/analytics';
import './index.css';
import './styles/pulse.css';

import web3 from './web3';
import I18N from './i18n';
import ErrorBoundary from './components/general/ErrorBoundry';
import useMountLogger from './hooks/useMountLogger';
import useClientUpdater from './client/useClientUpdater';
import useAnalyticsReporter from './lib/analytics/useAnalyticsReporter';

global.Buffer = global.Buffer || (await import('buffer')).Buffer;

const App = React.lazy(() => import('@src/pages/App'));
const Landing = React.lazy(() => import('@src/pages/landing/Landing'));

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

const BigRouter = React.memo(() => {
	if (process.env.NUGG_APP_SIDE_APP === 'landing') {
		return <Landing />;
	}
	return (
		<ApolloProvider client={web3.config.apolloClient}>
			<GlobalHooks />

			<ErrorBoundary>
				<I18N>
					<ContentBlock>
						<App />
					</ContentBlock>
				</I18N>
			</ErrorBoundary>
		</ApolloProvider>
	);
});

root.render(
	<HashRouter>
		<React.StrictMode>
			<React.Suspense>
				<BigRouter />
			</React.Suspense>
		</React.StrictMode>
	</HashRouter>,
);
