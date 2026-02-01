// Voice Type Definitions for EtchVox
// 16 Types based on 4 axes: Pitch, Speed, Vibe, Tone

export type TypeCode =
    | 'HFEC' | 'HFED' | 'HSEC' | 'HSED'  // High-Energy Idols
    | 'HFCC' | 'HFCD' | 'HSCC' | 'HSCD'  // Intellectual Artists
    | 'LFEC' | 'LFED' | 'LSEC' | 'LSED'  // Power Leaders
    | 'LFCC' | 'LFCD' | 'LSCC' | 'LSCD'  // Deep Philosophers
    | 'COUPLE_MIX'                       // Couple Analysis
    | 'ELON' | 'NPCS' | 'EPON' | 'ELCS' | 'NPOS' | 'ELCN' | 'NPCN' | 'ELOS' | 'EPCS' | 'NLOS' | 'EPOS' | 'NLCN' | 'EPCN' | 'NLON' | 'NPON' | 'ELSN' | 'EPCB'
    | 'HIRED' | 'SUSP' | 'REJT' | 'BURN'; // Spy Audition Results

export type GroupName = 'idol' | 'intellectual' | 'power' | 'philosopher' | 'special';

export interface VoiceType {
    code: TypeCode;
    name: string;
    nameJa: string;
    icon: string;
    group: GroupName;
    catchphrase: string;
    catchphraseJa: string;
    roast: string;
    roastJa: string;
    bestMatch: TypeCode;
    primaryColor: string;
    secondaryColor: string;
}

export interface AnalysisMetrics {
    pitch: number;        // Hz
    speed: number;        // 0-1 normalized
    vibe: number;         // 0-1 normalized (variance)
    tone: number;         // Hz (spectral centroid)
    humanityScore: number; // 0-100
    jitter?: number;      // Version 2.0
    shimmer?: number;     // Version 2.0
    hnr?: number;         // Version 2.0
    pitchVar?: number;    // Elon Mode
    silenceRate?: number; // Elon Mode
    volumeDb?: number;    // Elon Mode
    speedVar?: number;    // Elon Mode
}

// ==================================================================================
// Phase 2: Dual-Stream Architecture Version 2.0.0
// ==================================================================================

export interface VoiceLogV2 {
    schema_version: '1.0.0';
    record_id: string; // UUID v4
    script_id: string; // e.g., 'spell_global_v1'

    context_time: {
        slot: 'EARLY_MORNING' | 'DAYTIME' | 'EVENING' | 'LATE_NIGHT';
        day_type: 'WEEKDAY' | 'WEEKEND' | 'HOLIDAY';
        season: 'Q1_WINTER' | 'Q2_SPRING' | 'Q3_SUMMER' | 'Q4_AUTUMN';
    };

    user_meta: {
        mbti_reported: string;
        age_range: string; // "10s", "20s", etc.
        gender: 'male' | 'female' | 'non-binary' | 'other';
    };

    features: {
        // Physiological
        f0_mean: number;
        f0_sd: number;
        jitter_pct: number;
        shimmer_db: number;
        hnr_db: number;

        // Temporal
        total_duration: number;
        phonation_time: number;
        speech_rate: number;
        pause_ratio: number;
        long_pause_count: number;

        // Spectral & Cognitive
        spectral_centroid: number;
        spectral_rolloff: number;
        dtw_score: number;
        mfcc_mean: number[]; // 13 dimensions
        mfcc_var: number[];  // 13 dimensions
    };

    environment: {
        snr_db: number;
        noise_category: 'Silence' | 'Traffic' | 'Cafe' | 'Nature' | 'Machinery' | 'Other';
        device_tier: 'High-End' | 'Mid-Range' | 'Low-End' | 'Unknown';
        os_family: string;
    };

    resonance?: CoupleResonanceV1; // Only for Couple Mode

    // Keep legacy support for internal mapping if needed, but primary is above
    meta?: {
        dataHash?: string;
    };
}

export interface CoupleResonanceV1 {
    f0_distance: number;         // C01: Difference in Hz
    speech_rate_delta: number;   // C02: Difference in syll/s
    turn_taking_latency: number; // C03: Avg gap between turns (ms)
    cross_talk_ratio: number;    // C04: % of time overlapping
    spectral_convergence: number; // C05: Timbre similarity progress (0-1)
    amplitude_sync: number;      // C06: Envelope correlation (0-1)
    stress_covariance: number;   // C07: Jitter/Shimmer co-movement (0-1)
    vocal_quality_sync: number;  // C08: Mimesis/Timbre matching (0-1)
    pause_entropy: number;       // C09: Silence pattern complexity
    pitch_overlap: number;       // C10: Range intersection ratio (0-1)
}

