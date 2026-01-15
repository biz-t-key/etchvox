import { TypeCode } from './types';
import { MBTIType } from './mbti';

export interface SoloIdentity {
    mbti: MBTIType;
    voiceType: TypeCode;
    brandName: string;
    roast: string;
}

// 1. Fully Specific Data (Legacy/High Quality Roasts)
// Used when available.
const specificIdentities: Record<string, SoloIdentity> = {
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
    ENTJ_HFCD: { mbti: 'ENTJ', voiceType: 'HFCD', brandName: 'The CTO', roast: "You manage the office like a server farm; you have zero tolerance for 'emotional latency' in your staff." },
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
    ENTP_HFED: { mbti: 'ENTP', voiceType: 'HFED', brandName: 'The Devil\'s Advocate', roast: "You’re not cheering for the team; you’re cheering for the chaos that ensues when the team loses." },
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

    // II. Diplomats (NF) Group - INFJ
    INFJ_HFEC: { mbti: 'INFJ', voiceType: 'HFEC', brandName: 'The Messiah Icon', roast: "You’re performing a sold-out show where the only lyrics are your own martyrdom; you’re selling 'saving the world' as a limited-edition merch drop." },
    INFJ_HFED: { mbti: 'INFJ', voiceType: 'HFED', brandName: 'The Spiritual Rally', roast: "You’re trying to manifest a revolution, but your voice is just a high-vibe pyramid scheme for collective enlightenment." },
    INFJ_HSEC: { mbti: 'INFJ', voiceType: 'HSEC', brandName: 'The Holy Puppy', roast: "You have the aura of a saint and the tactical dependency of a newborn; you’re a moral compass that only points toward people who will comfort you." },
    INFJ_HSED: { mbti: 'INFJ', voiceType: 'HSED', brandName: 'The Enlightened Feed', roast: "You’ve curated your 'inner peace' so thoroughly that your voice is now just an aesthetic filter for your own ego-death." },
    INFJ_HFCC: { mbti: 'INFJ', voiceType: 'HFCC', brandName: 'The Stoic Saint', roast: "You’ve automated your empathy to the point of absolute zero; you’re a high-speed processor that only outputs 'deeply concerned' silence." },
    INFJ_HFCD: { mbti: 'INFJ', voiceType: 'HFCD', brandName: 'The Social Architect', roast: "You treat human emotions like a legacy codebase—full of bugs you’re desperate to patch without actually talking to the users." },
    INFJ_HSCC: { mbti: 'INFJ', voiceType: 'HSCC', brandName: 'The Guardian Breath', roast: "You whisper your boundaries so softly that people keep stepping over them, just so you can feel the tragic thrill of being misunderstood." },
    INFJ_HSCD: { mbti: 'INFJ', voiceType: 'HSCD', brandName: 'The Priest King', roast: "You rule a kingdom of pure ideals, which is convenient because you don't actually have to manage any real, messy people." },
    INFJ_LFEC: { mbti: 'INFJ', voiceType: 'LFEC', brandName: 'The Moral Crusader', roast: "You lead with 'love,' but your vocal intensity suggests you’d be happy to burn the city down just to keep the orphans warm." },
    INFJ_LFED: { mbti: 'INFJ', voiceType: 'LFED', brandName: 'The Divine Requiem', roast: "Every internal conflict you have is a cosmic tragedy; you’re mourning the world's sins while you’re just trying to decide what to have for lunch." },
    INFJ_LSEC: { mbti: 'INFJ', voiceType: 'LSEC', brandName: 'The Prophecy', roast: "Your voice suggests a great reckoning is coming, but usually, it’s just another 'deep conversation' that leaves everyone exhausted." },
    INFJ_LSED: { mbti: 'INFJ', voiceType: 'LSED', brandName: 'The Soul Healer', roast: "You sound like you’re trying to cure the listener's trauma with a slow, hypnotic beat, but you’re mostly just self-medicating your own loneliness." },
    INFJ_LFCC: { mbti: 'INFJ', voiceType: 'LFCC', brandName: 'The Ethical Truth', roast: "You report on humanity's failures with such poise that it’s clear you’ve already decided you’re the only one worth saving." },
    INFJ_LFCD: { mbti: 'INFJ', voiceType: 'LFCD', brandName: 'The Eternal Sage', roast: "You’ve achieved enlightenment, but your frequency suggests you’re deeply annoyed that the rest of us are still so stupid." },
    INFJ_LSCC: { mbti: 'INFJ', voiceType: 'LSCC', brandName: 'The Martyr Servant', roast: "You serve others with such aggressive self-sacrifice that everyone around you feels guilty just for existing." },
    INFJ_LSCD: { mbti: 'INFJ', voiceType: 'LSCD', brandName: 'The Ocean of Empathy', roast: "You’re drowning in the world's pain, but you’ve made the water so deep that no one can actually reach you to help." },

    // INFP: The Mediator
    INFP_HFEC: { mbti: 'INFP', voiceType: 'HFEC', brandName: 'The Dreamy Idol', roast: "You’re a pop star for an audience of ghosts; your charisma is immense, but it only works in a room full of your own imaginary friends." },
    INFP_HFED: { mbti: 'INFP', voiceType: 'HFED', brandName: 'The Clumsy Cheer', roast: "You’re rooting for the underdog, but your enthusiasm is so fragile it might shatter if someone actually wins." },
    INFP_HSEC: { mbti: 'INFP', voiceType: 'HSEC', brandName: 'The Gentle Dreamer', roast: "You have the vocal energy of a cloud, but there’s a thunderstorm of 'unresolved feelings' hidden in the vapor." },
    INFP_HSED: { mbti: 'INFP', voiceType: 'HSED', brandName: 'The Vulnerable Brand', roast: "You’ve commodified your sensitivity so well that even your tears sound like they were approved by a marketing board." },
    INFP_HFCC: { mbti: 'INFP', voiceType: 'HFCC', brandName: 'The Hollow Shell', roast: "You’ve retreated so far into your 'safe space' that your voice is now just an automated reply from an empty room." },
    INFP_HFCD: { mbti: 'INFP', voiceType: 'HFCD', brandName: 'The Nostalgic Coder', roast: "You build digital worlds just to find a place where your 2005 childhood memories can live forever. It’s a very high-tech cemetery." },
    INFP_HSCC: { mbti: 'INFP', voiceType: 'HSCC', brandName: 'The Fragile Whisper', roast: "Your voice is like glass—beautiful, transparent, and incredibly likely to cut anyone who tries to hold you too tightly." },
    INFP_HSCD: { mbti: 'INFP', voiceType: 'HSCD', brandName: 'The Fallen Prince', roast: "You possess the dignity of a lost era, but you’re mostly just pouting because the modern world refuses to speak in poetry." },
    INFP_LFEC: { mbti: 'INFP', voiceType: 'LFEC', brandName: 'The Iron Lamb', roast: "You try to be a pacifist, but your voice sounds like it's about to annex a small country just for the aesthetic." },
    INFP_LFED: { mbti: 'INFP', voiceType: 'LFED', brandName: 'The Internal Opera', roast: "You are the lead in a tragedy that only you can see; the drama is infinite, but the stakes are purely imaginary." },
    INFP_LSEC: { mbti: 'INFP', voiceType: 'LSEC', brandName: 'The Indie Film', roast: "You sound like the trailer for a movie where nothing happens for two hours, but the lighting is very, very pretty." },
    INFP_LSED: { mbti: 'INFP', voiceType: 'LSED', brandName: 'The Bedroom Radio', roast: "You sound like you’re broadcasting from under a blanket; it’s intimate, it’s cozy, and it’s completely disconnected from reality." },
    INFP_LFCC: { mbti: 'INFP', voiceType: 'LFCC', brandName: 'The Poetic Fact', roast: "You deliver the news as a series of metaphors; nobody knows what's actually happening, but everyone feels vaguely sad about it." },
    INFP_LFCD: { mbti: 'INFP', voiceType: 'LFCD', brandName: 'The Melancholy Monk', roast: "You’ve found wisdom in sadness, but you’re mostly just keeping the sadness around so you can keep feeling wise." },
    INFP_LSCC: { mbti: 'INFP', voiceType: 'LSCC', brandName: 'The Devoted Ghost', roast: "You are loyal to a version of someone that doesn't exist anymore; you’re serving a memory with terrifying dedication." },
    INFP_LSCD: { mbti: 'INFP', voiceType: 'LSCD', brandName: 'The Sunken Dream', roast: "Your heart is a heavy stone at the bottom of a lake; your voice is just the ripples on the surface that nobody bothers to count." },

    // Special User Requests & Sparse Data with Roasts
    ISTJ_HFEC: { mbti: 'ISTJ', voiceType: 'HFEC', brandName: 'The Scripted Idol', roast: "You've practiced your spontaneity so much that your 'fun' sounds like a perfectly executed audit." },
    ESFP_LSCD: { mbti: 'ESFP', voiceType: 'LSCD', brandName: 'The Glitter Abyss', roast: "You’re a disco ball dropped into the Mariana Trench—shiny on the surface, but anyone who dives deeper finds a darkness that hasn't seen light in three million years." },
};

