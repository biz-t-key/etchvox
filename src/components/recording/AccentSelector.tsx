'use client';

interface AccentSelectorProps {
    onSelect: (accent: string) => void;
}

const accents = [
    { key: 'us', label: 'American', flag: '🇺🇸' },
    { key: 'uk', label: 'British', flag: '🇬🇧' },
    { key: 'au', label: 'Australian', flag: '🇦🇺' },
    { key: 'in', label: 'Indian', flag: '🇮🇳' },
    { key: 'asia', label: 'Asian', flag: '🌏' },
    { key: 'eu', label: 'European', flag: '🇪🇺' },
    { key: 'latam', label: 'Latin Am.', flag: '🌎' },
];

export default function AccentSelector({ onSelect }: AccentSelectorProps) {
    return (
        <div className="fade-in">
            {/* Title */}
            <div className="mono text-sm text-cyan-400 mb-2 animate-pulse">
                CALIBRATING REGIONAL PATTERNS...
            </div>

            <h2 className="text-xl font-bold mb-2">
                To improve accuracy, where did you learn English?
            </h2>
            <p className="text-gray-500 text-sm mb-6">
                精度向上のため、英語をどこで覚えましたか？
            </p>

            {/* Accent Grid */}
            <div className="grid grid-cols-3 gap-3 mb-6">
                {accents.map((accent) => (
                    <button
                        key={accent.key}
                        onClick={() => onSelect(accent.key)}
                        className="glass p-4 rounded-xl hover:bg-white/10 transition-all duration-200 hover:scale-105 hover:border-cyan-500/50 border border-transparent"
                    >
                        <div className="text-2xl mb-1">{accent.flag}</div>
                        <div className="text-sm font-medium">{accent.label}</div>
                    </button>
                ))}
            </div>

            {/* Skip Button */}
            <button
                onClick={() => onSelect('unknown')}
                className="text-gray-500 hover:text-gray-300 text-sm transition-colors"
            >
                Skip - Use default analysis
            </button>
        </div>
    );
}
