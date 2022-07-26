import { useEffect } from 'react';
import ReactGA from 'react-ga4';
import { getCLS, getFCP, getFID, getLCP, Metric } from 'web-vitals';
import { useLocation } from 'react-router-dom';

import web3 from '@src/web3';

import { GOOGLE_ANALYTICS_CLIENT_ID_STORAGE_KEY } from './index';

function reportWebVitals({ name, delta, id }: Metric) {
	ReactGA._gaCommandSendTiming(
		'Web Vitals',
		name,
		Math.round(name === 'CLS' ? delta * 1000 : delta),
		id,
	);
}

export default () => {
	const location = useLocation();

	useEffect(() => {
		ReactGA.pageview(location.pathname + location.search);
	}, [location]);

	useEffect(() => {
		getFCP(reportWebVitals);
		getFID(reportWebVitals);
		getLCP(reportWebVitals);
		getCLS(reportWebVitals);
	}, []);

	const chainId = web3.hook.usePriorityChainId();
	useEffect(() => {
		// cd1 - custom dimension 1 - chainId
		ReactGA.set({ cd1: chainId ?? 0 });
	}, [chainId]);

	const peer = web3.hook.usePriorityPeer();

	useEffect(() => {
		// cd1 - custom dimension 1 - chainId
		ReactGA.set({ cd2__peer: peer?.name });
	}, [peer]);

	useEffect(() => {
		// typed as 'any' in react-ga4 -.-
		ReactGA.ga((tracker: { get: (arg: string) => string }) => {
			if (!tracker) return;

			const clientId = tracker.get('clientId');
			window.localStorage.setItem(GOOGLE_ANALYTICS_CLIENT_ID_STORAGE_KEY, clientId);
		});
	}, []);
};
