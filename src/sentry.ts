import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

if (!process.env.NUGG_APP_SENTRY_DSN) {
	throw new Error('NUGG_APP_SENTRY_DSN is not defined');
}

Sentry.init({
	dsn: process.env.NUGG_APP_SENTRY_DSN,
	integrations: [new BrowserTracing()],

	// Set tracesSampleRate to 1.0 to capture 100%
	// of transactions for performance monitoring.
	// We recommend adjusting this value in production
	tracesSampleRate: 1.0,
});

export { Sentry };
