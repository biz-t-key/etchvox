// 256 Duo-Identity Matrix - Complete
// EtchVox: The Complete 256 Duo-Identity Matrix
// All type combinations with labels and taglines

export interface DuoIdentity {
    typeA: string;
    typeB: string;
    label: string;
    tagline: string;
}

export const duoIdentityMatrix: DuoIdentity[] = [
    // ===== CLUSTER 1: Pop Star (HFEC) × Others =====
    { typeA: 'HFEC', typeB: 'HFEC', label: 'The Feedback Loop', tagline: 'Two spotlights, zero shadows.' },
    { typeA: 'HFEC', typeB: 'HFED', label: 'The World Tour', tagline: '10% talent, 90% marketing.' },
    { typeA: 'HFEC', typeB: 'HSEC', label: 'The Fan Club', tagline: 'Unconditional love meets absolute ego.' },
    { typeA: 'HFEC', typeB: 'HSED', label: 'The Paper Kingdom', tagline: 'A fragile alliance of vanity.' },
    { typeA: 'HFEC', typeB: 'HFCC', label: 'The Glitched Idol', tagline: 'Desperate for applause from a void.' },
    { typeA: 'HFEC', typeB: 'HFCD', label: 'The Auto-Tune Project', tagline: 'Correcting the soul with code.' },
    { typeA: 'HFEC', typeB: 'HSCC', label: 'The Backstage Whisper', tagline: 'Shouting vs. breathing.' },
    { typeA: 'HFEC', typeB: 'HSCD', label: 'The Court Jester', tagline: 'Entertaining the bored elite.' },
    { typeA: 'HFEC', typeB: 'LFEC', label: 'The Propaganda Machine', tagline: 'A loud voice serving a hard fist.' },
    { typeA: 'HFEC', typeB: 'LFED', label: 'The Genre Clash', tagline: 'Popcorn meets the high-brow.' },
    { typeA: 'HFEC', typeB: 'LSEC', label: 'The Viral Sensation', tagline: 'Intense hype for a 15-second life.' },
    { typeA: 'HFEC', typeB: 'LSED', label: 'The Afterparty', tagline: 'Exhaustion dressed in sequins.' },
    { typeA: 'HFEC', typeB: 'LFCC', label: 'The Scandal Report', tagline: 'Facts struggling to catch up to fame.' },
    { typeA: 'HFEC', typeB: 'LFCD', label: 'The Shallow Epiphany', tagline: 'Deep thoughts, bright lights.' },
    { typeA: 'HFEC', typeB: 'LSCC', label: 'The Diva & The Detail', tagline: 'Someone has to clean the glitter.' },
    { typeA: 'HFEC', typeB: 'LSCD', label: 'The Surface Skimmer', tagline: 'Dazzling lights above a dark abyss.' },

    // ===== CLUSTER 2: Hype Man (HFED) × Others =====
    { typeA: 'HFED', typeB: 'HFEC', label: 'The Opening Act', tagline: 'Building the stage for a ghost.' },
    { typeA: 'HFED', typeB: 'HFED', label: 'The Echo Chamber', tagline: 'Loudness with nowhere to go.' },
    { typeA: 'HFED', typeB: 'HSEC', label: 'The Puppy Rally', tagline: 'Aggressively happy.' },
    { typeA: 'HFED', typeB: 'HSED', label: 'The Clout Chasers', tagline: 'Selling air to people with no breath.' },
    { typeA: 'HFED', typeB: 'HFCC', label: 'The Dead Battery', tagline: 'Cheering for a machine that won\'t start.' },
    { typeA: 'HFED', typeB: 'HFCD', label: 'The Demo Day', tagline: 'Optimism meeting a bug report.' },
    { typeA: 'HFED', typeB: 'HSCC', label: 'The Sensory Mismatch', tagline: 'A megaphone in a library.' },
    { typeA: 'HFED', typeB: 'HSCD', label: 'The Herald', tagline: 'Announcing someone who doesn\'t care.' },
    { typeA: 'HFED', typeB: 'LFEC', label: 'The War Drum', tagline: 'The rhythm before the violence.' },
    { typeA: 'HFED', typeB: 'LFED', label: 'The Stadium Opera', tagline: 'Low-brow energy, high-brow drama.' },
    { typeA: 'HFED', typeB: 'LSEC', label: 'The Ultimate Teaser', tagline: 'All climax, no story.' },
    { typeA: 'HFED', typeB: 'LSED', label: 'The 4 AM Vibe', tagline: 'Desperate energy vs. cool apathy.' },
    { typeA: 'HFED', typeB: 'LFCC', label: 'The Infotainment', tagline: 'Breaking news about nothing.' },
    { typeA: 'HFED', typeB: 'LFCD', label: 'The Carnival Preacher', tagline: 'Philosophy sold like a used car.' },
    { typeA: 'HFED', typeB: 'LSCC', label: 'The Mess & The Mop', tagline: 'Creating chaos with manners.' },
    { typeA: 'HFED', typeB: 'LSCD', label: 'The Shallow Ripples', tagline: 'Splashing in an endless ocean.' },

    // ===== CLUSTER 3: Golden Retriever (HSEC) × Others =====
    { typeA: 'HSEC', typeB: 'HFEC', label: 'The Loyal Groupie', tagline: 'Wagging tails at every chorus.' },
    { typeA: 'HSEC', typeB: 'HFED', label: 'The Eternal Playdate', tagline: 'Infinite energy, zero direction.' },
    { typeA: 'HSEC', typeB: 'HSEC', label: 'The Puppy Pile', tagline: 'Suffocatingly wholesome.' },
    { typeA: 'HSEC', typeB: 'HSED', label: 'The Paid Bestie', tagline: 'Genuine warmth for a fake camera.' },
    { typeA: 'HSEC', typeB: 'HFCC', label: 'The Unrequited Fetch', tagline: 'Bringing a ball to a computer.' },
    { typeA: 'HSEC', typeB: 'HFCD', label: 'The Office Dog', tagline: 'Emotional support for the stressed.' },
    { typeA: 'HSEC', typeB: 'HSCC', label: 'The Gentle Nudge', tagline: 'Quiet comfort for the anxious.' },
    { typeA: 'HSEC', typeB: 'HSCD', label: 'The Palace Pet', tagline: 'Privilege with fur.' },
    { typeA: 'HSEC', typeB: 'LFEC', label: 'The Service Animal', tagline: 'Loyalty under strict orders.' },
    { typeA: 'HSEC', typeB: 'LFED', label: 'The Tragic Puppy', tagline: 'Whining at the high notes.' },
    { typeA: 'HSEC', typeB: 'LSEC', label: 'The Hero\'s Companion', tagline: 'Emotional stakes in 2D.' },
    { typeA: 'HSEC', typeB: 'LSED', label: 'The Sleepy Cuddle', tagline: 'Warmth in the neon dark.' },
    { typeA: 'HSEC', typeB: 'LFCC', label: 'The Human Interest Story', tagline: 'A soft break in a hard world.' },
    { typeA: 'HSEC', typeB: 'LFCD', label: 'The Stoic & The Sunlight', tagline: 'Deep thoughts vs. pure joy.' },
    { typeA: 'HSEC', typeB: 'LSCC', label: 'The House Guards', tagline: 'Manners and loyalty combined.' },
    { typeA: 'HSEC', typeB: 'LSCD', label: 'The Shore & The Sea', tagline: 'Safe land watching a deep mystery.' },

    // ===== CLUSTER 4: Influencer (HSED) × Others =====
    { typeA: 'HSED', typeB: 'HFEC', label: 'The Brand Deal', tagline: 'Mutual exploitation of vanity.' },
    { typeA: 'HSED', typeB: 'HFED', label: 'The Engagement Farm', tagline: 'Harvesting likes with loud noises.' },
    { typeA: 'HSED', typeB: 'HSEC', label: 'The Aesthetic Companion', tagline: 'Using warmth for better lighting.' },
    { typeA: 'HSED', typeB: 'HSED', label: 'The Mirror Dimension', tagline: 'Two egos reflecting into infinity.' },
    { typeA: 'HSED', typeB: 'HFCC', label: 'The Canceled Bot', tagline: 'Posting to an audience of none.' },
    { typeA: 'HSED', typeB: 'HFCD', label: 'The Algorithm Victim', tagline: 'A soul shaped by a feed.' },
    { typeA: 'HSED', typeB: 'HSCC', label: 'The Whispering Vlog', tagline: 'Selling intimacy by the second.' },
    { typeA: 'HSED', typeB: 'HSCD', label: 'The Social Climber', tagline: 'Clutching at old money with new hands.' },
    { typeA: 'HSED', typeB: 'LFEC', label: 'The Public Relations', tagline: 'Weaponizing a smile.' },
    { typeA: 'HSED', typeB: 'LFED', label: 'The Diva Vlog', tagline: 'High drama for a small screen.' },
    { typeA: 'HSED', typeB: 'LSEC', label: 'The Clickbait', tagline: 'A shock to the system, then nothing.' },
    { typeA: 'HSED', typeB: 'LSED', label: 'The Sunset Filter', tagline: 'Chasing the aesthetic of the night.' },
    { typeA: 'HSED', typeB: 'LFCC', label: 'The Fake News', tagline: 'Style over fact, every time.' },
    { typeA: 'HSED', typeB: 'LFCD', label: 'The Zen Quote', tagline: 'Depth reduced to a caption.' },
    { typeA: 'HSED', typeB: 'LSCC', label: 'The Personal Brand', tagline: 'Meticulous service for a public face.' },
    { typeA: 'HSED', typeB: 'LSCD', label: 'The Shallow End', tagline: 'Tanning while the world drowns.' },

    // ===== CLUSTER 5: Bored Robot (HFCC) × Others =====
    { typeA: 'HFCC', typeB: 'HFEC', label: 'The Synthesizer', tagline: 'Manufacturing emotion for the masses.' },
    { typeA: 'HFCC', typeB: 'HFED', label: 'The Error Code', tagline: 'Cannot compute this level of noise.' },
    { typeA: 'HFCC', typeB: 'HSEC', label: 'The Mechanical Bone', tagline: 'Functional but feelingless.' },
    { typeA: 'HFCC', typeB: 'HSED', label: 'The Bot Follower', tagline: 'A silent number in a fake count.' },
    { typeA: 'HFCC', typeB: 'HFCC', label: 'The Server Room', tagline: 'Two voids staring at each other.' },
    { typeA: 'HFCC', typeB: 'HFCD', label: 'The Debug Session', tagline: 'The machine talking to its maker.' },
    { typeA: 'HFCC', typeB: 'HSCC', label: 'The White Noise', tagline: 'Static that feels like comfort.' },
    { typeA: 'HFCC', typeB: 'HSCD', label: 'The Automated Guard', tagline: 'Structure without the soul.' },
    { typeA: 'HFCC', typeB: 'LFEC', label: 'The Drone Strike', tagline: 'Efficient, cold, and final.' },
    { typeA: 'HFCC', typeB: 'LFED', label: 'The Metal Phantom', tagline: 'Precision meeting tragic passion.' },
    { typeA: 'HFCC', typeB: 'LSEC', label: 'The Reboot', tagline: 'Calculated intensity, zero heart.' },
    { typeA: 'HFCC', typeB: 'LSED', label: 'The Lo-Fi Beat', tagline: 'Repetitive sounds for lonely hours.' },
    { typeA: 'HFCC', typeB: 'LFCC', label: 'The Teleprompter', tagline: 'Reading the end of the world.' },
    { typeA: 'HFCC', typeB: 'LFCD', label: 'The Binary Wisdom', tagline: 'Truth reduced to 1s and 0s.' },
    { typeA: 'HFCC', typeB: 'LSCC', label: 'The Smart Home', tagline: 'Service without the smile.' },
    { typeA: 'HFCC', typeB: 'LSCD', label: 'The Deep Sea Probe', tagline: 'Searching the abyss for meaning.' },

    // ===== CLUSTER 6: Tech Lead (HFCD) × Others =====
    { typeA: 'HFCD', typeB: 'HFEC', label: 'The Auto-Tuner', tagline: 'Applying logic to a pretty mess.' },
    { typeA: 'HFCD', typeB: 'HFED', label: 'The Demo Crash', tagline: 'A loud pitch vs. a hard reality.' },
    { typeA: 'HFCD', typeB: 'HSEC', label: 'The Bug & The Support', tagline: 'Stress meeting unconditional love.' },
    { typeA: 'HFCD', typeB: 'HSED', label: 'The UI Designer', tagline: 'Optimizing a face for the feed.' },
    { typeA: 'HFCD', typeB: 'HFCC', label: 'The Root Access', tagline: 'Fixing a machine that\'s lost its mind.' },
    { typeA: 'HFCD', typeB: 'HFCD', label: 'The Merge Conflict', tagline: 'Two right answers, zero compromise.' },
    { typeA: 'HFCD', typeB: 'HSCC', label: 'The Clean Code', tagline: 'The soothing sound of efficiency.' },
    { typeA: 'HFCD', typeB: 'HSCD', label: 'The New Money Architect', tagline: 'Building empires for old blood.' },
    { typeA: 'HFCD', typeB: 'LFEC', label: 'The Cyber Warfare', tagline: 'Strategic destruction from a desk.' },
    { typeA: 'HFCD', typeB: 'LFED', label: 'The Technical Glitch', tagline: 'A tragic aria interrupted by a Slack notification.' },
    { typeA: 'HFCD', typeB: 'LSEC', label: 'The CGI Overdose', tagline: 'All rendering, no plot.' },
    { typeA: 'HFCD', typeB: 'LSED', label: 'The Coding Session', tagline: 'Neon lights and focused logic.' },
    { typeA: 'HFCD', typeB: 'LFCC', label: 'The Data Leak', tagline: 'Reporting the vulnerability.' },
    { typeA: 'HFCD', typeB: 'LFCD', label: 'The Digital Monk', tagline: 'Logic seeking the ultimate truth.' },
    { typeA: 'HFCD', typeB: 'LSCC', label: 'The Optimization', tagline: 'Perfect service, perfectly executed.' },
    { typeA: 'HFCD', typeB: 'LSCD', label: 'The Big Data', tagline: 'Measuring the infinite ocean.' },

    // ===== CLUSTER 7: ASMR Artist (HSCC) × Others =====
    { typeA: 'HSCC', typeB: 'HFEC', label: 'The Silent Scream', tagline: 'Intimacy vs. the spotlight.' },
    { typeA: 'HSCC', typeB: 'HFED', label: 'The Tingle & The Shout', tagline: 'A headache in the making.' },
    { typeA: 'HSCC', typeB: 'HSEC', label: 'The Gentle Pat', tagline: 'Pure, quiet affection.' },
    { typeA: 'HSCC', typeB: 'HSED', label: 'The Intimacy Economy', tagline: 'Selling whispers for clout.' },
    { typeA: 'HSCC', typeB: 'HFCC', label: 'The Soft Static', tagline: 'Human breathing vs. machine humming.' },
    { typeA: 'HSCC', typeB: 'HFCD', label: 'The Low-Stress Beta', tagline: 'Soothing the engineer\'s mind.' },
    { typeA: 'HSCC', typeB: 'HSCC', label: 'The Breathless Void', tagline: 'Too quiet to be heard.' },
    { typeA: 'HSCC', typeB: 'HSCD', label: 'The Secret Affair', tagline: 'Whispers behind the throne.' },
    { typeA: 'HSCC', typeB: 'LFEC', label: 'The Interrogation', tagline: 'A soft voice in a hard room.' },
    { typeA: 'HSCC', typeB: 'LFED', label: 'The Silent Drama', tagline: 'Breath vs. the lung capacity of a god.' },
    { typeA: 'HSCC', typeB: 'LSEC', label: 'The Psychological Thriller', tagline: 'Small sounds, big fear.' },
    { typeA: 'HSCC', typeB: 'LSED', label: 'The Midnight Pill', tagline: 'Softness for the sleepless.' },
    { typeA: 'HSCC', typeB: 'LFCC', label: 'The Quiet Truth', tagline: 'Reporting in a whisper.' },
    { typeA: 'HSCC', typeB: 'LFCD', label: 'The Zen Breath', tagline: 'Mindfulness in every syllable.' },
    { typeA: 'HSCC', typeB: 'LSCC', label: 'The Discreet Service', tagline: 'Manners so quiet they vanish.' },
    { typeA: 'HSCC', typeB: 'LSCD', label: 'The Underwater Echo', tagline: 'Faint sounds in a heavy world.' },

    // ===== CLUSTER 8: Royal (HSCD) × Others =====
    { typeA: 'HSCD', typeB: 'HFEC', label: 'The Patronage', tagline: 'Funding the jester\'s dream.' },
    { typeA: 'HSCD', typeB: 'HFED', label: 'The Town Crier', tagline: 'The noise that serves the crown.' },
    { typeA: 'HSCD', typeB: 'HSEC', label: 'The Pedigree', tagline: 'The crown and its golden shadow.' },
    { typeA: 'HSCD', typeB: 'HSED', label: 'The Gilded Cage', tagline: 'Old status vs. new vanity.' },
    { typeA: 'HSCD', typeB: 'HFCC', label: 'The Frozen Empire', tagline: 'Rule without the pulse.' },
    { typeA: 'HSCD', typeB: 'HFCD', label: 'The Silicon Aristocracy', tagline: 'Code becoming the new bloodline.' },
    { typeA: 'HSCD', typeB: 'HSCC', label: 'The Royal Secret', tagline: 'A whisper in a gilded hall.' },
    { typeA: 'HSCD', typeB: 'HSCD', label: 'The Divine Right', tagline: 'Two suns in one sky.' },
    { typeA: 'HSCD', typeB: 'LFEC', label: 'The Iron Throne', tagline: 'The authority and its executioner.' },
    { typeA: 'HSCD', typeB: 'LFED', label: 'The High Tragedy', tagline: 'Grandeur meeting grand drama.' },
    { typeA: 'HSCD', typeB: 'LSEC', label: 'The Period Piece', tagline: 'Dramatizing the old blood.' },
    { typeA: 'HSCD', typeB: 'LSED', label: 'The VIP Lounge', tagline: 'Exclusivity in the dark.' },
    { typeA: 'HSCD', typeB: 'LFCC', label: 'The Decree', tagline: 'Official facts for the common folk.' },
    { typeA: 'HSCD', typeB: 'LFCD', label: 'The King & The Advisor', tagline: 'Power seeking wisdom.' },
    { typeA: 'HSCD', typeB: 'LSCC', label: 'The Tradition', tagline: 'Perfectly served authority.' },
    { typeA: 'HSCD', typeB: 'LSCD', label: 'The Ancient Depth', tagline: 'History that never surfaces.' },

    // ===== CLUSTER 9: Commander (LFEC) × Others =====
    { typeA: 'LFEC', typeB: 'HFEC', label: 'The Anthem', tagline: 'Music for a marching army.' },
    { typeA: 'LFEC', typeB: 'HFED', label: 'The Morale Booster', tagline: 'Aggressive motivation.' },
    { typeA: 'LFEC', typeB: 'HSEC', label: 'The K-9 Unit', tagline: 'Loyalty under pressure.' },
    { typeA: 'LFEC', typeB: 'HSED', label: 'The Propaganda', tagline: 'A beautiful face for a hard law.' },
    { typeA: 'LFEC', typeB: 'HFCC', label: 'The War Room', tagline: 'Cold, calculated conquest.' },
    { typeA: 'LFEC', typeB: 'HFCD', label: 'The Strategic Asset', tagline: 'Logic weaponized.' },
    { typeA: 'LFEC', typeB: 'HSCC', label: 'The Velvet Glove', tagline: 'A hard fist in a soft sound.' },
    { typeA: 'LFEC', typeB: 'HSCD', label: 'The Loyal Executioner', tagline: 'Defending the crown.' },
    { typeA: 'LFEC', typeB: 'LFEC', label: 'The Civil War', tagline: 'A kitchen with two kings.' },
    { typeA: 'LFEC', typeB: 'LFED', label: 'The Valkyrie', tagline: 'Warfare on a grand scale.' },
    { typeA: 'LFEC', typeB: 'LSEC', label: 'The Action Hero', tagline: 'Intense, short, and loud.' },
    { typeA: 'LFEC', typeB: 'LSED', label: 'The Night Watch', tagline: 'Authority in the shadows.' },
    { typeA: 'LFEC', typeB: 'LFCC', label: 'The Martial Law', tagline: 'Reporting the orders.' },
    { typeA: 'LFEC', typeB: 'LFCD', label: 'The General & The Monk', tagline: 'Force meeting the void.' },
    { typeA: 'LFEC', typeB: 'LSCC', label: 'The Orderly House', tagline: 'Structure in every corner.' },
    { typeA: 'LFEC', typeB: 'LSCD', label: 'The Nuclear Sub', tagline: 'Power hidden in the deep.' },

    // ===== CLUSTER 10: Opera Star (LFED) × Others =====
    { typeA: 'LFED', typeB: 'HFEC', label: 'The Crossover', tagline: 'High-class meets the masses.' },
    { typeA: 'LFED', typeB: 'HFED', label: 'The Tragic Hype', tagline: 'Grand drama for a cheap crowd.' },
    { typeA: 'LFED', typeB: 'HSEC', label: 'The Melancholy Pup', tagline: 'Joy meeting tragic high notes.' },
    { typeA: 'LFED', typeB: 'HSED', label: 'The Digital Diva', tagline: 'Vanity on a grand scale.' },
    { typeA: 'LFED', typeB: 'HFCC', label: 'The Ghost in the Machine', tagline: 'Aria for a circuit board.' },
    { typeA: 'LFED', typeB: 'HFCD', label: 'The Sound Engineer', tagline: 'Measuring the soul\'s frequency.' },
    { typeA: 'LFED', typeB: 'HSCC', label: 'The Breath & The Song', tagline: 'Opposite ends of the lung.' },
    { typeA: 'LFED', typeB: 'HSCD', label: 'The Grand Patronage', tagline: 'Drama fit for a king.' },
    { typeA: 'LFED', typeB: 'LFEC', label: 'The War Requiem', tagline: 'The beauty of destruction.' },
    { typeA: 'LFED', typeB: 'LFED', label: 'The Duet of Death', tagline: 'Too much drama for one life.' },
    { typeA: 'LFED', typeB: 'LSEC', label: 'The Cinematic Epic', tagline: 'Grand scale, grand sound.' },
    { typeA: 'LFED', typeB: 'LSED', label: 'The Night Opera', tagline: 'Diva in a smoky club.' },
    { typeA: 'LFED', typeB: 'LFCC', label: 'The Breaking Tragedy', tagline: 'Reporting the fall of a hero.' },
    { typeA: 'LFED', typeB: 'LFCD', label: 'The Mythic Truth', tagline: 'Wisdom told through a song.' },
    { typeA: 'LFED', typeB: 'LSCC', label: 'The Backstage Service', tagline: 'Maintaining the grandeur.' },
    { typeA: 'LFED', typeB: 'LSCD', label: 'The Siren\'s Call', tagline: 'A voice from the deep abyss.' },

    // ===== CLUSTER 11: Movie Trailer (LSEC) × Others =====
    { typeA: 'LSEC', typeB: 'HFEC', label: 'The Summer Blockbuster', tagline: 'Loud, shiny, and brief.' },
    { typeA: 'LSEC', typeB: 'HFED', label: 'The Infinite Tease', tagline: 'All climax, no movie.' },
    { typeA: 'LSEC', typeB: 'HSEC', label: 'The Hero\'s Journey', tagline: 'Wholesome stakes in HD.' },
    { typeA: 'LSEC', typeB: 'HSED', label: 'The Sponsored Ad', tagline: 'Selling the sizzle, not the steak.' },
    { typeA: 'LSEC', typeB: 'HFCC', label: 'The Sci-Fi Reboot', tagline: 'Calculated thrills.' },
    { typeA: 'LSEC', typeB: 'HFCD', label: 'The CGI Render', tagline: 'Logic masquerading as epic.' },
    { typeA: 'LSEC', typeB: 'HSCC', label: 'The Jump Scare', tagline: 'Small sounds, sudden noise.' },
    { typeA: 'LSEC', typeB: 'HSCD', label: 'The Period Epic', tagline: 'Dramatizing the old world.' },
    { typeA: 'LSEC', typeB: 'LFEC', label: 'The Action Franchise', tagline: 'Warfare as entertainment.' },
    { typeA: 'LSEC', typeB: 'LFED', label: 'The Grand Finale', tagline: 'Drama that won\'t end.' },
    { typeA: 'LSEC', typeB: 'LSEC', label: 'The Spoiler', tagline: 'Too much intensity at once.' },
    { typeA: 'LSEC', typeB: 'LSED', label: 'The Noir Vibe', tagline: 'Smoky mystery, loud bass.' },
    { typeA: 'LSEC', typeB: 'LFCC', label: 'The Sensationalist', tagline: 'Making the mundane epic.' },
    { typeA: 'LSEC', typeB: 'LFCD', label: 'The False Prophet', tagline: 'Deep words in an action voice.' },
    { typeA: 'LSEC', typeB: 'LSCC', label: 'The Plot Device', tagline: 'Serving the hero\'s narrative.' },
    { typeA: 'LSEC', typeB: 'LSCD', label: 'The Oceanic Terror', tagline: 'Something big in the dark.' },

    // ===== CLUSTER 12: Late Night DJ (LSED) × Others =====
    { typeA: 'LSED', typeB: 'HFEC', label: 'The Remix', tagline: 'Making the idol dance at 2 AM.' },
    { typeA: 'LSED', typeB: 'HFED', label: 'The Club Night', tagline: 'Forced energy in a smoky room.' },
    { typeA: 'LSED', typeB: 'HSEC', label: 'The Midnight Hug', tagline: 'Comfort in the neon dark.' },
    { typeA: 'LSED', typeB: 'HSED', label: 'The After-Hours Post', tagline: 'The aesthetic of the lonely.' },
    { typeA: 'LSED', typeB: 'HFCC', label: 'The Lo-Fi Stream', tagline: 'Repetitive comfort for machines.' },
    { typeA: 'LSED', typeB: 'HFCD', label: 'The Late Shift', tagline: 'Neon lights and cold logic.' },
    { typeA: 'LSED', typeB: 'HSCC', label: 'The Pillow Talk', tagline: 'Whispers and a bass line.' },
    { typeA: 'LSED', typeB: 'HSCD', label: 'The Exclusive Invite', tagline: 'Status in the shadows.' },
    { typeA: 'LSED', typeB: 'LFEC', label: 'The Secret Police', tagline: 'Authority in the dark.' },
    { typeA: 'LSED', typeB: 'LFED', label: 'The Tragic Club', tagline: 'Diva in the moonlight.' },
    { typeA: 'LSED', typeB: 'LSEC', label: 'The Teaser Track', tagline: 'Sultry and intense.' },
    { typeA: 'LSED', typeB: 'LSED', label: 'The Endless Night', tagline: 'Two shadows in a booth.' },
    { typeA: 'LSED', typeB: 'LFCC', label: 'The Midnight Report', tagline: 'Facts for the sleepless.' },
    { typeA: 'LSED', typeB: 'LFCD', label: 'The Night Owl Philosophy', tagline: 'Wisdom after the third drink.' },
    { typeA: 'LSED', typeB: 'LSCC', label: 'The Last Call', tagline: 'Perfect service for the weary.' },
    { typeA: 'LSED', typeB: 'LSCD', label: 'The Abyss Disco', tagline: 'Slow beats in the deep.' },

    // ===== CLUSTER 13: News Anchor (LFCC) × Others =====
    { typeA: 'LFCC', typeB: 'HFEC', label: 'The Tabloid', tagline: 'Facts chasing the fame.' },
    { typeA: 'LFCC', typeB: 'HFED', label: 'The Infotainment', tagline: 'Breaking news about nothing.' },
    { typeA: 'LFCC', typeB: 'HSEC', label: 'The Rescue Dog Story', tagline: 'Wholesome filler.' },
    { typeA: 'LFCC', typeB: 'HSED', label: 'The Fake Story', tagline: 'Style reporting on style.' },
    { typeA: 'LFCC', typeB: 'HFCC', label: 'The Automated Bulletin', tagline: 'Reading the end of the world.' },
    { typeA: 'LFCC', typeB: 'HFCD', label: 'The Security Breach', tagline: 'Reporting the bug.' },
    { typeA: 'LFCC', typeB: 'HSCC', label: 'The Soft Report', tagline: 'Gentle facts.' },
    { typeA: 'LFCC', typeB: 'HSCD', label: 'The Official Decree', tagline: 'Authority spoken as truth.' },
    { typeA: 'LFCC', typeB: 'LFEC', label: 'The Martial Law', tagline: 'Reporting the orders.' },
    { typeA: 'LFCC', typeB: 'LFED', label: 'The Grand Tragedy', tagline: 'Dramatizing the disaster.' },
    { typeA: 'LFCC', typeB: 'LSEC', label: 'The Clickbait Headline', tagline: 'Sensation over substance.' },
    { typeA: 'LFCC', typeB: 'LSED', label: 'The Late Update', tagline: 'Facts for the night owls.' },
    { typeA: 'LFCC', typeB: 'LFCC', label: 'The Standard Protocol', tagline: 'Information without soul.' },
    { typeA: 'LFCC', typeB: 'LFCD', label: 'The True Prophet', tagline: 'Facts meeting their meaning.' },
    { typeA: 'LFCC', typeB: 'LSCC', label: 'The Daily Briefing', tagline: 'Meticulous information.' },
    { typeA: 'LFCC', typeB: 'LSCD', label: 'The Sunken Truth', tagline: 'Facts from the abyss.' },

    // ===== CLUSTER 14: Sage (LFCD) × Others =====
    { typeA: 'LFCD', typeB: 'HFEC', label: 'The Shallow Epiphany', tagline: 'Deep thoughts, bright lights.' },
    { typeA: 'LFCD', typeB: 'HFED', label: 'The Carnival Preacher', tagline: 'Wisdom sold like a used car.' },
    { typeA: 'LFCD', typeB: 'HSEC', label: 'The Stoic & The Sunlight', tagline: 'Deep thoughts vs. pure joy.' },
    { typeA: 'LFCD', typeB: 'HSED', label: 'The Zen Quote', tagline: 'Depth reduced to a caption.' },
    { typeA: 'LFCD', typeB: 'HFCC', label: 'The Binary Wisdom', tagline: 'Truth reduced to 1s and 0s.' },
    { typeA: 'LFCD', typeB: 'HFCD', label: 'The Digital Monk', tagline: 'Logic seeking the ultimate truth.' },
    { typeA: 'LFCD', typeB: 'HSCC', label: 'The Zen Breath', tagline: 'Mindfulness in every syllable.' },
    { typeA: 'LFCD', typeB: 'HSCD', label: 'The King & The Advisor', tagline: 'Power seeking wisdom.' },
    { typeA: 'LFCD', typeB: 'LFEC', label: 'The General & The Monk', tagline: 'Force meeting the void.' },
    { typeA: 'LFCD', typeB: 'LFED', label: 'The Mythic Truth', tagline: 'Wisdom told through a song.' },
    { typeA: 'LFCD', typeB: 'LSEC', label: 'The False Prophet', tagline: 'Deep words in an action voice.' },
    { typeA: 'LFCD', typeB: 'LSED', label: 'The Night Owl Philosophy', tagline: 'Wisdom after the third drink.' },
    { typeA: 'LFCD', typeB: 'LFCC', label: 'The True Prophet', tagline: 'Facts meeting their meaning.' },
    { typeA: 'LFCD', typeB: 'LFCD', label: 'The Silence', tagline: 'Nothing left to say.' },
    { typeA: 'LFCD', typeB: 'LSCC', label: 'The Zen Master', tagline: 'Service as a spiritual act.' },
    { typeA: 'LFCD', typeB: 'LSCD', label: 'The Ancient Mind', tagline: 'Depth within more depth.' },

    // ===== CLUSTER 15: Loyal Butler (LSCC) × Others =====
    { typeA: 'LSCC', typeB: 'HFEC', label: 'The Diva & The Detail', tagline: 'Someone has to clean the glitter.' },
    { typeA: 'LSCC', typeB: 'HFED', label: 'The Mess & The Mop', tagline: 'Creating chaos with manners.' },
    { typeA: 'LSCC', typeB: 'HSEC', label: 'The House Guards', tagline: 'Manners and loyalty combined.' },
    { typeA: 'LSCC', typeB: 'HSED', label: 'The Personal Brand', tagline: 'Meticulous service for a public face.' },
    { typeA: 'LSCC', typeB: 'HFCC', label: 'The Smart Home', tagline: 'Service without the smile.' },
    { typeA: 'LSCC', typeB: 'HFCD', label: 'The Optimization', tagline: 'Perfect service, perfectly executed.' },
    { typeA: 'LSCC', typeB: 'HSCC', label: 'The Discreet Service', tagline: 'Manners so quiet they vanish.' },
    { typeA: 'LSCC', typeB: 'HSCD', label: 'The Tradition', tagline: 'Perfectly served authority.' },
    { typeA: 'LSCC', typeB: 'LFEC', label: 'The Orderly House', tagline: 'Structure in every corner.' },
    { typeA: 'LSCC', typeB: 'LFED', label: 'The Backstage Service', tagline: 'Maintaining the grandeur.' },
    { typeA: 'LSCC', typeB: 'LSEC', label: 'The Plot Device', tagline: 'Serving the hero\'s narrative.' },
    { typeA: 'LSCC', typeB: 'LSED', label: 'The Last Call', tagline: 'Perfect service for the weary.' },
    { typeA: 'LSCC', typeB: 'LFCC', label: 'The Daily Briefing', tagline: 'Meticulous information.' },
    { typeA: 'LSCC', typeB: 'LFCD', label: 'The Zen Master', tagline: 'Service as a spiritual act.' },
    { typeA: 'LSCC', typeB: 'LSCC', label: 'The Ghost House', tagline: 'Invisible hands everywhere.' },
    { typeA: 'LSCC', typeB: 'LSCD', label: 'The Sunken Service', tagline: 'Maintaining a lost world.' },

    // ===== CLUSTER 16: Deep Whale (LSCD) × Others =====
    { typeA: 'LSCD', typeB: 'HFEC', label: 'The Surface Skimmer', tagline: 'Dazzling lights above a dark abyss.' },
    { typeA: 'LSCD', typeB: 'HFED', label: 'The Shallow Ripples', tagline: 'Splashing in an endless ocean.' },
    { typeA: 'LSCD', typeB: 'HSEC', label: 'The Shore & The Sea', tagline: 'Safe land watching a deep mystery.' },
    { typeA: 'LSCD', typeB: 'HSED', label: 'The Shallow End', tagline: 'Tanning while the world drowns.' },
    { typeA: 'LSCD', typeB: 'HFCC', label: 'The Deep Sea Probe', tagline: 'Searching the abyss for meaning.' },
    { typeA: 'LSCD', typeB: 'HFCD', label: 'The Big Data', tagline: 'Measuring the infinite ocean.' },
    { typeA: 'LSCD', typeB: 'HSCC', label: 'The Underwater Echo', tagline: 'Faint sounds in a heavy world.' },
    { typeA: 'LSCD', typeB: 'HSCD', label: 'The Ancient Depth', tagline: 'History that never surfaces.' },
    { typeA: 'LSCD', typeB: 'LFEC', label: 'The Nuclear Sub', tagline: 'Power hidden in the deep.' },
    { typeA: 'LSCD', typeB: 'LFED', label: 'The Siren\'s Call', tagline: 'A voice from the deep abyss.' },
    { typeA: 'LSCD', typeB: 'LSEC', label: 'The Oceanic Terror', tagline: 'Something big in the dark.' },
    { typeA: 'LSCD', typeB: 'LSED', label: 'The Abyss Disco', tagline: 'Slow beats in the deep.' },
    { typeA: 'LSCD', typeB: 'LFCC', label: 'The Sunken Truth', tagline: 'Facts from the abyss.' },
    { typeA: 'LSCD', typeB: 'LFCD', label: 'The Ancient Mind', tagline: 'Depth within more depth.' },
    { typeA: 'LSCD', typeB: 'LSCC', label: 'The Sunken Service', tagline: 'Maintaining a lost world.' },
    { typeA: 'LSCD', typeB: 'LSCD', label: 'The Abyss', tagline: 'Darkness forever.' },
];

// Helper function to get duo identity
export function getDuoIdentity(typeA: string, typeB: string): DuoIdentity {
    // Try direct match
    let match = duoIdentityMatrix.find(
        (duo) => duo.typeA === typeA && duo.typeB === typeB
    );

    // Try reverse match
    if (!match) {
        match = duoIdentityMatrix.find(
            (duo) => duo.typeA === typeB && duo.typeB === typeA
        );
    }

    if (match) return match;

    // Fallback (should never happen with complete matrix)
    return {
        typeA,
        typeB,
        label: 'The Unknown Pairing',
        tagline: 'An unexplored combination.',
    };
}

// Get all identities for a specific type
export function getAllDuoIdentitiesForType(typeCode: string): DuoIdentity[] {
    return duoIdentityMatrix.filter(
        (duo) => duo.typeA === typeCode || duo.typeB === typeCode
    );
}