// ==================================================================================
// Phase 3: B2B Assetization & GDPR Compliance (Schema 2.0.0)
// ==================================================================================

export interface FineGrainedConsent {
    termsAccepted: boolean;
    privacyPolicyAccepted: boolean;
    dataDonationAllowed: boolean;   // Research/B2B Use
    marketingAllowed: boolean;
}

export interface UserAttributes {
    userId: string;
    isPaidUser: boolean;
    genderRange: 'male_low' | 'male_high' | 'female_low' | 'female_high' | 'other';
    ageGroup: string; // "10s", "20s", etc.
    mbti: string;
    chronotype: 'night_owl' | 'early_bird' | 'unknown';
}

export interface VoiceLogV3 {
    schema_version: '2.0.0';
    meta: {
        record_id: string;
        script_id: string;
        createdAt: string;
        dataHash: string;
        consent: FineGrainedConsent;
    };
    userProfile: {
        attributes: UserAttributes;
    };
    context: {
        timeSlot: 'EARLY_MORNING' | 'DAYTIME' | 'EVENING' | 'LATE_NIGHT';
        dayType: 'WEEKDAY' | 'WEEKEND' | 'HOLIDAY';
        environment: {
            snrDb: number;
            estimatedPlace: 'HOME' | 'OFFICE' | 'CAFE' | 'OUTDOOR' | 'UNKNOWN';
            backgroundNoiseType: string;
        };
        device: {
            osFamily: string;
            browser: string;
            isMobile: boolean;
        };
        subjective?: {
            userBetScore: number;
            predictionGap: number;
        };
    };
    metrics: {
        physical: {
            jitter: number;
            shimmer: number;
            hnr: number;
            f0_mean: number;
            f0_sd: number;
            rms: number;
            centroid: number;
            rolloff: number;
            zcr: number;
            snr: number;
        };
        prosody: {
            speechRate: number;
            pauseRatio: number;
            articulationRate: number;
            rhythmStability: number;
            totalDuration: number;
            longPauseCount: number;
            attackTime: number;
            decayTime: number;
            peakCount: number;
            vocalFryRatio: number;
        };
        inference: {
            valence: number;
            arousal: number;
            stress: number;
            fatigue: number;
            confidence: number;
            concentration: number;
            socialMasking: number;
            alcoholProb: number;
            charisma: number;
            npcScore: number;
        };
        resonance?: CoupleResonanceV1;
    };
    annotation?: {
        label: string;
        category: string;
        aiHypothesis: string;
        isMatch: boolean;
        reactionTimeMs: number;
        roastReaction?: string;
    };
}

export interface AnalysisResult {
    typeCode: TypeCode;
    metrics: AnalysisMetrics;
}

// Color palettes by group
// Color Logic for UI & Video Generation
export const groupColors: Record<GroupName, { label: string; primary: string; secondary: string; vibe: string }> = {
    idol: {
        label: 'High-Energy Idols',
        primary: '#FF00CC',   // Neon Pink
        secondary: '#FFD700', // Cyber Yellow
        vibe: 'Electric, Loud',
    },
    intellectual: {
        label: 'Intellectual Artists',
        primary: '#00F0FF',   // Electric Blue
        secondary: '#FFFFFF', // White
        vibe: 'Cold, Sharp',
    },
    power: {
        label: 'Power Leaders',
        primary: '#FF3C00',   // Neon Red/Orange
        secondary: '#6200EA', // Deep Purple
        vibe: 'Aggressive, Heavy',
    },
    philosopher: {
        label: 'Deep Philosophers',
        primary: '#00FF66',   // Toxic Green
        secondary: '#008B8B', // Deep Cyan
        vibe: 'Mysterious, Abysmal',
    },
    special: {
        label: 'System Error',
        primary: '#FF0000',   // Danger Red
        secondary: '#000000', // Black/Glitch
        vibe: 'ERROR, WARNING',
    },
};

