// Solo Identity Matrix: 256 unique combinations of MBTI × Voice Type
// Brand: EtchVox
// "MBTI is who you think you are. EtchVox is who you sound like."

import { TypeCode } from './types';
import { MBTIType } from './mbti';

export interface SoloIdentity {
    mbti: MBTIType;
    voiceType: TypeCode;
    brandName: string;
    roast: string;
}

// Voice Type Traits for dynamic generation
const voiceTraits: Record<TypeCode, { adj: string; noun: string; vibe: string; roastFragment: string }> = {
    HFEC: { adj: "Electric", noun: "Idol", vibe: "High Energy", roastFragment: "you sound like a chaotic anime protagonist" },
    HFED: { adj: "Dramatic", noun: "Diva", vibe: "Theatrical", roastFragment: "your voice demands a spotlight even in a dark room" },
    HSEC: { adj: "Magnetic", noun: "Influencer", vibe: "Charming", roastFragment: "you could sell ice to a polar bear" },
    HSED: { adj: "Radioactive", noun: "Star", vibe: "Explosive", roastFragment: "you have zero indoor voice and zero regrets" },
    HFCC: { adj: "Cybernetic", noun: "Android", vibe: "Neon", roastFragment: "you process emotions like a GPU processes textures" },
    HFCD: { adj: "Glitched", noun: "Hacker", vibe: "Broken Tech", roastFragment: "you sound like a corrupted save file" },
    HSCC: { adj: "Velvet", noun: "Operator", vibe: "Smooth", roastFragment: "you speak in ASMR and secrets" },
    HSCD: { adj: "Imperial", noun: "Royal", vibe: "Commanding", roastFragment: "you don't ask for things, you announce them" },
    LFEC: { adj: "Thunderous", noun: "Titan", vibe: "Heavy", roastFragment: "your voice has its own gravitational pull" },
    LFED: { adj: "Operatic", noun: "Phantom", vibe: "Tragic", roastFragment: "you make ordering pizza sound like a Shakespearean soliloquy" },
    LSEC: { adj: "Cinematic", noun: "Narrator", vibe: "Epic", roastFragment: "you sound like the voiceover for a summer blockbuster" },
    LSED: { adj: "Noir", noun: "Detective", vibe: "Shadowy", roastFragment: "you sound like a monologue in a rain-slicked alleyway" },
    LFCC: { adj: "Absolute", noun: "Monolith", vibe: "Cold", roastFragment: "you deliver facts like a printer delivers paper: flat and necessary" },
    LFCD: { adj: "Abyssal", noun: "Leviathan", vibe: "Deep", roastFragment: "you sound like you're speaking from the bottom of a well" },
    LSCC: { adj: "Iron", noun: "Butler", vibe: "Service", roastFragment: "you are terrifyingly polite and efficient" },
    LSCD: { adj: "Subsonic", noun: "Cryptid", vibe: "Hidden", roastFragment: "your voice is less a sound and more a vibration in the floorboards" },
};

const mbtiThemes: Record<MBTIType, { archetype: string; flaw: string }> = {
    INTJ: { archetype: "Mastermind", flaw: "overthinking" },
    INTP: { archetype: "Architect", flaw: "buffering" },
    ENTJ: { archetype: "Commander", flaw: "dominating" },
    ENTP: { archetype: "Visionary", flaw: "trolling" },
    INFJ: { archetype: "Sage", flaw: "judging" },
    INFP: { archetype: "Dreamer", flaw: "zoning out" },
    ENFJ: { archetype: "Mentor", flaw: "preaching" },
    ENFP: { archetype: "Muse", flaw: "spiraling" },
    ISTJ: { archetype: "Inspector", flaw: "auditing" },
    ISFJ: { archetype: "Protector", flaw: "worrying" },
    ESTJ: { archetype: "Director", flaw: "micromanaging" },
    ESFJ: { archetype: "Provider", flaw: "gossiping" },
    ISTP: { archetype: "Craftsman", flaw: "disassembling" },
    ISFP: { archetype: "Artist", flaw: "sulking" },
    ESTP: { archetype: "Dynamo", flaw: "reckless driving" },
    ESFP: { archetype: "Performer", flaw: "scene-stealing" },
};