// 2. Brand Name Lookup Matrix (Complete Coverage 256)
// Used when full specific data is missing.
const brandNameMatrix: Record<string, string> = {
    // INFJ
    INFJ_HFEC: 'The Messiah Icon', INFJ_HFED: 'The Spiritual Rally', INFJ_HSEC: 'The Holy Puppy', INFJ_HSED: 'The Enlightened Feed',
    INFJ_HFCC: 'The Stoic Saint', INFJ_HFCD: 'The Social Architect', INFJ_HSCC: 'The Guardian Breath', INFJ_HSCD: 'The Priest King',
    INFJ_LFEC: 'The Moral Crusader', INFJ_LFED: 'The Divine Requiem', INFJ_LSEC: 'The Prophecy', INFJ_LSED: 'The Soul Healer',
    INFJ_LFCC: 'The Ethical Truth', INFJ_LFCD: 'The Eternal Sage', INFJ_LSCC: 'The Martyr Servant', INFJ_LSCD: 'The Ocean of Empathy',

    // INFP
    INFP_HFEC: 'The Dreamy Idol', INFP_HFED: 'The Clumsy Cheer', INFP_HSEC: 'The Gentle Dreamer', INFP_HSED: 'The Vulnerable Brand',
    INFP_HFCC: 'The Hollow Shell', INFP_HFCD: 'The Nostalgic Coder', INFP_HSCC: 'The Fragile Whisper', INFP_HSCD: 'The Fallen Prince',
    INFP_LFEC: 'The Iron Lamb', INFP_LFED: 'The Internal Opera', INFP_LSEC: 'The Indie Film', INFP_LSED: 'The Bedroom Radio',
    INFP_LFCC: 'The Poetic Fact', INFP_LFCD: 'The Melancholy Monk', INFP_LSCC: 'The Devoted Ghost', INFP_LSCD: 'The Sunken Dream',

    // ENFJ
    ENFJ_HFEC: 'The Beloved Leader', ENFJ_HFED: 'The High-Vibe Mentor', ENFJ_HSEC: 'The Warm Guardian', ENFJ_HSED: 'The Social Healer',
    ENFJ_HFCC: 'The Burnout Hero', ENFJ_HFCD: 'The Humanistic Engineer', ENFJ_HSCC: 'The Comforting Voice', ENFJ_HSCD: 'The Benevolent King',
    ENFJ_LFEC: 'The Noble General', ENFJ_LFED: 'The Heroic Aria', ENFJ_LSEC: 'The Hero’s Return', ENFJ_LSED: 'The Heart Radio',
    ENFJ_LFCC: 'The Inspirational News', ENFJ_LFCD: 'The Guiding Light', ENFJ_LSCC: 'The Idealistic Servant', ENFJ_LSCD: 'The Collective Soul',

    // ENFP
    ENFP_HFEC: 'The Chaotic Muse', ENFP_HFED: 'The Eternal Party', ENFP_HSEC: 'The Happy Explorer', ENFP_HSED: 'The Rainbow Brand',
    ENFP_HFCC: 'The Battery Empty', ENFP_HFCD: 'The Creative Hacker', ENFP_HSCC: 'The Playful Whisper', ENFP_HSCD: 'The Bohemian Prince',
    ENFP_LFEC: 'The Freedom Fighter', ENFP_LFED: 'The Wild Fantasy', ENFP_LSEC: 'The Adventure Teaser', ENFP_LSED: 'The Moon Child',
    ENFP_LFCC: 'The Gossip Fact', ENFP_LFCD: 'The Naive Genius', ENFP_LSCC: 'The Eccentric Valet', ENFP_LSCD: 'The Dreamy Abyss',

    // ISTJ
    ISTJ_HFEC: 'The Scripted Idol', ISTJ_HFED: 'The Standard Cheer', ISTJ_HSEC: 'The Disciplined Pup', ISTJ_HSED: 'The Verified Data',
    ISTJ_HFCC: 'The Dead Letter', ISTJ_HFCD: 'The Senior Architect', ISTJ_HSCC: 'The Precise Breath', ISTJ_HSCD: 'The Tradition Keeper',
    ISTJ_LFEC: 'The Strict Sergeant', ISTJ_LFED: 'The Formal Drama', ISTJ_LSEC: 'The Realistic Plot', ISTJ_LSED: 'The Clockwork Radio',
    ISTJ_LFCC: 'The Definitive Report', ISTJ_LFCD: 'The Objective Wisdom', ISTJ_LSCC: 'The Invisible Hand', ISTJ_LSCD: 'The Silent Anchor',

    // ISFJ
    ISFJ_HFEC: 'The Protective Star', ISFJ_HFED: 'The Anxious Cheer', ISFJ_HSEC: 'The Pure Devotion', ISFJ_HSED: 'The Humble Brand',
    ISFJ_HFCC: 'The Numb Caretaker', ISFJ_HFCD: 'The Reliable Support', ISFJ_HSCC: 'The Maternal Whisper', ISFJ_HSCD: 'The Gracious Lady',
    ISFJ_LFEC: 'The Protective Wall', ISFJ_LFED: 'The Tragic Sacrifice', ISFJ_LSEC: 'The Family Drama', ISFJ_LSED: 'The Midnight Nurse',
    ISFJ_LFCC: 'The Community Bulletin', ISFJ_LFCD: 'The Modest Scholar', ISFJ_LSCC: 'The Eternal Valet', ISFJ_LSCD: 'The Deep Connection',

    // ESTJ
    ESTJ_HFEC: 'The Corporate Idol', ESTJ_HFED: 'The Motivation Speaker', ESTJ_HSEC: 'The Trained Leader', ESTJ_HSED: 'The Power Icon',
    ESTJ_HFCC: 'The Bureaucrat', ESTJ_HFCD: 'The System Manager', ESTJ_HSCC: 'The Structured Peace', ESTJ_HSCD: 'The Iron Monarch',
    ESTJ_LFEC: 'The Supreme General', ESTJ_LFED: 'The Triumphant Anthem', ESTJ_LSEC: 'The Success Story', ESTJ_LSED: 'The Night Watchman',
    ESTJ_LFCC: 'The Official News', ESTJ_LFCD: 'The Traditionalist', ESTJ_LSCC: 'The Perfect Chief', ESTJ_LSCD: 'The Submerged Power',

    // ESFJ
    ESFJ_HFEC: 'The Social Butterfly', ESFJ_HFED: 'The Community Cheer', ESFJ_HSEC: 'The Popular Pup', ESFJ_HSED: 'The Lifestyle Guru',
    ESFJ_HFCC: 'The Social Fatigue', ESFJ_HFCD: 'The Networking Expert', ESFJ_HSCC: 'The Social Tonic', ESFJ_HSCD: 'The Social Queen',
    ESFJ_LFEC: 'The Social Enforcer', ESFJ_LFED: 'The Social Drama', ESFJ_LSEC: 'The Rom-Com Teaser', ESFJ_LSED: 'The Request Line',
    ESFJ_LFCC: 'The Harmony News', ESFJ_LFCD: 'The Moral Compass', ESFJ_LSCC: 'The Attentive Host', ESFJ_LSCD: 'The Emotional Anchor',

    // ISTP
    ISTP_HFEC: 'The Accidental Star', ISTP_HFED: 'The High-Speed Logic', ISTP_HSEC: 'The Lone Wolf Pup', ISTP_HSED: 'The Skill Flex',
    ISTP_HFCC: 'The Tool Machine', ISTP_HFCD: 'The Precision Coder', ISTP_HSCC: 'The Tactile Whisper', ISTP_HSCD: 'The Rebel Noble',
    ISTP_LFEC: 'The Tactician', ISTP_LFED: 'The Raw Emotion', ISTP_LSEC: 'The Thriller Hero', ISTP_LSED: 'The Midnight Garage',
    ISTP_LFCC: 'The Real-Time Fact', ISTP_LFCD: 'The Practical Wise', ISTP_LSCC: 'The Silent Hand', ISTP_LSCD: 'The Cold Abyss',

    // ISFP
    ISFP_HFEC: 'The Aesthetic Icon', ISFP_HFED: 'The Sensitive Energy', ISFP_HSEC: 'The Gentle Artist', ISFP_HSED: 'The Visual Muse',
    ISFP_HFCC: 'The Frozen Soul', ISFP_HFCD: 'The Elegant Coder', ISFP_HSCC: 'The Artistic Whisper', ISFP_HSCD: 'The Artistic Prince',
    ISFP_LFEC: 'The Passionate Rebel', ISFP_LFED: 'The Bohemian Aria', ISFP_LSEC: 'The Visual Epic', ISFP_LSED: 'The Color of Night',
    ISFP_LFCC: 'The Subjective Fact', ISFP_LFCD: 'The Intuitive Scholar', ISFP_LSCC: 'The Aesthetic Valet', ISFP_LSCD: 'The Sunken Beauty',

    // ESTP
    ESTP_HFEC: 'The Wild Star', ESTP_HFED: 'The High-Stakes Hype', ESTP_HSEC: 'The Bold Pup', ESTP_HSED: 'The Hustler Brand',
    ESTP_HFCC: 'The Burned Out Gambler', ESTP_HFCD: 'The Growth Hacker', ESTP_HSCC: 'The Adrenaline Whisper', ESTP_HSCD: 'The Pirate King',
    ESTP_LFEC: 'The Frontline Leader', ESTP_LFED: 'The Intense Drama', ESTP_LSEC: 'The Action Thriller', ESTP_LSED: 'The Neon Gambler',
    ESTP_LFCC: 'The Sensational News', ESTP_LFCD: 'The Street-Wise Sage', ESTP_LSCC: 'The Risky Servant', ESTP_LSCD: 'The Predator Deep',

    // ESFP
    ESFP_HFEC: 'The Natural Born Idol', ESFP_HFED: 'The Party Monster', ESFP_HSEC: 'The Ultimate Puppy', ESFP_HSED: 'The Spotlight Addict',
    ESFP_HFCC: 'The Hungover Clown', ESFP_HFCD: 'The Visual Coder', ESFP_HSCC: 'The Sensual Whisper', ESFP_HSCD: 'The Party Prince',
    ESFP_LFEC: 'The Riot Leader', ESFP_LFED: 'The Grand Comedy', ESFP_LSEC: 'The Blockbuster', ESFP_LSED: 'The Club King',
    ESFP_LFCC: 'The Entertainment News', ESFP_LFCD: 'The Hedonistic Sage', ESFP_LSCC: 'The Showman Valet', ESFP_LSCD: 'The Glitter Abyss',
};

