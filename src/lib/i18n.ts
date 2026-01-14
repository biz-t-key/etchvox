// i18n Configuration for EtchVox
// Simple client-side translation system

export const locales = ['en', 'ja'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

// Translation cache
const translationCache: Record<Locale, Record<string, unknown> | null> = {
    en: null,
    ja: null,
};

// Load translations for a locale
export async function loadTranslations(locale: Locale): Promise<Record<string, unknown>> {
    if (translationCache[locale]) {
        return translationCache[locale] as Record<string, unknown>;
    }

    try {
        const response = await fetch(`/locales/${locale}/common.json`);
        if (!response.ok) {
            throw new Error(`Failed to load translations for ${locale}`);
        }
        const data = await response.json();
        translationCache[locale] = data;
        return data;
    } catch (error) {
        console.error(`Error loading translations for ${locale}:`, error);
        // Fallback to English
        if (locale !== 'en') {
            return loadTranslations('en');
        }
        return {};
    }
}

// Get nested value from object using dot notation
function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
    return path.split('.').reduce((current: unknown, key: string) => {
        if (current && typeof current === 'object' && key in current) {
            return (current as Record<string, unknown>)[key];
        }
        return undefined;
    }, obj);
}

// Translation function
export function t(
    translations: Record<string, unknown>,
    key: string,
    params?: Record<string, string | number>
): string {
    const value = getNestedValue(translations, key);

    if (typeof value !== 'string') {
        console.warn(`Translation not found: ${key}`);
        return key;
    }

    // Replace parameters like {name} with actual values
    if (params) {
        return Object.entries(params).reduce((text, [paramKey, paramValue]) => {
            return text.replace(new RegExp(`{${paramKey}}`, 'g'), String(paramValue));
        }, value);
    }

    return value;
}

// Detect user's preferred locale
export function getPreferredLocale(): Locale {
    if (typeof window === 'undefined') {
        return defaultLocale;
    }

    // Check localStorage first
    const stored = localStorage.getItem('etchvox_locale');
    if (stored && locales.includes(stored as Locale)) {
        return stored as Locale;
    }

    // Check browser language
    const browserLang = navigator.language.split('-')[0];
    if (locales.includes(browserLang as Locale)) {
        return browserLang as Locale;
    }

    return defaultLocale;
}

// Save locale preference
export function setLocale(locale: Locale): void {
    if (typeof window !== 'undefined') {
        localStorage.setItem('etchvox_locale', locale);
    }
}

// Get current locale
export function getCurrentLocale(): Locale {
    if (typeof window === 'undefined') {
        return defaultLocale;
    }

    const stored = localStorage.getItem('etchvox_locale');
    if (stored && locales.includes(stored as Locale)) {
        return stored as Locale;
    }

    return getPreferredLocale();
}
