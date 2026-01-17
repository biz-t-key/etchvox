import re

types = [
    'HFEC', 'HFED', 'HSEC', 'HSED', 'HFCC', 'HFCD', 'HSCC', 'HSCD',
    'LFEC', 'LFED', 'LSEC', 'LSED', 'LFCC', 'LFCD', 'LSCC', 'LSCD'
]

type_titles = {
    'Pop Star': 'HFEC', 'Hype Man': 'HFED', 'Golden Retriever': 'HSEC', 'Influencer': 'HSED',
    'Bored Robot': 'HFCC', 'Tech Lead': 'HFCD', 'ASMR Artist': 'HSCC', 'Royal': 'HSCD',
    'Commander': 'LFEC', 'Opera Star': 'LFED', 'Movie Trailer': 'LSEC', 'Late Night DJ': 'LSED',
    'News Anchor': 'LFCC', 'Sage': 'LFCD', 'Loyal Butler': 'LSCC', 'Deep Whale': 'LSCD'
}

with open('temp_roasts.txt', 'r', encoding='utf-8') as f:
    content = f.read()

sections = re.split(r'[I|V|X]+\. The .* Matrix', content)
sections = [s.strip() for s in sections if s.strip()]

matrix_entries = []

for i, section in enumerate(sections):
    if i >= 16: break
    typeA = types[i]
    
    # Extract entries within section
    # Matches patterns like: × Pop Star: "The Feedback Loop" Roast...
    # or: 17. × Pop Star: "The Marketing Agency" — Roast...
    lines = section.split('\n')
    for line in lines:
        if '×' not in line: continue
        
        match = re.search(r'× (.*?): "(.*?)" (?:— )?(.*)', line)
        if match:
            typeB_title = match.group(1).strip()
            label = match.group(2).strip()
            roast = match.group(3).strip()
            
            typeB = type_titles.get(typeB_title)
            if not typeB:
                # Try partial match or special cases
                for title, code in type_titles.items():
                    if title in typeB_title:
                        typeB = code
                        break
            
            if typeA and typeB:
                # Create a concise tagline from the first sentence or part of roast
                # or just use a placeholder if it's too long
                sentences = re.split(r'[.!?]', roast)
                tagline = sentences[0].strip() + '.'
                if len(tagline) > 60:
                    tagline = tagline[:57] + "..."

                matrix_entries.append({
                    'typeA': typeA,
                    'typeB': typeB,
                    'label': label,
                    'tagline': tagline,
                    'roast': roast
                })

# Generate TypeScript file
ts_content = """// 256 Duo-Identity Matrix - Complete
// EtchVox: The Complete 256 Duo-Identity Matrix
// All type combinations with labels, taglines, and detailed roasts

export interface DuoIdentity {
    typeA: string;
    typeB: string;
    label: string;
    tagline: string;  // Short one-liner
    roast?: string;   // Optional long-form cynical analysis
}

export const duoIdentityMatrix: DuoIdentity[] = [
"""

for entry in matrix_entries:
    roast_escaped = entry['roast'].replace("'", "\\'")
    tagline_escaped = entry['tagline'].replace("'", "\\'")
    label_escaped = entry['label'].replace("'", "\\'")
    ts_content += f"    {{ typeA: '{entry['typeA']}', typeB: '{entry['typeB']}', label: '{label_escaped}', tagline: '{tagline_escaped}', roast: '{roast_escaped}' }},\n"

ts_content += "];\n\n"
ts_content += """export function getDuoIdentity(typeA: string, typeB: string): DuoIdentity {
    const match = duoIdentityMatrix.find(d => 
        (d.typeA === typeA && d.typeB === typeB) || 
        (d.typeA === typeB && d.typeB === typeA)
    );

    if (match) return match;

    // Fallback (should never happen with complete matrix)
    return {
        typeA,
        typeB,
        label: 'The Unknown Pairing',
        tagline: 'An unexplored combination.',
        roast: 'No analysis available for this exotic pairing.'
    };
}
"""

with open('src/lib/duoIdentityMatrix.ts', 'w', encoding='utf-8') as f:
    f.write(ts_content)

print(f"Successfully generated {len(matrix_entries)} entries.")