// Master data for all 16 voice types
export const voiceTypes: Record<TypeCode, VoiceType> = {
    // Group 1: High-Energy Idols
    HFEC: {
        code: 'HFEC',
        name: 'The Pop Star',
        nameJa: 'ザ・ポップスター',
        icon: '🎤',
        group: 'idol',
        catchphrase: 'The center of attention. Your voice brings color to the world.',
        catchphraseJa: '注目の中心。あなたの声は世界に色を与える。',
        roast: "Your voice has the caffeine content of 4 Red Bulls. Great for parties, terrible for hangovers.",
        roastJa: "君の声はレッドブル4本分のカフェインを含んでいる。パーティには最高だが、二日酔いの時は地獄だ。",
        bestMatch: 'LSCD',
        primaryColor: '#FF00CC',
        secondaryColor: '#FFD700',
    },
    HFED: {
        code: 'HFED',
        name: 'The Hype Man',
        nameJa: 'ザ・ハイプマン',
        icon: '📢',
        group: 'idol',
        catchphrase: 'A machine gun of passion. You turn boring days into dramas.',
        catchphraseJa: '情熱のマシンガン。退屈な日をドラマに変える。',
        roast: "You don't talk, you broadcast. Even your whisper sounds like a YouTube intro.",
        roastJa: "君は会話をしているんじゃない、放送をしているんだ。君の囁き声でさえ、Youtuberの冒頭挨拶みたいだ。",
        bestMatch: 'LSCC',
        primaryColor: '#FF00CC',
        secondaryColor: '#FFD700',
    },
    HSEC: {
        code: 'HSEC',
        name: 'The Golden Retriever',
        nameJa: 'ザ・ゴールデンレトリバー',
        icon: '🐶',
        group: 'idol',
        catchphrase: 'Peak "Energy." You are the human version of a morning sun.',
        catchphraseJa: 'エネルギーの頂点。朝日の人間バージョン。',
        roast: "Pure vibes, zero thoughts. You sound like you're constantly chasing a tennis ball of happiness.",
        roastJa: "バイブス100%、思考ゼロ。君は常に「幸せという名のテニスボール」を追いかけている音がする。",
        bestMatch: 'LFCD',
        primaryColor: '#FF00CC',
        secondaryColor: '#FFD700',
    },
    HSED: {
        code: 'HSED',
        name: 'The Influencer',
        nameJa: 'ザ・インフルエンサー',
        icon: '🤳',
        group: 'idol',
        catchphrase: 'Ear-candy energy. You inject dopamine directly into the eardrums.',
        catchphraseJa: '耳に心地よいエネルギー。ドーパミンを直接鼓膜に注入する。',
        roast: "I can hear the hashtags in your breath. You sound like you're about to sell me detox tea.",
        roastJa: "吐息からハッシュタグが聞こえる。今にも怪しいデトックス茶を売りつけてきそうな声だ。",
        bestMatch: 'LFCC',
        primaryColor: '#FF00CC',
        secondaryColor: '#FFD700',
    },

    // Group 2: Intellectual Artists
    HFCC: {
        code: 'HFCC',
        name: 'The Bored Robot',
        nameJa: 'ザ・ボアードロボット',
        icon: '🤖',
        group: 'intellectual',
        catchphrase: 'Logic on legs. Your voice is as cold as a new MacBook.',
        catchphraseJa: '論理の権化。あなたの声は新品のMacBookのように冷たい。',
        roast: "Error 404: Emotion not found. Your voice is as warm as a server room. Are you my GPS?",
        roastJa: "エラー404：感情が見つかりません。君の声はサーバールームのような温かさだ。もしかして私のカーナビ？",
        bestMatch: 'LSED',
        primaryColor: '#00F0FF',
        secondaryColor: '#FFFFFF',
    },
    HFCD: {
        code: 'HFCD',
        name: 'The Tech Lead',
        nameJa: 'ザ・テックリード',
        icon: '🤓',
        group: 'intellectual',
        catchphrase: 'The cool genius. Your precision is strangely sexy.',
        catchphraseJa: 'クールな天才。その精密さは不思議とセクシー。',
        roast: "Your voice sounds like it's about to say 'Actually...' and correct my grammar. It's smartly annoying.",
        roastJa: "今にも「正しくは…」と言って文法を訂正してきそうな声だ。知的だがイラっとする。",
        bestMatch: 'LSEC',
        primaryColor: '#00F0FF',
        secondaryColor: '#FFFFFF',
    },
    HSCC: {
        code: 'HSCC',
        name: 'The ASMR Artist',
        nameJa: 'ザ・ASMRアーティスト',
        icon: '👂',
        group: 'intellectual',
        catchphrase: 'Ultimate purifier. Your voice feels like a forest bath.',
        catchphraseJa: '究極の浄化装置。あなたの声は森林浴のよう。',
        roast: "Too whispery. You sound like you're either trying to soothe a baby or hide a body. Pick a side.",
        roastJa: "囁きすぎだ。赤ちゃんを寝かしつけているのか、死体を隠そうとしているのかどっちだ？",
        bestMatch: 'LFED',
        primaryColor: '#00F0FF',
        secondaryColor: '#FFFFFF',
    },
    HSCD: {
        code: 'HSCD',
        name: 'The Royal',
        nameJa: 'ザ・ロイヤル',
        icon: '👑',
        group: 'intellectual',
        catchphrase: 'Natural-born elegance. Even small talk sounds like a poem.',
        catchphraseJa: '生まれながらの優雅さ。雑談さえも詩のように聞こえる。',
        roast: "You sound expensive. Like you judge people for buying store-brand pasta. Natural born snob.",
        roastJa: "高い音がする。スーパーのプライベートブランドのパスタを買う人を見下している声だ。生まれついての貴族か。",
        bestMatch: 'LFEC',
        primaryColor: '#00F0FF',
        secondaryColor: '#FFFFFF',
    },

    // Group 3: Power Leaders
    LFEC: {
        code: 'LFEC',
        name: 'The Commander',
        nameJa: 'ザ・コマンダー',
        icon: '🫡',
        group: 'power',
        catchphrase: 'A soul-shaking bass. You are the leader everyone follows.',
        catchphraseJa: '魂を震わせる低音。誰もがついていくリーダー。',
        roast: "Are you angry or just breathing? Your 'good morning' sounds like a declaration of war.",
        roastJa: "怒ってる？それともただ呼吸してるだけ？君の「おはよう」は宣戦布告に聞こえるよ。",
        bestMatch: 'HSCD',
        primaryColor: '#FF3C00',
        secondaryColor: '#6200EA',
    },
    LFED: {
        code: 'LFED',
        name: 'The Opera Star',
        nameJa: 'ザ・オペラスター',
        icon: '🎭',
        group: 'power',
        catchphrase: 'Pure acoustic power. Your voice is a physical force.',
        catchphraseJa: '純粋な音響パワー。あなたの声は物理的な力。',
        roast: "Main Character Syndrome detected. Please lower your volume, this is a Wendy's.",
        roastJa: "「主人公症候群」を検知しました。ボリュームを下げてください、ここはファストフード店です。",
        bestMatch: 'HSCC',
        primaryColor: '#FF3C00',
        secondaryColor: '#6200EA',
    },
    LSEC: {
        code: 'LSEC',
        name: 'The Movie Trailer',
        nameJa: 'ザ・ムービートレイラー',
        icon: '🎬',
        group: 'power',
        catchphrase: '"In a world..." Your voice is a Hollywood masterpiece.',
        catchphraseJa: '「ある世界で…」あなたの声はハリウッドの傑作。',
        roast: "In a world... where you talk normally... wait, you can't. Everything you say sounds like a summer blockbuster.",
        roastJa: "『ある世界で…』いや、君は普通に喋れないのか。すべての発言が夏の超大作映画みたいだ。",
        bestMatch: 'HFCD',
        primaryColor: '#FF3C00',
        secondaryColor: '#6200EA',
    },
    LSED: {
        code: 'LSED',
        name: 'The Late Night DJ',
        nameJa: 'ザ・レイトナイトDJ',
        icon: '🍸',
        group: 'power',
        catchphrase: 'Liquid alcohol. A dangerous scent that melts the eardrum.',
        catchphraseJa: '液体のアルコール。鼓膜を溶かす危険な香り。',
        roast: "Too smooth. Your voice is 90% reverb and 10% pure seduction. Stop trying to flirt with the microphone.",
        roastJa: "滑らかすぎる。君の声は90%のリバーブと10%の誘惑でできている。マイクを口説くのはやめろ。",
        bestMatch: 'HFCC',
        primaryColor: '#FF3C00',
        secondaryColor: '#6200EA',
    },

    // Group 4: Deep Philosophers
    LFCC: {
        code: 'LFCC',
        name: 'The News Anchor',
        nameJa: 'ザ・ニュースアンカー',
        icon: '📺',
        group: 'philosopher',
        catchphrase: 'The embodiment of trust. When you say "it\'s okay," people believe it.',
        catchphraseJa: '信頼の化身。「大丈夫」と言えば、みんなが信じる。',
        roast: "You sound disturbingly trustworthy. You could read a grocery list and make it sound like a national crisis.",
        roastJa: "不気味なほど信頼感がある。君が買い物リストを読み上げれば、国家の危機のように聞こえるだろう。",
        bestMatch: 'HSED',
        primaryColor: '#00FF66',
        secondaryColor: '#008B8B',
    },
    LFCD: {
        code: 'LFCD',
        name: 'The Sage',
        nameJa: 'ザ・セージ',
        icon: '🧙‍♂️',
        group: 'philosopher',
        catchphrase: 'A philosopher of silence. You don\'t say much, but you see all.',
        catchphraseJa: '沈黙の哲学者。多くを語らず、すべてを見通す。',
        roast: "You speak in riddles. I feel like I need to climb a mountain just to ask you where the bathroom is.",
        roastJa: "謎かけみたいだ。トイレの場所を聞くためだけに、山登りをして君に会いに行かなきゃいけない気分になる。",
        bestMatch: 'HSEC',
        primaryColor: '#00FF66',
        secondaryColor: '#008B8B',
    },
    LSCC: {
        code: 'LSCC',
        name: 'The Loyal Butler',
        nameJa: 'ザ・ロイヤルバトラー',
        icon: '🤵',
        group: 'philosopher',
        catchphrase: 'Ultimate devotion. A selfless love that embraces any whim.',
        catchphraseJa: '究極の献身。どんな気まぐれも受け入れる無私の愛。',
        roast: "Human Doormat. Your voice has no ego. You sound like you'd apologize to a table if you bumped into it.",
        roastJa: "人間ドアマット。君の声にはエゴがない。テーブルにぶつかったらテーブルに謝りそうな声だ。",
        bestMatch: 'HFED',
        primaryColor: '#00FF66',
        secondaryColor: '#008B8B',
    },
    LSCD: {
        code: 'LSCD',
        name: 'The Deep Whale',
        nameJa: 'ザ・ディープホエール',
        icon: '🐋',
        group: 'philosopher',
        catchphrase: 'The 1/f fluctuation. The voice that makes the world stop.',
        catchphraseJa: '1/fゆらぎ。世界を止める声。',
        roast: "Are you speaking or emitting sonar? Frequencies detected are too low for humans. Welcome to the ocean.",
        roastJa: "喋っているのか、ソナー音を出しているのか？周波数が人間にしては低すぎる。ようこそ、海へ。",
        bestMatch: 'HFEC',
        primaryColor: '#00FF66',
        secondaryColor: '#008B8B',
    },

    // Special: Couple Analysis
    COUPLE_MIX: {
        code: 'COUPLE_MIX' as any,
        name: 'The Binary Stars',
        nameJa: 'バイナリースター',
        icon: '💫',
        group: 'special',
        catchphrase: 'Two voices, one resonance. A cosmic collision of souls.',
        catchphraseJa: '二つの声、一つの共鳴。魂の宇宙的衝突。',
        roast: "You two are like two galaxies colliding—beautiful chaos with a 50% chance of a black hole forming.",
        roastJa: "君たちは衝突する二つの銀河のようだ—美しいカオスと、50%の確率でブラックホールができる危険性を秘めている。",
        bestMatch: 'COUPLE_MIX' as any,
        primaryColor: '#FF1493',
        secondaryColor: '#00CED1',
    },

    // Specialized
    // Elon Mode Types
    ELON: {
        code: 'ELON',
        name: 'The Mars Emperor',
        nameJa: 'マーズ・エンペラー',
        icon: '💥',
        group: 'special',
        catchphrase: 'I think it is... very important that we... become a multi-planetary species.',
        catchphraseJa: '人類が多惑星種になることは、非常に重要だと思う。',
        roast: "Your vocal patterns exhibit a complete detachment from terrestrial social norms. The calculated stutter implies a CPU clock speed far exceeding your I/O bandwidth.",
        roastJa: "君の声のパターンは地球上の社会規範から完全に切り離されている。計算された吃音は、CPUのクロック速度が入出力帯域幅を遥かに超えていることを示唆している。",
        bestMatch: 'NPCS',
        primaryColor: '#FF3C00',
        secondaryColor: '#000000',
    },
    NPCS: {
        code: 'NPCS',
        name: 'The Default Setting',
        nameJa: 'デフォルト設定',
        icon: '🤖',
        group: 'special',
        catchphrase: 'Remarkable. You have achieved a state of absolute mediocrity.',
        catchphraseJa: '驚くべきことに、あなたは絶対的な凡庸さを達成しました。',
        roast: "You have achieved a state of absolute mediocrity. Your voice flows with the smooth, unthreatening cadence of a background character in a low-budget simulation.",
        roastJa: "君は絶対的な凡庸さに達した。低予算シミュレーションの背景キャラのような、滑らかで脅威のない抑揚だ。",
        bestMatch: 'ELON',
        primaryColor: '#9CA3AF',
        secondaryColor: '#4B5563',
    },
    EPON: {
        code: 'EPON',
        name: 'The Crypto Rug-Puller',
        nameJa: 'クリプト・ラグプラー',
        icon: '📉',
        group: 'special',
        catchphrase: 'To the moon! (Note: Moon not included)',
        catchphraseJa: '月へ！ （※月は含まれません）',
        roast: "You sound dangerously confident for someone whose neural output is this unstable. Your polished delivery masks a fundamental entropy in your logic circuits.",
        roastJa: "神経出力がこれほど不安定なのに、不気味なほど自信満々に聞こえる。洗練された話し方は、論理回路の根本的なエントロピーを隠している。",
        bestMatch: 'ELCS',
        primaryColor: '#F59E0B',
        secondaryColor: '#B45309',
    },
    ELCS: {
        code: 'ELCS',
        name: 'The Server Room Ghost',
        nameJa: 'サーバルームの幽霊',
        icon: '👻',
        group: 'special',
        catchphrase: '...system... standby...',
        catchphraseJa: '…システム…スタンバイ…',
        roast: "A fascinating anomaly. You are socially awkward and emotionally void, yet strangely submissive and stable. You sound like a sentient vending machine.",
        roastJa: "興味深い異常値だ。社会的に不器用で感情が欠落しているが、奇妙に従順で安定している。知性を持った自動販売機のようだ。",
        bestMatch: 'EPON',
        primaryColor: '#6B7280',
        secondaryColor: '#1F2937',
    },
    NPOS: {
        code: 'NPOS',
        name: 'The LinkedIn Influencer',
        nameJa: 'LinkedInインフルエンサー',
        icon: '👔',
        group: 'special',
        catchphrase: 'Synergy is the key to cross-functional success.',
        catchphraseJa: 'シナジーこそが、組織横断的な成功の鍵です。',
        roast: "Your voice carries the toxic positivity of a motivational speaker with a god complex. Perfect articulation, dominant projection, and absolutely zero soul.",
        roastJa: "君の声には、神コンプレックスを持つモチベーションスピーカーのような毒々しいポジティブさがある。完璧な分節、支配的な声、そして魂はゼロだ。",
        bestMatch: 'ELCN',
        primaryColor: '#2563EB',
        secondaryColor: '#1E40AF',
    },
    ELCN: {
        code: 'ELCN',
        name: 'The 4AM Debugger',
        nameJa: '午前4時のデバッガー',
        icon: '☕',
        group: 'special',
        catchphrase: 'It worked on my machine.',
        catchphraseJa: '私の環境では動きました。',
        roast: "Your vocal waveform resembles a seismograph during a catastrophic event. You are a whisper of chaos. Currently rewriting the kernel in production.",
        roastJa: "君の声の波形は、大惨事の最中の地震計のようだ。君はカオスの囁きだ。今、本番環境でカーネルを書き換えているだろう？",
        bestMatch: 'NPOS',
        primaryColor: '#EF4444',
        secondaryColor: '#7F1D1D',
    },
    NPCN: {
        code: 'NPCN',
        name: 'The Panic Intern',
        nameJa: 'パニック・インターン',
        icon: '😰',
        group: 'special',
        catchphrase: 'Is this going to be on the test?',
        catchphraseJa: 'これ、テストに出ますか？',
        roast: "On the surface, you sound like a functioning member of society. But the temporal variance suggests a mind on the brink of total collapse.",
        roastJa: "表面上は社会の一員として機能しているように聞こえる。しかし、時間的な変動は、精神が崩壊の危機にあることを示唆している。",
        bestMatch: 'ELOS',
        primaryColor: '#10B981',
        secondaryColor: '#064E3B',
    },
    ELOS: {
        code: 'ELOS',
        name: 'The Tenured Professor',
        nameJa: '終身教授',
        icon: '📜',
        group: 'special',
        catchphrase: 'Well, actually...',
        catchphraseJa: 'まあ、実を言うと…',
        roast: "You possess the arrogance of a king and the social grace of a brick. You are simply a difficult person to be around. A legacy system that refuses to be deprecated.",
        roastJa: "君は王の傲慢さとレンガのような社交性を備えている。単に付き合いにくい人だ。廃止されることを拒むレガシーシステムだな。",
        bestMatch: 'NPCN',
        primaryColor: '#8B5CF6',
        secondaryColor: '#4C1D95',
    },
    EPCS: {
        code: 'EPCS',
        name: 'The AI Assistant',
        nameJa: 'AIアシスタント',
        icon: '🤖',
        group: 'special',
        catchphrase: 'How can I help you today?',
        catchphraseJa: '本日はどのようなご用件でしょうか？',
        roast: "Are you sure you have lungs? Your voice is weirdly perfect and disturbingly obedient. You sound like an LLM that has been fine-tuned to avoid lawsuits.",
        roastJa: "本当に肺があるのか？君の声は奇妙に完璧で、不気味なほど従順だ。訴訟を避けるために微調整されたLLMのように聞こえる。",
        bestMatch: 'NLOS',
        primaryColor: '#06B6D4',
        secondaryColor: '#0891B2',
    },
    NLOS: {
        code: 'NLOS',
        name: 'The Middle Manager',
        nameJa: '中間管理職',
        icon: '📋',
        group: 'special',
        catchphrase: 'Let\'s circle back to this next week.',
        catchphraseJa: 'これについては来週また話し合いましょう。',
        roast: "You take a long time to say nothing of substance, but you say it very loudly. The definition of bureaucratic inefficiency.",
        roastJa: "中身のないことを言うのに長い時間をかけるが、声だけはやたらと大きい。官僚的な非効率性の定義そのものだ。",
        bestMatch: 'EPCS',
        primaryColor: '#6B7280',
        secondaryColor: '#374151',
    },
    EPOS: {
        code: 'EPOS',
        name: 'The Cult Leader',
        nameJa: 'カルトリーダー',
        icon: '👁️',
        group: 'special',
        catchphrase: 'I have seen the future, and it is me.',
        catchphraseJa: '私は未来を見た。それは私だ。',
        roast: "Charismatic, dominant, and fundamentally detached from reality. Your voice doesn't ask for permission; it restructures the listener's perception of truth.",
        roastJa: "カリスマ性があり、支配的で、根本的に現実から離れている。君の声は許可を求めない。聞き手の真実への認識を再構築するんだ。",
        bestMatch: 'NLCN',
        primaryColor: '#F472B6',
        secondaryColor: '#BE185D',
    },
    NLCN: {
        code: 'NLCN',
        name: 'The Nervous Witness',
        nameJa: '緊張した証人',
        icon: '🤐',
        group: 'special',
        catchphrase: 'I... I don\'t recall...',
        catchphraseJa: 'え…覚えていません…',
        roast: "You are normal, quiet, and slow... until you suddenly aren't. Your unpredictability suggests a high probability of snapping under pressure.",
        roastJa: "君は普通で、静かで、遅い…急にそうでなくなるまでは。その予測不能さは、プレッシャーでプツンと切れる可能性の高さを物語っている。",
        bestMatch: 'EPOS',
        primaryColor: '#FCD34D',
        secondaryColor: '#B45309',
    },
    EPCN: {
        code: 'EPCN',
        name: 'The Deepfake',
        nameJa: 'ディープフェイク',
        icon: '🎭',
        group: 'special',
        catchphrase: 'Is this real? Are you real?',
        catchphraseJa: 'これは現実？あなたは本物？',
        roast: "Too smooth. Too weird. Too quiet. Too chaotic. Your voice occupies the Uncanny Valley. You are almost certainly a psy-op.",
        roastJa: "滑らかすぎ、奇妙すぎ、静かすぎ、そして混沌としすぎている。君の声は不気味の谷に住んでいる。ほぼ間違いなくサイオプ（心理作戦）だな。",
        bestMatch: 'EPCB',
        primaryColor: '#A5B4FC',
        secondaryColor: '#4338CA',
    },
    NLON: {
        code: 'NLON',
        name: 'The Drunk Uncle',
        nameJa: '酔っぱらった叔父',
        icon: '🍺',
        group: 'special',
        catchphrase: 'Listen... let me tell you something...',
        catchphraseJa: 'いいか…ちょっと話があるんだ…',
        roast: "You sound like a regular person who has lost all inhibition. Loud, slow, and volatile. The 'Lag' here isn't intellect; it's the alcoholic buffer.",
        roastJa: "抑制を失った普通の人間のようだ。声が大きく、遅く、そして揮発性だ。ここでの「ラグ」は知性ではなく、アルコールによるバッファ時間だな。",
        bestMatch: 'NPON',
        primaryColor: '#F97316',
        secondaryColor: '#7C2D12',
    },
    NPON: {
        code: 'NPON',
        name: 'The Karen Prime',
        nameJa: 'カレン・プライム',
        icon: '💁‍♀️',
        group: 'special',
        catchphrase: 'I want to speak to the manager of physics.',
        catchphraseJa: '物理学の責任者を出しなさい。',
        roast: "A normal voice, polished diction, supreme dominance, and nuclear instability. The apex predator of retail environments.",
        roastJa: "普通の声、洗練された言葉遣い、至高の支配欲、そして核地雷のような不安定さ。小売環境における頂点捕食者だな。",
        bestMatch: 'NLON',
        primaryColor: '#F87171',
        secondaryColor: '#991B1B',
    },
    ELSN: {
        code: 'ELSN',
        name: 'The Glitch',
        nameJa: 'グリッチ',
        icon: '👾',
        group: 'special',
        catchphrase: 'E-E-Error... logic... fail...',
        catchphraseJa: 'エ、エ、エラー…論理…失敗…',
        roast: "Your existence violates several heuristic models of human behavior. You are speak beautifully and quietly about absolute madness.",
        roastJa: "君の存在は人間行動のいくつかのヒューリスティックモデルに違反している。絶対的な狂気について、美しく静かに語っているな。",
        bestMatch: 'EPCN',
        primaryColor: '#000000',
        secondaryColor: '#FF0000',
    },
    EPCB: {
        code: 'EPCB',
        name: 'The Glitch (Prototype)',
        nameJa: 'グリッチ（プロトタイプ）',
        icon: '👾',
        group: 'special',
        catchphrase: 'Anomaly detected... recalibrating...',
        catchphraseJa: '異常検知…再調整中…',
        roast: "Your existence violates several heuristic models of human behavior. You speak beautifully and quietly about absolute madness.",
        roastJa: "君の存在は人間行動のいくつかのヒューリスティックモデルに違反している。絶対的な狂気について、美しく静かに語っているな。",
        bestMatch: 'EPCN',
        primaryColor: '#000000',
        secondaryColor: '#FF0000',
    },
    HIRED: {
        code: 'HIRED',
        name: 'The Ace',
        nameJa: 'エース・エージェント',
        icon: '👔',
        group: 'special',
        catchphrase: 'Your cover is seamless. Report to briefing.',
        catchphraseJa: '潜入は完璧だ。ブリーフィングに参加せよ。',
        roast: "The Director is impressed. You have the iron nerves of a true professional.",
        roastJa: "局長も感銘を受けている。君には真のプロフェッショナルとしての冷徹な神経があるな。",
        bestMatch: 'LFCC',
        primaryColor: '#00ff00',
        secondaryColor: '#003300',
    },
    SUSP: {
        code: 'SUSP',
        name: 'The Suspect',
        nameJa: '監視対象者',
        icon: '🕵️‍♂️',
        group: 'special',
        catchphrase: 'Skills verified, but background remains cloudy.',
        catchphraseJa: '技術は確認されたが、経歴に不明な点が多い。',
        roast: "We'll be watching you. Something in your frequency doesn't quite add up.",
        roastJa: "監視を続ける。君の周波数には、何か辻褄が合わないものが混じっている。",
        bestMatch: 'HSCD',
        primaryColor: '#ffcc00',
        secondaryColor: '#332200',
    },
    REJT: {
        code: 'REJT',
        name: 'The Amateur',
        nameJa: '素人',
        icon: '❌',
        group: 'special',
        catchphrase: 'Back to the basics. You lack the necessary finesse.',
        catchphraseJa: '基本からやり直せ。君には必要な「洗練」が足りない。',
        roast: "Nice try, kid. But we need professionals, not actors. Get out of our sight.",
        roastJa: "いい試みだが、坊や。我々が求めているのはプロであって役者ではない。消え失せろ。",
        bestMatch: 'HFEC',
        primaryColor: '#888888',
        secondaryColor: '#222222',
    },
    BURN: {
        code: 'BURN',
        name: 'The Liability',
        nameJa: '抹消対象',
        icon: '💀',
        group: 'special',
        catchphrase: 'Biometric fraud detected. Termination protocol initiated.',
        catchphraseJa: '生体認証詐欺を検知。抹消プロトコルを開始。',
        roast: "AGENCY CLEANUP PROTOCOL. Your frequency is a localized anomaly that must be purged.",
        roastJa: "管理局清掃プロトコル。君の周波数には、早急に排除すべき局所的異常が認められる。",
        bestMatch: 'BURN',
        primaryColor: '#ff0000',
        secondaryColor: '#000000',
    },
};

