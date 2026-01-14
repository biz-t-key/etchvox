// Couple Recording Scripts
// Hybrid mode: Solo calibration + Together + Alternating

export interface CoupleStep {
    id: number;
    phase: 'calibration' | 'unison' | 'stress' | 'alternating';
    speaker: 'A' | 'B' | 'BOTH' | 'ALTERNATE';
    duration: number; // seconds
    ui: {
        en: string;
        ja: string;
    };
    instruction: {
        en: string;
        ja: string;
    };
    script: {
        en: string;
        ja: string;
    };
    highlightPattern?: ('A' | 'B' | 'BOTH')[]; // For alternating mode
}

export const coupleSteps: CoupleStep[] = [
    // Step 0: Calibration A
    {
        id: 0,
        phase: 'calibration',
        speaker: 'A',
        duration: 5,
        ui: {
            en: 'Calibrating Voice A...',
            ja: 'ボイスAを調整中...',
        },
        instruction: {
            en: 'Person A, please introduce yourself naturally.',
            ja: 'Aさん、自然に自己紹介してください。',
        },
        script: {
            en: 'Hello, my name is [Your Name]. Nice to meet you.',
            ja: 'こんにちは、私の名前は [あなたの名前] です。よろしくお願いします。',
        },
    },

    // Step 1: Calibration B
    {
        id: 1,
        phase: 'calibration',
        speaker: 'B',
        duration: 5,
        ui: {
            en: 'Calibrating Voice B...',
            ja: 'ボイスBを調整中...',
        },
        instruction: {
            en: 'Person B, please introduce yourself naturally.',
            ja: 'Bさん、自然に自己紹介してください。',
        },
        script: {
            en: 'Hello, my name is [Your Name]. Nice to meet you.',
            ja: 'こんにちは、私の名前は [あなたの名前] です。よろしくお願いします。',
        },
    },

    // Step 2: Unison (Together)
    {
        id: 2,
        phase: 'unison',
        speaker: 'BOTH',
        duration: 10,
        ui: {
            en: 'Synchronizing Biometric Resonance...',
            ja: '生体共鳴を同期中...',
        },
        instruction: {
            en: 'Read this TOGETHER, in sync, as one voice.',
            ja: '二人で声を合わせて、一回で読み上げてください。',
        },
        script: {
            en: 'We parked our car in the garage to share a bottle of water. We are certainly not robots.',
            ja: '私たちは車をガレージに停めて、水のボトルを分け合いました。私たちは確実にロボットではありません。',
        },
    },

    // Step 3: Stress A
    {
        id: 3,
        phase: 'stress',
        speaker: 'A',
        duration: 4,
        ui: {
            en: 'Simulating Relational Stress Levels...',
            ja: '関係性ストレスレベルをシミュレート中...',
        },
        instruction: {
            en: 'Person A: You are WARNING about a crisis! Act it out!',
            ja: 'Aさん：危機を警告してください！全力で演技！',
        },
        script: {
            en: 'System failure! It\'s going down!',
            ja: 'システム障害だ！落ちる！',
        },
    },

    // Step 4: Stress B
    {
        id: 4,
        phase: 'stress',
        speaker: 'B',
        duration: 4,
        ui: {
            en: 'Simulating Relational Stress Levels...',
            ja: '関係性ストレスレベルをシミュレート中...',
        },
        instruction: {
            en: 'Person B: You are STOPPING them desperately! Act it out!',
            ja: 'Bさん：必死に止めてください！全力で演技！',
        },
        script: {
            en: 'No! Shut it down! SHUT IT DOWN NOW!',
            ja: 'だめだ！止めて！今すぐ止めて！',
        },
    },

    // Step 5: Alternating Speed Challenge
    {
        id: 5,
        phase: 'alternating',
        speaker: 'ALTERNATE',
        duration: 8,
        ui: {
            en: 'Analyzing Neural Processing Speed...',
            ja: '神経処理速度を解析中...',
        },
        instruction: {
            en: 'Read your highlighted word when it glows. Finish TOGETHER!',
            ja: 'ハイライトされた単語を素早く読んで！最後は一緒に！',
        },
        script: {
            en: 'Six | systems | synthesized | sixty-six | signals simultaneously!',
            ja: 'シックス | システムズ | シンセサイズド | シックスティシックス | シグナルズ サイマルテニアスリー！',
        },
        highlightPattern: ['A', 'B', 'A', 'B', 'BOTH'],
    },
];

// Time segments for audio slicing (start time in seconds)
export const audioSegments = {
    calibrationA: { start: 0, end: 5 },
    calibrationB: { start: 5, end: 10 },
    unison: { start: 10, end: 20 },
    stressA: { start: 20, end: 24 },
    stressB: { start: 24, end: 28 },
    alternating: { start: 28, end: 36 },
};

// Total recording duration
export const totalDuration = 36; // seconds

// Get step by current time
export function getStepByTime(elapsedSeconds: number): CoupleStep | null {
    let accumulated = 0;
    for (const step of coupleSteps) {
        accumulated += step.duration;
        if (elapsedSeconds < accumulated) {
            return step;
        }
    }
    return null;
}

// Get current word index for alternating mode
export function getAlternatingWordIndex(stepElapsed: number, step: CoupleStep): number {
    if (step.phase !== 'alternating' || !step.highlightPattern) return -1;
    const wordsCount = step.highlightPattern.length;
    const timePerWord = step.duration / wordsCount;
    return Math.min(Math.floor(stepElapsed / timePerWord), wordsCount - 1);
}
