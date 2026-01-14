'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    Locale,
    locales,
    loadTranslations,
    t as translate,
    getCurrentLocale,
    setLocale as saveLocale
} from '@/lib/i18n';

export function useTranslation() {
    const [locale, setLocaleState] = useState<Locale>('en');
    const [translations, setTranslations] = useState<Record<string, unknown>>({});
    const [isLoading, setIsLoading] = useState(true);

    // Initialize locale and load translations
    useEffect(() => {
        const init = async () => {
            setIsLoading(true);
            const currentLocale = getCurrentLocale();
            setLocaleState(currentLocale);

            const data = await loadTranslations(currentLocale);
            setTranslations(data);
            setIsLoading(false);
        };

        init();
    }, []);

    // Translation function
    const t = useCallback(
        (key: string, params?: Record<string, string | number>): string => {
            return translate(translations, key, params);
        },
        [translations]
    );

    // Change locale
    const setLocale = useCallback(async (newLocale: Locale) => {
        setIsLoading(true);
        saveLocale(newLocale);
        setLocaleState(newLocale);

        const data = await loadTranslations(newLocale);
        setTranslations(data);
        setIsLoading(false);
    }, []);

    return {
        t,
        locale,
        locales,
        setLocale,
        isLoading,
    };
}
