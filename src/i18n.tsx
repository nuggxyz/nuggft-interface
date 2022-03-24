import React, { useCallback, ReactNode, useEffect } from 'react';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';

import { dynamicActivate, SupportedLocale } from '@src/lib/locales';
import client from '@src/client/index';

import { initialLocale, useLocale } from './hooks/useLocale';

void dynamicActivate(initialLocale);

export default ({ children }: { children: ReactNode }) => {
    const locale = useLocale();

    const updateLocale = client.mutate.updateLocale();

    const onActivate = useCallback(
        (_locale: SupportedLocale) => {
            document.documentElement.setAttribute('lang', _locale);
            updateLocale(_locale); // stores the selected locale to persist across sessions
        },
        [updateLocale],
    );

    return (
        <Provider locale={locale} forceRenderAfterLocaleChange={false} onActivate={onActivate}>
            {children}
        </Provider>
    );
};

interface ProviderProps {
    locale: SupportedLocale;
    forceRenderAfterLocaleChange?: boolean;
    onActivate?: (locale: SupportedLocale) => void;
    children: ReactNode;
}

const Provider = ({
    locale,
    forceRenderAfterLocaleChange = true,
    onActivate,
    children,
}: ProviderProps) => {
    useEffect(() => {
        dynamicActivate(locale)
            .then(() => onActivate?.(locale))
            .catch((error) => {
                console.error('Failed to activate locale', locale, error);
            });
    }, [locale, onActivate]);

    return (
        <I18nProvider forceRenderOnLocaleChange={forceRenderAfterLocaleChange} i18n={i18n}>
            {children}
        </I18nProvider>
    );
};
