import { useMemo } from 'react';

import { DEFAULT_LOCALE, SUPPORTED_LOCALES, SupportedLocale } from '@src/lib/i18n/locales';
import client from '@src/client';

import useParsedQueryString, { parsedQueryString } from './useQueryString';

/**
 * Given a locale string (e.g. from user agent), return the best match for corresponding SupportedLocale
 * @param maybeSupportedLocale the fuzzy locale identifier
 */
function parseLocale(maybeSupportedLocale: unknown): SupportedLocale | undefined {
    if (typeof maybeSupportedLocale !== 'string') return undefined;
    const lowerMaybeSupportedLocale = maybeSupportedLocale.toLowerCase();
    return SUPPORTED_LOCALES.find(
        (locale) =>
            locale.toLowerCase() === lowerMaybeSupportedLocale ||
            locale.split('-')[0] === lowerMaybeSupportedLocale,
    );
}

/**
 * Returns the supported locale read from the user agent (navigator)
 */
export function navigatorLocale(): SupportedLocale | undefined {
    if (!navigator.language) return undefined;

    const [language, region] = navigator.language.split('-');

    if (region) {
        return parseLocale(`${language}-${region.toUpperCase()}`) ?? parseLocale(language);
    }

    return parseLocale(language);
}

function storeLocale(): SupportedLocale | undefined {
    return client.getState().locale ?? undefined;
}

export const initialLocale =
    parseLocale(parsedQueryString().lng) ?? storeLocale() ?? navigatorLocale() ?? DEFAULT_LOCALE;

function useUrlLocale() {
    const parsed = useParsedQueryString();
    return parseLocale(parsed.lng);
}

/**
 * Returns the currently active locale, from a combination of user agent, query string, and user settings stored in redux
 * Stores the query string locale in redux (if set) to persist across sessions
 */
export function useLocale(): SupportedLocale {
    const urlLocale = useUrlLocale();
    const userLocale = client.live.locale();
    return useMemo(
        () => urlLocale ?? userLocale ?? navigatorLocale() ?? DEFAULT_LOCALE,
        [urlLocale, userLocale],
    );
}