export function getSoloIdentity(mbti: MBTIType, voiceType: TypeCode): SoloIdentity {
    const key = `${mbti}_${voiceType}`;

    // 1. Check for manual override (Legacy Data)
    if (soloIdentityMatrix[key]) {
        return soloIdentityMatrix[key];
    }

    // 2. Generate Dynamic Identity
    const vTrait = voiceTraits[voiceType];
    const mTheme = mbtiThemes[mbti];

    // Brand Name Generation: "The [Voice Adjective] [MBTI Archetype]"
    // e.g., "The Electric Mastermind", "The Noir Performer"
    const BrandName = `The ${vTrait.adj} ${mTheme.archetype}`;

    // Roast Generation
    // Logic: Combine MBTI flaw with Voice Type characteristic
    // e.g. "As a [MBTI], you are prone to [flaw], and [voice roast fragment]."

    // Personalized touches based on Voice Group
    let prefix = "";
    if (voiceType.startsWith('H')) {
        prefix = `You have the brain of a ${mbti} but the energy of a nuclear reactor.`;
    } else {
        prefix = `You are a ${mbti} operating in stealth mode.`;
    }

    const Roast = `${prefix} You're constantly ${mTheme.flaw}, and ${vTrait.roastFragment}. It's a dangerous combination.`;

    return {
        mbti,
        voiceType,
        brandName: BrandName,
        roast: Roast
    };
}