// 3. Dynamic Roast Traits (Fallback when specific roast is missing)
const voiceTraits: Record<TypeCode, { roastFragment: string }> = {
    HFEC: { roastFragment: "you sound like a chaotic anime protagonist" },
    HFED: { roastFragment: "your voice demands a spotlight even in a dark room" },
    HSEC: { roastFragment: "you could sell ice to a polar bear" },
    HSED: { roastFragment: "you have zero indoor voice and zero regrets" },
    HFCC: { roastFragment: "you process emotions like a GPU processes textures" },
    HFCD: { roastFragment: "you sound like a corrupted save file" },
    HSCC: { roastFragment: "you speak in ASMR and secrets" },
    HSCD: { roastFragment: "you don't ask for things, you announce them" },
    LFEC: { roastFragment: "your voice has its own gravitational pull" },
    LFED: { roastFragment: "you make ordering pizza sound like a Shakespearean soliloquy" },
    LSEC: { roastFragment: "you sound like the voiceover for a summer blockbuster" },
    LSED: { roastFragment: "you sound like a monologue in a rain-slicked alleyway" },
    LFCC: { roastFragment: "you deliver facts like a printer delivers paper: flat and necessary" },
    LFCD: { roastFragment: "you sound like you're speaking from the bottom of a well" },
    LSCC: { roastFragment: "you are terrifyingly polite and efficient" },
    LSCD: { roastFragment: "your voice is less a sound and more a vibration in the floorboards" },
};

