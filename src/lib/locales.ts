import { i18n } from '@lingui/core';
import * as plural from 'make-plural';

import * as enUS from '@src/locales/en-US';

export const SUPPORTED_LOCALES = [
    // order as they appear in the language dropdown
    'en-US',
    'es-ES',
    'fr-FR',
] as const;

export type SupportedLocale = typeof SUPPORTED_LOCALES[number] | 'pseudo';

export const DEFAULT_LOCALE: SupportedLocale = 'en-US';
export const DEFAULT_CATALOG = enUS;

export const LOCALE_LABEL: { [locale in SupportedLocale]: string } = {
    'en-US': 'English',
    'es-ES': 'Español',
    'fr-FR': 'français',
    pseudo: 'pseudo',
};

type LocalePlural = {
    [key in SupportedLocale]: (n: number | string, ord?: boolean) => plural.PluralCategory;
};

const plurals: LocalePlural = {
    'en-US': plural.en,
    'es-ES': plural.es,
    'fr-FR': plural.fr,
    pseudo: plural.en,
};

export async function dynamicActivate(locale: SupportedLocale) {
    i18n.loadLocaleData(locale, { plurals: () => plurals[locale] });
    // There are no default messages in production; instead, bundle the default to save a network request:
    // see https://github.com/lingui/js-lingui/issues/388#issuecomment-497779030
    const catalog =
        locale === DEFAULT_LOCALE
            ? DEFAULT_CATALOG
            : ((await import(`../locales/${locale}`)) as { messages: Record<string, string> });
    i18n.load(locale, catalog.messages);
    i18n.activate(locale);
}
