import { useCallback, useMemo } from 'react';

import {
    gatsbyDOM,
    isUndefinedOrNullOrObjectEmpty,
    isUndefinedOrNullOrStringEmpty,
} from '../lib';
import en from '../locales/en';
import fr from '../locales/fr';

const useTranslation = (pageName: keyof typeof en) => {
    const language = useMemo(
        () =>
            gatsbyDOM('window')
                ? window.navigator.language.split('-')[0]
                : 'en',
        [],
    );
    const availableLanguages = useMemo(() => {
        return {
            en,
            fr,
        };
    }, []);

    const t = useCallback(
        (pageName: string) => (key: string) => {
            if (!isUndefinedOrNullOrStringEmpty(key)) {
                const values = key.split('.');
                let translatedValue = availableLanguages[language][pageName];

                values.forEach((value) => {
                    if (!isUndefinedOrNullOrObjectEmpty(translatedValue)) {
                        translatedValue = translatedValue[value];
                    }
                });

                return translatedValue || key;
            }
        },
        [language, availableLanguages],
    );

    return t(pageName);
};

export default useTranslation;