const mbtiThemes: Record<MBTIType, { flaw: string }> = {
    INTJ: { flaw: "overthinking" }, INTP: { flaw: "buffering" }, ENTJ: { flaw: "dominating" }, ENTP: { flaw: "trolling" },
    INFJ: { flaw: "judging" }, INFP: { flaw: "zoning out" }, ENFJ: { flaw: "preaching" }, ENFP: { flaw: "spiraling" },
    ISTJ: { flaw: "auditing" }, ISFJ: { flaw: "worrying" }, ESTJ: { flaw: "micromanaging" }, ESFJ: { flaw: "gossiping" },
    ISTP: { flaw: "disassembling" }, ISFP: { flaw: "sulking" }, ESTP: { flaw: "reckless driving" }, ESFP: { flaw: "scene-stealing" },
};

export function getSoloIdentity(mbti: MBTIType, voiceType: TypeCode): SoloIdentity {
    const key = `${mbti}_${voiceType}`;

    // 1. Check for Fully Specific Identity (Legacy or User Provided)
    if (specificIdentities[key]) {
        return specificIdentities[key];
    }

    // 2. Construct Dynamic Identity (Hybrid)
    // Use Brand Name from Matrix if available, else Fallback.
    const brandName = brandNameMatrix[key] || "The Enigma";

    // Dynamic Roast Generation
    const vTrait = voiceTraits[voiceType];
    const mTheme = mbtiThemes[mbti];

    let prefix = "";
    if (voiceType.startsWith('H')) {
        prefix = `You have the brain of a ${mbti} but the energy of a nuclear reactor.`;
    } else {
        prefix = `You are a ${mbti} operating in stealth mode.`;
    }

    const roast = `${prefix} You're constantly ${mTheme.flaw}, and ${vTrait.roastFragment}. It's a dangerous combination.`;

    return {
        mbti,
        voiceType,
        brandName: brandName,
        roast: roast
    };
}
