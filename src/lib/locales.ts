import { i18n } from '@lingui/core';
import {
    af,
    ar,
    ca,
    cs,
    da,
    de,
    el,
    en,
    es,
    fi,
    fr,
    he,
    hu,
    id,
    it,
    ja,
    ko,
    nl,
    no,
    pl,
    PluralCategory,
    pt,
    ro,
    ru,
    sr,
    sv,
    sw,
    tr,
    uk,
    vi,
    zh,
} from 'make-plural/plurals';

export const SUPPORTED_LOCALES = [
    // order as they appear in the language dropdown
    'en-US',
    'af-ZA',
    'ar-SA',
    'ca-ES',
    'cs-CZ',
    'da-DK',
    'de-DE',
    'el-GR',
    'es-ES',
    'fi-FI',
    'fr-FR',
    'he-IL',
    'hu-HU',
    'id-ID',
    'it-IT',
    'ja-JP',
    'ko-KR',
    'nl-NL',
    'no-NO',
    'pl-PL',
    'pt-BR',
    'pt-PT',
    'ro-RO',
    'ru-RU',
    'sr-SP',
    'sv-SE',
    'sw-TZ',
    'tr-TR',
    'uk-UA',
    'vi-VN',
    'zh-CN',
    'zh-TW',
] as const;

export type SupportedLocale = typeof SUPPORTED_LOCALES[number] | 'pseudo';

// eslint-disable-next-line import/first
import * as enUS from '@src/locales/en-US';

export const DEFAULT_LOCALE: SupportedLocale = 'en-US';
export const DEFAULT_CATALOG = enUS;

export const LOCALE_LABEL: { [locale in SupportedLocale]: string } = {
    'af-ZA': 'Afrikaans',
    'ar-SA': 'العربية',
    'ca-ES': 'Català',
    'cs-CZ': 'čeština',
    'da-DK': 'dansk',
    'de-DE': 'Deutsch',
    'el-GR': 'ελληνικά',
    'en-US': 'English',
    'es-ES': 'Español',
    'fi-FI': 'suomi',
    'fr-FR': 'français',
    'he-IL': 'עִברִית',
    'hu-HU': 'Magyar',
    'id-ID': 'bahasa Indonesia',
    'it-IT': 'Italiano',
    'ja-JP': '日本語',
    'ko-KR': '한국어',
    'nl-NL': 'Nederlands',
    'no-NO': 'norsk',
    'pl-PL': 'Polskie',
    'pt-BR': 'português',
    'pt-PT': 'português',
    'ro-RO': 'Română',
    'ru-RU': 'русский',
    'sr-SP': 'Српски',
    'sv-SE': 'svenska',
    'sw-TZ': 'Kiswahili',
    'tr-TR': 'Türkçe',
    'uk-UA': 'Український',
    'vi-VN': 'Tiếng Việt',
    'zh-CN': '简体中文',
    'zh-TW': '繁体中文',
    pseudo: 'ƥƨèúδô',
};

type LocalePlural = {
    [key in SupportedLocale]: (n: number | string, ord?: boolean) => PluralCategory;
};

const plurals: LocalePlural = {
    'af-ZA': af,
    'ar-SA': ar,
    'ca-ES': ca,
    'cs-CZ': cs,
    'da-DK': da,
    'de-DE': de,
    'el-GR': el,
    'en-US': en,
    'es-ES': es,
    'fi-FI': fi,
    'fr-FR': fr,
    'he-IL': he,
    'hu-HU': hu,
    'id-ID': id,
    'it-IT': it,
    'ja-JP': ja,
    'ko-KR': ko,
    'nl-NL': nl,
    'no-NO': no,
    'pl-PL': pl,
    'pt-BR': pt,
    'pt-PT': pt,
    'ro-RO': ro,
    'ru-RU': ru,
    'sr-SP': sr,
    'sv-SE': sv,
    'sw-TZ': sw,
    'tr-TR': tr,
    'uk-UA': uk,
    'vi-VN': vi,
    'zh-CN': zh,
    'zh-TW': zh,
    pseudo: en,
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
