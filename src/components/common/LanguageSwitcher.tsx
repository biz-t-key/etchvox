'use client';

import { Locale } from '@/lib/i18n';

interface LanguageSwitcherProps {
    locale: Locale;
    onLocaleChange: (locale: Locale) => void;
}

export default function LanguageSwitcher({ locale, onLocaleChange }: LanguageSwitcherProps) {
    return (
        <div className="flex items-center gap-2">
            <button
                onClick={() => onLocaleChange('en')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${locale === 'en'
                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                        : 'text-gray-500 hover:text-gray-300'
                    }`}
            >
                EN
            </button>
            <button
                onClick={() => onLocaleChange('ja')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${locale === 'ja'
                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                        : 'text-gray-500 hover:text-gray-300'
                    }`}
            >
                日本語
            </button>
        </div>
    );
}
