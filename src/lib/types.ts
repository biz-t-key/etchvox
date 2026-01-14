// Voice Type Definitions for EtchVox
// 16 Types based on 4 axes: Pitch, Speed, Vibe, Tone

export type TypeCode =
    | 'HFEC' | 'HFED' | 'HSEC' | 'HSED'  // High-Energy Idols
    | 'HFCC' | 'HFCD' | 'HSCC' | 'HSCD'  // Intellectual Artists
    | 'LFEC' | 'LFED' | 'LSEC' | 'LSED'  // Power Leaders
    | 'LFCC' | 'LFCD' | 'LSCC' | 'LSCD'; // Deep Philosophers

export type GroupName = 'idol' | 'intellectual' | 'power' | 'philosopher';

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
}

export interface AnalysisResult {
    typeCode: TypeCode;
    metrics: AnalysisMetrics;
}

// Color palettes by group
export const groupColors: Record<GroupName, { primary: string; secondary: string }> = {
    idol: { primary: '#FF00CC', secondary: '#FFD700' },
    intellectual: { primary: '#00F0FF', secondary: '#FFFFFF' },
    power: { primary: '#FF3C00', secondary: '#6200EA' },
    philosopher: { primary: '#00FF66', secondary: '#008B8B' },
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
};

// Helper function to get type by code
export function getVoiceType(code: TypeCode): VoiceType {
    return voiceTypes[code];
}

// Get all types in a specific group
export function getTypesByGroup(group: GroupName): VoiceType[] {
    return Object.values(voiceTypes).filter(t => t.group === group);
}