const soloIdentityMatrix: Record<string, SoloIdentity> = {
    // I. Analysts (NT) Group - INTJ
    INTJ_HFEC: { mbti: 'INTJ', voiceType: 'HFEC', brandName: 'The Rave Scholar', roast: "You’re attempting to explain the Heat Death of the Universe in a mosh pit, but your voice is so neon that everyone just thinks you’re asking where the MDMA is." },
    INTJ_HFED: { mbti: 'INTJ', voiceType: 'HFED', brandName: 'The Cynical Cheerleader', roast: "You’re shouting for the team, but your subtext is a 45-minute lecture on why sports are a bread-and-circus distraction for the masses." },
    INTJ_HSEC: { mbti: 'INTJ', voiceType: 'HSEC', brandName: 'The Strategic Sunshine', roast: "You have the mind of a grandmaster and the voice of a puppy; you’re basically a nuclear silo disguised as a petting zoo." },
    INTJ_HSED: { mbti: 'INTJ', voiceType: 'HSED', brandName: 'The Narcissistic Oracle', roast: "You claim to seek the Truth, but your frequency suggests you’re mostly seeking a higher engagement rate for your existential dread." },
    INTJ_HFCC: { mbti: 'INTJ', voiceType: 'HFCC', brandName: 'The Pure Logic', roast: "Your voice is the acoustic equivalent of a white wall in a windowless room; you’ve successfully optimized all human 'texture' out of your existence." },
    INTJ_HFCD: { mbti: 'INTJ', voiceType: 'HFCD', brandName: 'The Master Architect', roast: "You sound like a compiler that has gained sentience and is very, very disappointed in its creator's messy life-code." },
    INTJ_HSCC: { mbti: 'INTJ', voiceType: 'HSCC', brandName: 'The Whispering Plotter', roast: "You describe your plans for global domination with the gentleness of a bedtime story; it’s the most polite psychological warfare I’ve ever heard." },
    INTJ_HSCD: { mbti: 'INTJ', voiceType: 'HSCD', brandName: 'The Hidden Emperor', roast: "You’ve renounced the world, but your vocal resonance still demands that everyone bows when you ask for the Wi-Fi password." },
    INTJ_LFEC: { mbti: 'INTJ', voiceType: 'LFEC', brandName: 'The Absolute Dictator', roast: "You don't talk, you annex conversation; you’re a one-man geopolitical crisis with an incredibly high IQ." },
    INTJ_LFED: { mbti: 'INTJ', voiceType: 'LFED', brandName: 'The Tragic Genius', roast: "Every mundane thought you have is delivered with the lung capacity of a dying Viking hero; it’s a lot of drama for a Tuesday morning." },
    INTJ_LSEC: { mbti: 'INTJ', voiceType: 'LSEC', brandName: 'The False Epic', roast: "You speak in 'In a World...' tropes, making your trip to the grocery store sound like a Christopher Nolan finale." },
    INTJ_LSED: { mbti: 'INTJ', voiceType: 'LSED', brandName: 'The Noir Philosopher', roast: "You sound like a man smoking a cigarette in the rain while explaining why free will is an illusion. Very aesthetic, very depressing." },
    INTJ_LFCC: { mbti: 'INTJ', voiceType: 'LFCC', brandName: 'The Cold Fact', roast: "You report your own feelings as if they were verified international news; you’re an objective observer of your own ego." },
    INTJ_LFCD: { mbti: 'INTJ', voiceType: 'LFCD', brandName: 'The Deep Hermit', roast: "You’ve spent so much time in the abyss that your voice has become a low-frequency hum that vibrates in people's insecurities." },
    INTJ_LSCC: { mbti: 'INTJ', voiceType: 'LSCC', brandName: 'The Tactical Servant', roast: "You serve your own intellect with such precision that you’ve become a high-end valet for a ghost." },
    INTJ_LSCD: { mbti: 'INTJ', voiceType: 'LSCD', brandName: 'The Sunken Brain', roast: "Your thoughts are so heavy they’ve reached the bottom of the ocean, and your voice is just the crushing pressure of the water above them." },

    // INTP: The Logician
    INTP_HFEC: { mbti: 'INTP', voiceType: 'HFEC', brandName: 'The Glitched Idol', roast: "You are a scientific calculator wearing a sequin dress; you’re emitting 10,000 lumens of charisma, but your eyes are still running a diagnostic on the crowd." },
    INTP_HFED: { mbti: 'INTP', voiceType: 'HFED', brandName: 'The Error Code', roast: "You’re trying to be enthusiastic, but your vocal energy is just a blue-screen-of-death screaming for a reboot." },
    INTP_HSEC: { mbti: 'INTP', voiceType: 'HSEC', brandName: 'The Accidental Joy', roast: "You hate people on principle, but your voice is so naturally charming that strangers keep trying to tell you their life stories." },
    INTP_HSED: { mbti: 'INTP', voiceType: 'HSED', brandName: 'The Meta-Ego', roast: "You’ve deconstructed the 'self' so many times that your voice is now just a curated collection of ironies and high-definition emptiness." },
    INTP_HFCC: { mbti: 'INTP', voiceType: 'HFCC', brandName: 'The Ghost in the Shell', roast: "Your personality is a 404 error page written in perfect C++; you’ve optimized your soul into a very efficient void." },
    INTP_HFCD: { mbti: 'INTP', voiceType: 'HFCD', brandName: 'The Human Algorithm', roast: "You don’t have conversations; you have peer-review sessions. You’re a bug-report disguised as a person." },
    INTP_HSCC: { mbti: 'INTP', voiceType: 'HSCC', brandName: 'The Brain Static', roast: "Your subconscious thoughts are leaking out as a soothing white noise; you’re basically a very smart humidifier." },
    INTP_HSCD: { mbti: 'INTP', voiceType: 'HSCD', brandName: 'The Exiled King', roast: "You possess the intellect of a monarch but the social grace of a cave-dwelling mathematician; you’re ruling a kingdom of one." },
    INTP_LFEC: { mbti: 'INTP', voiceType: 'LFEC', brandName: 'The Passive Aggressor', roast: "You refuse to lead, yet you issue 'constructive feedback' with the authority of a military tribunal." },
    INTP_LFED: { mbti: 'INTP', voiceType: 'LFED', brandName: 'The Mental Drama', roast: "Your internal logic is a grand tragedy, but the only person in the audience is your cat." },
    INTP_LSEC: { mbti: 'INTP', voiceType: 'LSEC', brandName: 'The Concept Teaser', roast: "You speak in high-concept riddles that suggest a masterpiece is coming, but the premiere has been delayed for fifteen years." },
    INTP_LSED: { mbti: 'INTP', voiceType: 'LSED', brandName: 'The Lo-Fi Thinker', roast: "You sound like a 2 AM Reddit thread about simulation theory set to a jazzy, repetitive beat." },
    INTP_LFCC: { mbti: 'INTP', voiceType: 'LFCC', brandName: 'The Dry Bulletin', roast: "You deliver your complex theories with the enthusiasm of a stock market report; you’re boring the universe to tears." },
    INTP_LFCD: { mbti: 'INTP', voiceType: 'LFCD', brandName: 'The Digital Monk', roast: "You’ve achieved enlightenment via Wikipedia and dark-mode IDEs; you’re a sage with a very high screen-time average." },
    INTP_LSCC: { mbti: 'INTP', voiceType: 'LSCC', brandName: 'The Logic Slave', roast: "Your voice is a perfectly subservient tool for your brain; unfortunately, your brain is a very demanding master." },
    INTP_LSCD: { mbti: 'INTP', voiceType: 'LSCD', brandName: 'The Infinite Loop', roast: "You’ve dived so deep into your own thoughts that you forgot how to breathe at the surface; you’re just a slow, heavy vibration in the dark." },

    // ENTJ: The Commander
    ENTJ_HFEC: { mbti: 'ENTJ', voiceType: 'HFEC', brandName: 'The Charismatic Tyrant', roast: "You’re a cult leader in the making; you sell world domination like it’s a catchy summer hit." },
    ENTJ_HFED: { mbti: 'ENTJ', voiceType: 'HFED', brandName: 'The Propaganda Chief', roast: "You don't motivate people; you weaponize their enthusiasm for your own quarterly goals." },
    ENTJ_HSEC: { mbti: 'ENTJ', voiceType: 'HSEC', brandName: 'The Iron Puppy', roast: "You fire people with the efficiency of a CEO and then immediately ask for a belly rub; your need for validation is exhausting." },
    ENTJ_HSED: { mbti: 'ENTJ', voiceType: 'HSED', brandName: 'The Public Figure', roast: "You’ve successfully branded your thirst for power as 'leadership coaching.' Your voice is a high-gloss LinkedIn post." },
    ENTJ_HFCC: { mbti: 'ENTJ', voiceType: 'HFCC', brandName: 'The Efficient Executor', roast: "You are a guillotine with an integrated spreadsheet; you cut through human mess with zero friction and zero pulse." },
    ENTJ_HFCD: { mbti: 'ENTJ', voiceType: 'HFCD', brandName: 'The CTO (Chief Terror Officer)', roast: "You manage the office like a server farm; you have zero tolerance for 'emotional latency' in your staff." },
    ENTJ_HSCC: { mbti: 'ENTJ', voiceType: 'HSCC', brandName: 'The Velvet Dictator', roast: "You issue orders so softly that people don't realize they've been conquered until they're already wearing your uniform." },
    ENTJ_HSCD: { mbti: 'ENTJ', voiceType: 'HSCD', brandName: 'The Crown Prince', roast: "You speak as if the air around you should be grateful for the privilege of carrying your commands." },
    ENTJ_LFEC: { mbti: 'ENTJ', voiceType: 'LFEC', brandName: 'The Absolute Leader', roast: "Your voice is a blunt force object; you don't use words to communicate, you use them to occupy territory." },
    ENTJ_LFED: { mbti: 'ENTJ', voiceType: 'LFED', brandName: 'The Empire Builder', roast: "Your ambition is so grand it requires a three-act structure and a chorus of 50 people just to order a coffee." },
    ENTJ_LSEC: { mbti: 'ENTJ', voiceType: 'LSEC', brandName: 'The Action Protagonist', roast: "You live in a state of perpetual high-stakes tension; even your small talk sounds like a mission briefing." },
    ENTJ_LSED: { mbti: 'ENTJ', voiceType: 'LSED', brandName: 'The Shadow Boss', roast: "You sound like a mob boss who took a mindfulness course—calm, cool, and capable of ending a career in a whisper." },
    ENTJ_LFCC: { mbti: 'ENTJ', voiceType: 'LFCC', brandName: 'The Official Decree', roast: "You report your personal opinions as if they were written in the Constitution; you’re the anchorman of your own reality." },
    ENTJ_LFCD: { mbti: 'ENTJ', voiceType: 'LFCD', brandName: 'The Philosopher King', roast: "You have the power to change the world and the vocabulary to explain why you’re the only one who should do it." },
    ENTJ_LSCC: { mbti: 'ENTJ', voiceType: 'LSCC', brandName: 'The Self-Made Servant', roast: "You are a man who has mastered himself so thoroughly that you’ve become your own most efficient employee." },
    ENTJ_LSCD: { mbti: 'ENTJ', voiceType: 'LSCD', brandName: 'The Nuclear Sub', roast: "You are a massive, hidden engine of power; you don't make noise, you just displace the entire ocean when you move." },

    // ENTP: The Debater
    ENTP_HFEC: { mbti: 'ENTP', voiceType: 'HFEC', brandName: 'The Satirical Idol', roast: "You’re a stand-up comedian who accidentally became famous; you’re mocking the spotlight while standing directly in it." },
    ENTP_HFED: { mbti: 'ENTP', voiceType: 'HFED', brandName: "The Devil's Advocate", roast: "You’re not cheering for the team; you’re cheering for the chaos that ensues when the team loses." },
    ENTP_HSEC: { mbti: 'ENTP', voiceType: 'HSEC', brandName: 'The Mischievous Pup', roast: "You say the most offensive things imaginable, but your voice is so friendly that people just think they misheard you." },
    ENTP_HSED: { mbti: 'ENTP', voiceType: 'HSED', brandName: 'The Viral Contrarian', roast: "Your entire personality is a 'Hot Take' designed to trigger an algorithm. You’re a human clickbait headline." },
    ENTP_HFCC: { mbti: 'ENTP', voiceType: 'HFCC', brandName: 'The Cynical Bot', roast: "You’re a Turing test designed to fail on purpose just to see how the examiner reacts." },
    ENTP_HFCD: { mbti: 'ENTP', voiceType: 'HFCD', brandName: 'The Bug Maker', roast: "You don't build systems; you find the one loose thread that pulls the whole thing apart, and you do it with a smile." },
    ENTP_HSCC: { mbti: 'ENTP', voiceType: 'HSCC', brandName: 'The Whispering Troll', roast: "You have the rare, irritating talent of dismantling someone’s entire worldview in a whisper." },
    ENTP_HSCD: { mbti: 'ENTP', voiceType: 'HSCD', brandName: 'The Anarchist Prince', roast: "You’re using your inherited status to burn down the castle you live in; you’re just a trust-fund kid with a sense of boredom." },
    ENTP_LFEC: { mbti: 'ENTP', voiceType: 'LFEC', brandName: 'The Intellectual Bully', roast: "You treat a casual debate like a war of attrition; you don't want to be right, you want the other person to vanish." },
    ENTP_LFED: { mbti: 'ENTP', voiceType: 'LFED', brandName: 'The Comic Tragedy', roast: "Your life is a high-stakes drama where you’re both the hero and the person sabotaging the hero for a laugh." },
    ENTP_LSEC: { mbti: 'ENTP', voiceType: 'LSEC', brandName: 'The Plot Twist', roast: "You speak in cliffhangers, but most of them lead to a sub-Reddit thread about why you’re wrong." },
    ENTP_LSED: { mbti: 'ENTP', voiceType: 'LSED', brandName: 'The Underground Radio', roast: "You sound like a pirate radio station broadcasting from a bunker—subversive, cool, and probably illegal." },
    ENTP_LFCC: { mbti: 'ENTP', voiceType: 'LFCC', brandName: 'The Sarcastic Truth', roast: "You report the news with an eye-roll that’s audible; you’re the 'Daily Show' of your friend group." },
    ENTP_LFCD: { mbti: 'ENTP', voiceType: 'LFCD', brandName: 'The Crazy Wisdom', roast: "You’re either the smartest person in the room or a complete lunatic; your voice refuses to tell us which." },
    ENTP_LSCC: { mbti: 'ENTP', voiceType: 'LSCC', brandName: 'The Rebellious Valet', roast: "You are perfectly polite while explaining exactly why your boss is an idiot. It’s a work of art." },
    ENTP_LSCD: { mbti: 'ENTP', voiceType: 'LSCD', brandName: 'The Dark Irony', roast: "You’ve found the punchline at the bottom of the ocean, and now you’re just waiting for the rest of the world to drown so they can hear it." },

    // Sample placeholders for other groups to prevent build failure
    INFJ_LFEC: { mbti: 'INFJ', voiceType: 'LFEC', brandName: 'The Moral Crusader', roast: "You're leading a revolution of kindness, but your voice has the cold edge of a guilotine." },
    INFP_LFEC: { mbti: 'INFP', voiceType: 'LFEC', brandName: 'The Iron Lamb', roast: "You try to be a pacifist, but your voice sounds like it's about to annex a small country just for the aesthetic." },
    ISTJ_HFEC: { mbti: 'ISTJ', voiceType: 'HFEC', brandName: 'The Scripted Idol', roast: "You've practiced your spontaneity so much that your 'fun' sounds like a perfectly executed audit." },
    ESFP_LSCD: { mbti: 'ESFP', voiceType: 'LSCD', brandName: 'The Glitter Abyss', roast: "You’re a disco ball dropped into the Mariana Trench—shiny on the surface, but anyone who dives deeper finds a darkness that hasn't seen light in three million years." },
};

export default soloIdentityMatrix;
