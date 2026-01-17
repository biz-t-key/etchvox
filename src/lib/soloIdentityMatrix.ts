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

    // ENFJ: The Protagonist
    ENFJ_HFEC: { mbti: 'ENFJ', voiceType: 'HFEC', brandName: 'The Beloved Leader', roast: "You’re a cult leader who forgot to start the cult; your charisma is so loud it’s actually drowning out the people you’re trying to 'save'." },
    ENFJ_HFED: { mbti: 'ENFJ', voiceType: 'HFED', brandName: 'The High-Vibe Mentor', roast: "You’re a toxic positivity machine; your voice is a mandatory team-building exercise that nobody can escape from." },
    ENFJ_HSEC: { mbti: 'ENFJ', voiceType: 'HSEC', brandName: 'The Warm Guardian', roast: "You have the hospitality of a five-star hotel and the boundaries of a wet paper towel; your 'warmth' is actually just a high-speed engine of codependency." },
    ENFJ_HSED: { mbti: 'ENFJ', voiceType: 'HSED', brandName: 'The Social Healer', roast: "You’ve branded your 'kindness' so effectively that your voice is now a high-definition filter for your own messianic complex." },
    ENFJ_HFCC: { mbti: 'ENFJ', voiceType: 'HFCC', brandName: 'The Burnout Hero', roast: "You’ve given so much that your soul has reached absolute zero; you’re an automated empathy-bot running on an empty battery." },
    ENFJ_HFCD: { mbti: 'ENFJ', voiceType: 'HFCD', brandName: 'The Humanistic Engineer', roast: "You treat social groups like a complex hardware problem; you’re trying to 'fix' people's personalities without their consent." },
    ENFJ_HSCC: { mbti: 'ENFJ', voiceType: 'HSCC', brandName: 'The Comforting Voice', roast: "You whisper your support so intensely that it’s actually a form of psychological surveillance; you’re suffocating people with your 'understanding'." },
    ENFJ_HSCD: { mbti: 'ENFJ', voiceType: 'HSCD', brandName: 'The Benevolent King', roast: "You rule through kindness, but your frequency suggests you’d be deeply offended if anyone actually tried to rule themselves." },
    ENFJ_LFEC: { mbti: 'ENFJ', voiceType: 'LFEC', brandName: 'The Noble General', roast: "You lead the charge for 'good,' but your vocal intensity suggests you’re mostly just addicted to the feeling of being the hero." },
    ENFJ_LFED: { mbti: 'ENFJ', voiceType: 'LFED', brandName: 'The Heroic Aria', roast: "Your life is a grand performance for an audience of everyone you’ve ever 'helped'; the tragedy is that they didn’t ask for a show." },
    ENFJ_LSEC: { mbti: 'ENFJ', voiceType: 'LSEC', brandName: 'The Hero’s Return', roast: "You speak in tropes of redemption and growth, but your frequency suggests you’re just rehearsing for your own Oscar acceptance speech." },
    ENFJ_LSED: { mbti: 'ENFJ', voiceType: 'LSED', brandName: 'The Heart Radio', roast: "You sound like you’re trying to pulse-check the entire planet at 3 AM; it’s empathetic, it’s deep, and it’s exhausting for everyone else." },
    ENFJ_LFCC: { mbti: 'ENFJ', voiceType: 'LFCC', brandName: 'The Inspirational News', roast: "You report on the human spirit with such a forced smile that your voice sounds like it’s about to snap from the pressure of being 'perfect'." },
    ENFJ_LFCD: { mbti: 'ENFJ', voiceType: 'LFCD', brandName: 'The Guiding Light', roast: "You have all the answers for everyone else's life, but your frequency suggests you’re terrified of your own silence." },
    ENFJ_LSCC: { mbti: 'ENFJ', voiceType: 'LSCC', brandName: 'The Idealistic Servant', roast: "You serve others with such a grand vision that you’ve become a valet for a future that hasn't happened yet." },
    ENFJ_LSCD: { mbti: 'ENFJ', voiceType: 'LSCD', brandName: 'The Collective Soul', roast: "You’ve absorbed everyone's emotions until your voice is just a slow, heavy hum of other people's problems." },

    // ENFP: The Campaigner
    ENFP_HFEC: { mbti: 'ENFP', voiceType: 'HFEC', brandName: 'The Chaotic Muse', roast: "You’re a glitter bomb with a very high IQ; your charisma is a distraction from the fact that you haven't finished a sentence in three years." },
    ENFP_HFED: { mbti: 'ENFP', voiceType: 'HFED', brandName: 'The Eternal Party', roast: "You’re the cheerleader for a game that doesn't exist; your energy is infectious, but your direction is non-existent." },
    ENFP_HSEC: { mbti: 'ENFP', voiceType: 'HSEC', brandName: 'The Happy Explorer', roast: "You have the enthusiasm of a puppy and the attention span of a goldfish on espresso; your 'joy' is a form of ADHD-driven chaos." },
    ENFP_HSED: { mbti: 'ENFP', voiceType: 'HSED', brandName: 'The Rainbow Brand', roast: "You’ve successfully branded your indecisiveness as 'exploring your truth.' Your voice is a mood board that changes every six seconds." },
    ENFP_HFCC: { mbti: 'ENFP', voiceType: 'HFCC', brandName: 'The Battery Empty', roast: "You’ve over-stimulated your soul until it’s just a flat line; you’re a manic-depressive algorithm with a low-power mode." },
    ENFP_HFCD: { mbti: 'ENFP', voiceType: 'HFCD', brandName: 'The Creative Hacker', roast: "You build systems just to see them fail; you’re an architect of chaos who calls every bug an 'unintentional feature'." },
    ENFP_HSCC: { mbti: 'ENFP', voiceType: 'HSCC', brandName: 'The Playful Whisper', roast: "You whisper your secrets so loudly that everyone hears them, but you’re mostly just performing 'vulnerability' for an audience of one: yourself." },
    ENFP_HSCD: { mbti: 'ENFP', voiceType: 'HSCD', brandName: 'The Bohemian Prince', roast: "You rule a kingdom of 'possibilities,' which is a fancy way of saying you have no intention of ever making a real decision." },
    ENFP_LFEC: { mbti: 'ENFP', voiceType: 'LFEC', brandName: 'The Freedom Fighter', roast: "You’re a rebel without a cause, but you have enough vocal energy to start a revolution over a coffee order." },
    ENFP_LFED: { mbti: 'ENFP', voiceType: 'LFED', brandName: 'The Wild Fantasy', roast: "Your internal world is a Technicolor opera, but unfortunately, the rest of us are living in a black-and-white reality where you’re just late for a meeting." },
    ENFP_LSEC: { mbti: 'ENFP', voiceType: 'LSEC', brandName: 'The Adventure Teaser', roast: "You speak in hooks and cliffhangers, but there is no third act; you’re a trailer for a movie that doesn't actually have a script." },
    ENFP_LSED: { mbti: 'ENFP', voiceType: 'LSED', brandName: 'The Moon Child', roast: "You sound like you’re trying to contact aliens through a lo-fi beat; it’s dreamy, it’s cosmic, and it’s 100% delusional." },
    ENFP_LFCC: { mbti: 'ENFP', voiceType: 'LFCC', brandName: 'The Gossip Fact', roast: "You report on the 'vibe' of the room as if it were hard data; you’re the anchorman of your own emotional fluctuations." },
    ENFP_LFCD: { mbti: 'ENFP', voiceType: 'LFCD', brandName: 'The Naive Genius', roast: "You have brilliant ideas every four seconds, but your frequency suggests you haven't actually understood any of them yourself." },
    ENFP_LSCC: { mbti: 'ENFP', voiceType: 'LSCC', brandName: 'The Eccentric Valet', roast: "You are devoted to your own curiosity; you serve your whims with the dedication of a professional valet." },
    ENFP_LSCD: { mbti: 'ENFP', voiceType: 'LSCD', brandName: 'The Dreamy Abyss', roast: "You’re floating in a neon-colored void; your voice is just the sound of someone happily drowning in their own imagination." },

    // III. Sentinels (SJ) Group - ISTJ
    ISTJ_HFEC: { mbti: 'ISTJ', voiceType: 'HFEC', brandName: 'The Scripted Idol', roast: "You've practiced your spontaneity so much that your 'fun' sounds like a perfectly executed audit." },
    ISTJ_HFED: { mbti: 'ISTJ', voiceType: 'HFED', brandName: 'The Standard Cheer', roast: "You’re cheering for the rules, not the players; your enthusiasm is a series of approved procedural guidelines." },
    ISTJ_HSEC: { mbti: 'ISTJ', voiceType: 'HSEC', brandName: 'The Disciplined Pup', roast: "You’re a puppy that has read the entire owner's manual; your loyalty is less an emotion and more a binding legal contract." },
    ISTJ_HSED: { mbti: 'ISTJ', voiceType: 'HSED', brandName: 'The Verified Data', roast: "Your personality is a verified blue checkmark on an empty profile; you’re the most reliable source of absolutely nothing." },
    ISTJ_HFCC: { mbti: 'ISTJ', voiceType: 'HFCC', brandName: 'The Dead Letter', roast: "Your voice is the acoustic equivalent of a tax form; you’ve successfully filed your soul away in a cabinet that nobody has the key to." },
    ISTJ_HFCD: { mbti: 'ISTJ', voiceType: 'HFCD', brandName: 'The Senior Architect', roast: "You manage your life like a legacy system—no updates allowed, no risks taken, and absolutely no room for 'creative' bugs." },
    ISTJ_HSCC: { mbti: 'ISTJ', voiceType: 'HSCC', brandName: 'The Precise Breath', roast: "You whisper with the terrifying accuracy of a surgeon; your relaxation techniques feel like a very quiet interrogation." },
    ISTJ_HSCD: { mbti: 'ISTJ', voiceType: 'HSCD', brandName: 'The Tradition Keeper', roast: "You’re ruling a kingdom that hasn't changed since 1954; you’re the monarch of 'the way things have always been done.'" },
    ISTJ_LFEC: { mbti: 'ISTJ', voiceType: 'LFEC', brandName: 'The Strict Sergeant', roast: "You don't issue commands, you issue citations; your voice is a parking ticket for the human spirit." },
    ISTJ_LFED: { mbti: 'ISTJ', voiceType: 'LFED', brandName: 'The Formal Drama', roast: "Your internal conflicts follow a strict agenda; even your mid-life crisis was scheduled three years in advance." },
    ISTJ_LSEC: { mbti: 'ISTJ', voiceType: 'LSEC', brandName: 'The Realistic Plot', roast: "In a world where everything is reasonably priced and the lawn is perfectly mowed... you are the man who stays exactly where he is." },
    ISTJ_LSED: { mbti: 'ISTJ', voiceType: 'LSED', brandName: 'The Clockwork Radio', roast: "You sound like a metronome set to a slightly depressing beat; you’re the soundtrack to a very efficient waiting room." },
    ISTJ_LFCC: { mbti: 'ISTJ', voiceType: 'LFCC', brandName: 'The Definitive Report', roast: "You deliver your own dinner plans as if they were a supreme court ruling; you’re the anchorman of the Status Quo." },
    ISTJ_LFCD: { mbti: 'ISTJ', voiceType: 'LFCD', brandName: 'The Objective Wisdom', roast: "You’ve achieved enlightenment through filing systems and spreadsheets; you’re a sage who only trusts data that has been double-checked." },
    ISTJ_LSCC: { mbti: 'ISTJ', voiceType: 'LSCC', brandName: 'The Invisible Hand', roast: "You serve the system so well that you’ve actually disappeared; you’re a valet for a set of rules that no longer exist." },
    ISTJ_LSCD: { mbti: 'ISTJ', voiceType: 'LSCD', brandName: 'The Silent Anchor', roast: "You are a heavy stone sitting at the bottom of a well; your voice is the sound of absolute stability in a vacuum." },

    // ISFJ: The Defender
    ISFJ_HFEC: { mbti: 'ISFJ', voiceType: 'HFEC', brandName: 'The Protective Star', roast: "You’re a pop star who apologizes for the spotlight; you want to be famous just so you can tell everyone else they’re doing a great job." },
    ISFJ_HFED: { mbti: 'ISFJ', voiceType: 'HFED', brandName: 'The Anxious Cheer', roast: "You’re cheering for everyone because you’re terrified of anyone being left out; your energy is 10% joy and 90% social anxiety." },
    ISFJ_HSEC: { mbti: 'ISFJ', voiceType: 'HSEC', brandName: 'The Pure Devotion', roast: "You’re a golden retriever who feels guilty for breathing; your loyalty is a heavy blanket that is slowly suffocating everyone you love." },
    ISFJ_HSED: { mbti: 'ISFJ', voiceType: 'HSED', brandName: 'The Humble Brand', roast: "You’ve branded yourself as 'The Most Relatable Person Alive,' which is just a fancy way of saying you’ve commodified your own modesty." },
    ISFJ_HFCC: { mbti: 'ISFJ', voiceType: 'HFCC', brandName: 'The Numb Caretaker', roast: "You’ve helped so many people that your empathy has turned into a pre-recorded message; you’re a nursing-bot with a low battery." },
    ISFJ_HFCD: { mbti: 'ISFJ', voiceType: 'HFCD', brandName: 'The Reliable Support', roast: "You’re the IT department for everyone’s emotional baggage; you fix their problems so you don't have to look at your own messy hardware." },
    ISFJ_HSCC: { mbti: 'ISFJ', voiceType: 'HSCC', brandName: 'The Maternal Whisper', roast: "You whisper so gently it’s actually passive-aggressive; you’re smothering people with a pillow made of pure kindness." },
    ISFJ_HSCD: { mbti: 'ISFJ', voiceType: 'HSCD', brandName: 'The Gracious Lady', roast: "You possess the dignity of a queen, but you spend all your time in the kitchen making sure the servants have enough to eat." },
    ISFJ_LFEC: { mbti: 'ISFJ', voiceType: 'LFEC', brandName: 'The Protective Wall', roast: "You lead through guilt and care; you don't conquer people, you just make them feel terrible for ever wanting to leave you." },
    ISFJ_LFED: { mbti: 'ISFJ', voiceType: 'LFED', brandName: 'The Tragic Sacrifice', roast: "Every time you do a favor, it’s a three-hour aria about your own selflessness; you’re the martyr of the mundane." },
    ISFJ_LSEC: { mbti: 'ISFJ', voiceType: 'LSEC', brandName: 'The Family Drama', roast: "In a world where someone forgot to say 'thank you'... one woman will feel vaguely slighted for the rest of the weekend." },
    ISFJ_LSED: { mbti: 'ISFJ', voiceType: 'LSED', brandName: 'The Midnight Nurse', roast: "You sound like you’re trying to tuck the whole world into bed; it’s soothing, it’s sweet, and it’s slightly infantilizing." },
    ISFJ_LFCC: { mbti: 'ISFJ', voiceType: 'LFCC', brandName: 'The Community Bulletin', roast: "You report on the neighborhood gossip as if it were a national emergency; you’re the anchorman of the local bake sale." },
    ISFJ_LFCD: { mbti: 'ISFJ', voiceType: 'LFCD', brandName: 'The Modest Scholar', roast: "You know everything about everyone’s past, but you only use it to remind them that things were better when they followed the rules." },
    ISFJ_LSCC: { mbti: 'ISFJ', voiceType: 'LSCC', brandName: 'The Eternal Valet', roast: "You serve others with such terrifying precision that you’ve become a ghost in your own home." },
    ISFJ_LSCD: { mbti: 'ISFJ', voiceType: 'LSCD', brandName: 'The Deep Connection', roast: "Your heart is a warm, heavy ocean of memories; your voice is the sound of someone happily drowning in the past." },

    // ESTJ: The Executive
    ESTJ_HFEC: { mbti: 'ESTJ', voiceType: 'HFEC', brandName: 'The Corporate Idol', roast: "You’re a pop star with a business degree; you don't have fans, you have a client base that you manage with an iron fist." },
    ESTJ_HFED: { mbti: 'ESTJ', voiceType: 'HFED', brandName: 'The Motivation Speaker', roast: "You don't motivate people; you issue mandatory productivity increases disguised as 'team spirit.'" },
    ESTJ_HSEC: { mbti: 'ESTJ', voiceType: 'HSEC', brandName: 'The Trained Leader', roast: "You’re a golden retriever who has been promoted to middle management; you demand loyalty and you’ve got the spreadsheets to prove it." },
    ESTJ_HSED: { mbti: 'ESTJ', voiceType: 'HSED', brandName: 'The Power Icon', roast: "Your personality is a high-gloss PDF about 'Efficiency'; you’re the influencer for people who think having a hobby is a waste of billable hours." },
    ESTJ_HFCC: { mbti: 'ESTJ', voiceType: 'HFCC', brandName: 'The Bureaucrat', roast: "You are a human rubber stamp; your voice is the sound of a soul being processed in triplicate and filed under 'Miscellaneous.'" },
    ESTJ_HFCD: { mbti: 'ESTJ', voiceType: 'HFCD', brandName: 'The System Manager', roast: "You manage the world like a perfectly tuned engine; you have zero tolerance for 'human error' or 'feelings' that slow down the output." },
    ESTJ_HSCC: { mbti: 'ESTJ', voiceType: 'HSCC', brandName: 'The Structured Peace', roast: "You whisper your relaxation tips like they’re military commands; even your 'calm' is a forced march." },
    ESTJ_HSCD: { mbti: 'ESTJ', voiceType: 'HSCD', brandName: 'The Iron Monarch', roast: "You rule through sheer competence; your frequency suggests you’d be happy to behead anyone who submits their report late." },
    ESTJ_LFEC: { mbti: 'ESTJ', voiceType: 'LFEC', brandName: 'The Supreme General', roast: "Your voice is a whistle blowing in an empty stadium; you’re leading a charge into a boardroom that you’ve already conquered." },
    ESTJ_LFED: { mbti: 'ESTJ', voiceType: 'LFED', brandName: 'The Triumphant Anthem', roast: "Every small success you have is delivered like a victory at Waterloo; you’re the Pavarotti of 'Getting Things Done.'" },
    ESTJ_LSEC: { mbti: 'ESTJ', voiceType: 'LSEC', brandName: 'The Success Story', roast: "One man. One plan. One very detailed calendar. This summer... he will reach his KPIs." },
    ESTJ_LSED: { mbti: 'ESTJ', voiceType: 'LSED', brandName: 'The Night Watchman', roast: "You sound like a man guarding a vault of gold; you’re cool, you’re calm, and you’re absolutely ready to call the police." },
    ESTJ_LFCC: { mbti: 'ESTJ', voiceType: 'LFCC', brandName: 'The Official News', roast: "You report your own schedule as if it were a matter of national security; you’re the anchorman of the 9-to-5." },
    ESTJ_LFCD: { mbti: 'ESTJ', voiceType: 'LFCD', brandName: 'The Traditionalist', roast: "Your wisdom is just a collection of quotes from successful CEOs; you’re a sage with a subscription to the Wall Street Journal." },
    ESTJ_LSCC: { mbti: 'ESTJ', voiceType: 'LSCC', brandName: 'The Perfect Chief', roast: "You are a man who has mastered the art of serving himself; you’re the most efficient employee of your own ego." },
    ESTJ_LSCD: { mbti: 'ESTJ', voiceType: 'LSCD', brandName: 'The Submerged Power', roast: "You are a massive engine of productivity hidden under the surface; you don't dream, you just process data." },

    // ESFJ: The Consul
    ESFJ_HFEC: { mbti: 'ESFJ', voiceType: 'HFEC', brandName: 'The Social Butterfly', roast: "You’re a pop star who only plays songs that everyone already knows; your charisma is a mirror for whatever the crowd wants to see." },
    ESFJ_HFED: { mbti: 'ESFJ', voiceType: 'HFED', brandName: 'The Community Cheer', roast: "You’re the cheerleader for 'Fitting In'; you’re shouting for the team, but only because you’re terrified of being the odd one out." },
    ESFJ_HSEC: { mbti: 'ESFJ', voiceType: 'HSEC', brandName: 'The Popular Pup', roast: "You’re a golden retriever who knows everyone’s name and exactly how to make them feel guilty for not petting you." },
    ESFJ_HSED: { mbti: 'ESFJ', voiceType: 'HSED', brandName: 'The Lifestyle Guru', roast: "You’ve branded your social circle as an elite club; your voice is a high-definition filter for other people’s dinner parties." },
    ESFJ_HFCC: { mbti: 'ESFJ', voiceType: 'HFCC', brandName: 'The Social Fatigue', roast: "You’ve smiled so much that your face has turned into an automated mask; you’re a social-bot running on a scripted loop of 'How are you?'" },
    ESFJ_HFCD: { mbti: 'ESFJ', voiceType: 'HFCD', brandName: 'The Networking Expert', roast: "You manage your friends like a CRM database; you’re trying to optimize human connection into a high-yield social portfolio." },
    ESFJ_HSCC: { mbti: 'ESFJ', voiceType: 'HSCC', brandName: 'The Social Tonic', roast: "You whisper gossip with the gentleness of a lullaby; you’re soothing people while simultaneously ruining their reputations." },
    ESFJ_HSCD: { mbti: 'ESFJ', voiceType: 'HSCD', brandName: 'The Social Queen', roast: "You rule the social scene with a velvet glove, but your frequency suggests you’d be happy to exile anyone who wears the wrong shoes." },
    ESFJ_LFEC: { mbti: 'ESFJ', voiceType: 'LFEC', brandName: 'The Social Enforcer', roast: "You lead with 'Kindness,' but your voice sounds like it’s about to issue a social boycott for anyone who doesn't follow the group chat." },
    ESFJ_LFED: { mbti: 'ESFJ', voiceType: 'LFED', brandName: 'The Social Drama', roast: "Your life is a grand comedy about other people’s business; the drama is endless, and you’re the star of the 'He Said, She Said' aria." },
    ESFJ_LSEC: { mbti: 'ESFJ', voiceType: 'LSEC', brandName: 'The Rom-Com Teaser', roast: "In a world where everyone gets along... one woman will find the one person who didn't like her Instagram post." },
    ESFJ_LSED: { mbti: 'ESFJ', voiceType: 'LSED', brandName: 'The Request Line', roast: "You sound like you’re taking requests for a party that ended three hours ago; it’s fun, it’s loud, and it’s slightly desperate." },
    ESFJ_LFCC: { mbti: 'ESFJ', voiceType: 'LFCC', brandName: 'The Harmony News', roast: "You report on who’s dating whom with the gravity of a war correspondent; you’re the anchorman of the social status quo." },
    ESFJ_LFCD: { mbti: 'ESFJ', voiceType: 'LFCD', brandName: 'The Moral Compass', roast: "Your wisdom is just a collection of 'Live, Laugh, Love' signs; you’re a sage with a very high social-media engagement rate." },
    ESFJ_LSCC: { mbti: 'ESFJ', voiceType: 'LSCC', brandName: 'The Attentive Host', roast: "You serve your guests with such aggressive hospitality that they’re actually afraid to leave." },
    ESFJ_LSCD: { mbti: 'ESFJ', voiceType: 'LSCD', brandName: 'The Emotional Anchor', roast: "You are the heavy heart of the group; your voice is the sound of someone happily drowning in other people’s approval." },

    // IV. Explorers (SP) Group - ISTP
    ISTP_HFEC: { mbti: 'ISTP', voiceType: 'HFEC', brandName: 'The Accidental Star', roast: "You’re an introvert who accidentally walked onto a main stage; you’re cool, indifferent, and secretly looking for the exit sign." },
    ISTP_HFED: { mbti: 'ISTP', voiceType: 'HFED', brandName: 'The High-Speed Logic', roast: "You don't hype people up; you explain, in detail, why their current plan is statistically likely to fail." },
    ISTP_HSEC: { mbti: 'ISTP', voiceType: 'HSEC', brandName: 'The Lone Wolf Pup', roast: "You’re a golden retriever that has been trained by special forces; you’re loyal, but you know 14 different ways to silently incapacitate a threat." },
    ISTP_HSED: { mbti: 'ISTP', voiceType: 'HSED', brandName: 'The Skill Flex', roast: "You don't have a personality, you have a skill set; your voice is just a demonstration of how much better you are at things than everyone else." },
    ISTP_HFCC: { mbti: 'ISTP', voiceType: 'HFCC', brandName: 'The Tool Machine', roast: "You are a robot that has optimized itself for one specific task; your voice is the sound of a well-oiled machine that has no idea what it’s building." },
    ISTP_HFCD: { mbti: 'ISTP', voiceType: 'HFCD', brandName: 'The Precision Coder', roast: "You treat human beings like buggy code; you’re trying to patch people’s emotional outbursts with logic, and it’s just causing more crashes." },
    ISTP_HSCC: { mbti: 'ISTP', voiceType: 'HSCC', brandName: 'The Tactile Whisper', roast: "You whisper about how things work with such intensity that it sounds like you’re taking apart a bomb in a library." },
    ISTP_HSCD: { mbti: 'ISTP', voiceType: 'HSCD', brandName: 'The Rebel Noble', roast: "You possess the dignity of a king, but your frequency suggests you’d be happier stripping a car engine in a garage than ruling a country." },
    ISTP_LFEC: { mbti: 'ISTP', voiceType: 'LFEC', brandName: 'The Tactician', roast: "You don't lead, you execute; your voice is the sound of a plan being carried out with zero regard for collateral damage." },
    ISTP_LFED: { mbti: 'ISTP', voiceType: 'LFED', brandName: 'The Raw Emotion', roast: "Your internal world is a garage band playing at full volume; it’s loud, it’s messy, and it’s completely unmixed." },
    ISTP_LSEC: { mbti: 'ISTP', voiceType: 'LSEC', brandName: 'The Thriller Hero', roast: "In a world full of talkers... you are the man who quietly knows how to fix the helicopter before it crashes." },
    ISTP_LSED: { mbti: 'ISTP', voiceType: 'LSED', brandName: 'The Midnight Garage', roast: "You sound like you’re broadcasting from a workbench covered in oil and circuits; it’s cool, it’s dirty, and it smells like gasoline." },
    ISTP_LFCC: { mbti: 'ISTP', voiceType: 'LFCC', brandName: 'The Real-Time Fact', roast: "You report on what's happening right now with the adrenaline of a live sports commentator; you’re the anchorman of the immediate." },
    ISTP_LFCD: { mbti: 'ISTP', voiceType: 'LFCD', brandName: 'The Practical Wise', roast: "Your wisdom is based entirely on what you can touch and fix; you’re a sage who thinks philosophy is a waste of good materials." },
    ISTP_LSCC: { mbti: 'ISTP', voiceType: 'LSCC', brandName: 'The Silent Hand', roast: "You serve your own interests with the quiet efficiency of a professional assassin; you’re a valet who knows where the bodies are buried." },
    ISTP_LSCD: { mbti: 'ISTP', voiceType: 'LSCD', brandName: 'The Cold Abyss', roast: "You’ve dived so deep into the mechanics of the world that you’ve forgotten the surface exists; your voice is a cold, pressure-crushed silence." },

    // ISFP: The Adventurer
    ISFP_HFEC: { mbti: 'ISFP', voiceType: 'HFEC', brandName: 'The Aesthetic Icon', roast: "You’re a pop star who is famous for not wanting to be famous; your entire career is a performance art piece about avoiding eye contact." },
    ISFP_HFED: { mbti: 'ISFP', voiceType: 'HFED', brandName: 'The Sensitive Energy', roast: "You’re trying to hype the crowd, but your voice sounds like you’re about to cry because the confetti cannon was too loud." },
    ISFP_HSEC: { mbti: 'ISFP', voiceType: 'HSEC', brandName: 'The Gentle Artist', roast: "You have the soul of a poet and the emotional resilience of a soap bubble; you’re a golden retriever that gets its feelings hurt by a stiff breeze." },
    ISFP_HSED: { mbti: 'ISFP', voiceType: 'HSED', brandName: 'The Visual Muse', roast: "You’ve curated your entire life into a mood board; your voice is just background music for a TikTok about how 'authentic' you are." },
    ISFP_HFCC: { mbti: 'ISFP', voiceType: 'HFCC', brandName: 'The Frozen Soul', roast: "You’ve protected your heart so thoroughly that it’s now encased in ice; you’re a beautiful statue that has forgotten how to feel." },
    ISFP_HFCD: { mbti: 'ISFP', voiceType: 'HFCD', brandName: 'The Elegant Coder', roast: "You write code like you’re composing a symphony; it’s beautiful, it’s elegant, and it’s absolutely impossible for anyone else to debug." },
    ISFP_HSCC: { mbti: 'ISFP', voiceType: 'HSCC', brandName: 'The Artistic Whisper', roast: "You whisper about your feelings so beautifully that people don't realize you’re actually screaming for help." },
    ISFP_HSCD: { mbti: 'ISFP', voiceType: 'HSCD', brandName: 'The Artistic Prince', roast: "You possess the soul of a prince, but your frequency suggests you’d trade your kingdom for a really good vintage leather jacket." },
    ISFP_LFEC: { mbti: 'ISFP', voiceType: 'LFEC', brandName: 'The Passionate Rebel', roast: "You lead with emotion, not logic; your voice is a battle cry for a cause that you made up five minutes ago." },
    ISFP_LFED: { mbti: 'ISFP', voiceType: 'LFED', brandName: 'The Bohemian Aria', roast: "Your life is a tragic opera about how hard it is to be so misunderstood; the costume changes are incredible, but the plot is thin." },
    ISFP_LSEC: { mbti: 'ISFP', voiceType: 'LSEC', brandName: 'The Visual Epic', roast: "You speak in images, not words; your voice is a series of beautiful, disconnected shots that suggest a story without actually telling one." },
    ISFP_LSED: { mbti: 'ISFP', voiceType: 'LSED', brandName: 'The Color of Night', roast: "You sound like you’re painting a picture with sound at 3 AM; it’s moody, it’s deep, and it’s completely self-indulgent." },
    ISFP_LFCC: { mbti: 'ISFP', voiceType: 'LFCC', brandName: 'The Subjective Fact', roast: "You report on your own feelings as if they were the only truth in the universe; you’re the anchorman of your own emotional weather." },
    ISFP_LFCD: { mbti: 'ISFP', voiceType: 'LFCD', brandName: 'The Intuitive Scholar', roast: "You have a deep understanding of the human condition, but you only use it to create art that nobody understands." },
    ISFP_LSCC: { mbti: 'ISFP', voiceType: 'LSCC', brandName: 'The Aesthetic Valet', roast: "You are devoted to beauty; you serve your own sense of style with the dedication of a professional curator." },
    ISFP_LSCD: { mbti: 'ISFP', voiceType: 'LSCD', brandName: 'The Sunken Beauty', roast: "Your heart is a beautiful, fragile coral reef at the bottom of the ocean; your voice is the sound of the water slowly dissolving it." },

    // ESTP: The Entrepreneur
    ESTP_HFEC: { mbti: 'ESTP', voiceType: 'HFEC', brandName: 'The Wild Star', roast: "You’re a pop star who is probably going to be arrested after the show; your charisma is a high-speed chase set to music." },
    ESTP_HFED: { mbti: 'ESTP', voiceType: 'HFED', brandName: 'The High-Stakes Hype', roast: "You don't hype the crowd, you dare them; your voice is the sound of someone betting their life savings on a single coin toss." },
    ESTP_HSEC: { mbti: 'ESTP', voiceType: 'HSEC', brandName: 'The Bold Pup', roast: "You’re a golden retriever that just learned how to ride a motorcycle; you’re absolutely fearless and completely out of control." },
    ESTP_HSED: { mbti: 'ESTP', voiceType: 'HSED', brandName: 'The Hustler Brand', roast: "You’ve branded your adrenaline addiction as 'The Hustle.' Your voice is a sales pitch for a lifestyle that is slowly killing you." },
    ESTP_HFCC: { mbti: 'ESTP', voiceType: 'HFCC', brandName: 'The Burned Out Gambler', roast: "You’ve taken so many risks that your soul is now just a calculated spreadsheet of losses; you’re an adrenaline-bot that has run out of fuel." },
    ESTP_HFCD: { mbti: 'ESTP', voiceType: 'HFCD', brandName: 'The Growth Hacker', roast: "You treat life like a conversion funnel; you’re trying to A/B test your relationships until you find the one with the highest ROI." },
    ESTP_HSCC: { mbti: 'ESTP', voiceType: 'HSCC', brandName: 'The Adrenaline Whisper', roast: "You whisper about extreme sports so intensely that it sounds like you’re planning a heist; your 'relaxation' is a form of high-stakes gambling." },
    ESTP_HSCD: { mbti: 'ESTP', voiceType: 'HSCD', brandName: 'The Pirate King', roast: "You rule by seizing opportunity, not by right; your frequency suggests you’d trade your kingdom for a faster ship and a bigger score." },
    ESTP_LFEC: { mbti: 'ESTP', voiceType: 'LFEC', brandName: 'The Frontline Leader', roast: "You lead from the front because you can't stand being bored in the back; your voice is the sound of someone who needs chaos to feel alive." },
    ESTP_LFED: { mbti: 'ESTP', voiceType: 'LFED', brandName: 'The Intense Drama', roast: "Your life is an action movie where the hero sings all their lines; it’s incredibly exciting, but very hard to take seriously." },
    ESTP_LSEC: { mbti: 'ESTP', voiceType: 'LSEC', brandName: 'The Action Thriller', roast: "In a world where everyone plays it safe... one man will jump off a building just to see what happens." },
    ESTP_LSED: { mbti: 'ESTP', voiceType: 'LSED', brandName: 'The Neon Gambler', roast: "You sound like you’re broadcasting from a high-stakes poker table in Vegas at 4 AM; it’s loud, it’s flashy, and it’s completely unstable." },
    ESTP_LFCC: { mbti: 'ESTP', voiceType: 'LFCC', brandName: 'The Sensational News', roast: "You report on the news like it’s a demolition derby; you’re the anchorman of disaster pornography." },
    ESTP_LFCD: { mbti: 'ESTP', voiceType: 'LFCD', brandName: 'The street-wise Sage', roast: "Your wisdom comes from the school of hard knocks; you’re a sage who knows the odds of every craps table in the city." },
    ESTP_LSCC: { mbti: 'ESTP', voiceType: 'LSCC', brandName: 'The Risky Servant', roast: "You serve your own adrenaline; you’re a valet who is always trying to convince the master to bet the estate on black." },
    ESTP_LSCD: { mbti: 'ESTP', voiceType: 'LSCD', brandName: 'The Predator Deep', roast: "You are a shark in the deep ocean; your voice is the sound of something that is always moving, always hunting, and never satisfied." },

    // ESFP: The Entertainer
    ESFP_HFEC: { mbti: 'ESFP', voiceType: 'HFEC', brandName: 'The Natural Born Idol', roast: "You were born in a spotlight and you’ll die in one; your charisma is a 24-hour performance that you can never turn off." },
    ESFP_HFED: { mbti: 'ESFP', voiceType: 'HFED', brandName: 'The Party Monster', roast: "You don't hype the party, you are the party; your voice is the sound of a confetti cannon that has gained sentience." },
    ESFP_HSEC: { mbti: 'ESFP', voiceType: 'HSEC', brandName: 'The Ultimate Puppy', roast: "You’re a golden retriever that has somehow gotten into the espresso machine; you’re pure, unfiltered joy vibrating at a dangerous frequency." },
    ESFP_HSED: { mbti: 'ESFP', voiceType: 'HSED', brandName: 'The Spotlight Addict', roast: "You’ve branded your entire existence as 'Content.' Your voice is a livestream that is terrified of the 'End Broadcast' button." },
    ESFP_HFCC: { mbti: 'ESFP', voiceType: 'HFCC', brandName: 'The Hungover Clown', roast: "You’ve performed 'happy' so many times that your soul is now just a tired clown taking off its makeup in a dirty mirror." },
    ESFP_HFCD: { mbti: 'ESFP', voiceType: 'HFCD', brandName: 'The Visual Coder', roast: "You build systems that look amazing but don't actually work; you’re an architect of digital facades." },
    ESFP_HSCC: { mbti: 'ESFP', voiceType: 'HSCC', brandName: 'The Sensual Whisper', roast: "You whisper about textures and tastes so intensely that it’s basically food pornography; you’re seducing people with the sound of chewing." },
    ESFP_HSCD: { mbti: 'ESFP', voiceType: 'HSCD', brandName: 'The Party Prince', roast: "You rule a kingdom of endless revelry; your frequency suggests you’d abdicate the throne the moment the music stopped." },
    ESFP_LFEC: { mbti: 'ESFP', voiceType: 'LFEC', brandName: 'The Riot Leader', roast: "You lead the charge for 'Fun,' but your vocal intensity suggests you’d burn down the venue if the DJ refused to play your song." },
    ESFP_LFED: { mbti: 'ESFP', voiceType: 'LFED', brandName: 'The Grand Comedy', roast: "Your life is a slapstick comedy performed on an opera stage; it’s incredibly loud, completely chaotic, and everyone is watching." },
    ESFP_LSEC: { mbti: 'ESFP', voiceType: 'LSEC', brandName: 'The Blockbuster', roast: "You speak in explosions and catchphrases; your voice is a summer blockbuster that has zero plot but amazing special effects." },
    ESFP_LSED: { mbti: 'ESFP', voiceType: 'LSED', brandName: 'The Club King', roast: "You sound like the DJ at a club that is slowly running out of drugs; it’s high-energy, but there’s a creeping desperation underneath." },
    ESFP_LFCC: { mbti: 'ESFP', voiceType: 'LFCC', brandName: 'The Entertainment News', roast: "You report on celebrity gossip with the gravity of a moon landing; you’re the anchorman of the trivial." },
    ESFP_LFCD: { mbti: 'ESFP', voiceType: 'LFCD', brandName: 'The Hedonistic Sage', roast: "Your wisdom comes from trying everything once, twice if you liked it; you’re a sage who thinks the meaning of life is found at the bottom of a bottle." },
    ESFP_LSCC: { mbti: 'ESFP', voiceType: 'LSCC', brandName: 'The Showman Valet', roast: "You serve with flair; you’re a valet who makes pouring tea look like a Las Vegas magic trick." },
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
    COUPLE_MIX: { roastFragment: "two voices colliding like binary stars in the void" },
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