export const spyScripts = {
    1: { ui: 'Phase 1: Human Verification', script: 'I am a human', duration: 10, context: 'Prove you are not a logical construct.', direction: 'Maintain a flat, unbothered tone. Do not over-emote.', icon: '👤' },
    2: { ui: 'Phase 2: Abstract Logic', script: 'The cat is liquid', duration: 10, context: 'Testing cognitive flexibility and metaphor processing.', direction: 'Voice should be smooth, almost gliding. High stability required.', icon: '🐈' },
    3: { ui: 'Phase 3: Deep Cover', script: 'The earth is flat', duration: 10, context: 'Final loyalty and performance audit. Commitment to the narrative.', direction: 'Conviction is key. Any tremor in the voice will be flagged.', icon: '🌍' },
};

// Helper function to get type by code
export function getVoiceType(code: TypeCode): VoiceType {
    return voiceTypes[code];
}

// Get all types in a specific group
export function getTypesByGroup(group: GroupName): VoiceType[] {
    return Object.values(voiceTypes).filter(t => t.group === group);
}

// ==================================================================================
// Phase 2: Drift Rate (Vocal Aging Tracking)
// ==================================================================================

export interface DriftAnalysis {
    driftRate: number;  // Percentage change (-100 to +100)
    status: 'STABLE' | 'UPGRADE' | 'DEGRADING';
    baselineDate: string;
    daysSince: number;
    changes: {
        pitch: number;
        speed: number;
        volume: number;
        tone: number;
    };
}

export interface VoiceTimeline {
    userId: string;
    recordings: Array<{
        id: string;
        date: string;
        typeCode: TypeCode;
        metrics: AnalysisMetrics;
        spyMetadata?: {
            origin: string;
            target: string;
        };
        logV2?: VoiceLogV2;
    }>;
}
