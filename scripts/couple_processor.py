#!/usr/bin/env python3
"""
VoiceGlow Couple Audio Processor
Analyzes couple recordings with hybrid timing-based segmentation.

Dependencies:
    pip install librosa numpy scipy

Usage:
    python couple_processor.py input.wav --output results.json
"""

import argparse
import json
import numpy as np
from dataclasses import dataclass, asdict
from typing import Optional, Tuple, List
import warnings
warnings.filterwarnings('ignore')

try:
    import librosa
    import librosa.display
except ImportError:
    print("Please install librosa: pip install librosa")
    exit(1)


# Audio segment definitions (in seconds)
SEGMENTS = {
    'calibration_a': (0, 5),
    'calibration_b': (5, 10),
    'unison': (10, 20),
    'stress_a': (20, 24),
    'stress_b': (24, 28),
    'alternating': (28, 36),
}


@dataclass
class AcousticMetrics:
    """Raw acoustic measurements"""
    pitch: float           # Hz (fundamental frequency)
    speed: float           # 0-1 (estimated speech rate)
    volume: float          # 0-1 (normalized RMS)
    tone: float            # Hz (spectral centroid)
    pitch_std: float       # Pitch variability
    volume_std: float      # Volume variability


@dataclass 
class AcousticTags:
    """Semantic tags for LLM interpretation"""
    pitch_tag: str
    speed_tag: str
    volume_tag: str
    tone_tag: str
    

@dataclass
class TogetherMetrics:
    """Metrics from unison recording"""
    harmony_score: float      # 0-100: How well pitches align
    sync_rate: float          # 0-1: Tempo synchronization
    dominance_a: float        # 0-1: Who's louder (A's portion)
    dominance_b: float        # 0-1: Who's louder (B's portion)
    blend_quality: str        # Interpretation


@dataclass
class CoupleAnalysisResult:
    """Complete analysis result"""
    user_a: dict
    user_b: dict
    together: dict
    delta: dict
    matrix_score: int


class AcousticQuantizer:
    """Converts raw numbers to semantic tags"""
    
    @staticmethod
    def get_pitch_tag(value: float) -> str:
        # Normalize Hz to 0-100 scale
        norm = min(100, max(0, ((value - 80) / 220) * 100))
        if norm < 20: return "Sub-bass / Gravitas (重厚)"
        if norm < 40: return "Deep / Resonant (共鳴)"
        if norm < 60: return "Baritone / Grounded (安定的)"
        if norm < 80: return "Tenor / Clear (明瞭)"
        return "Soprano / Crystalline (透き通った)"
    
    @staticmethod
    def get_speed_tag(value: float) -> str:
        norm = value * 100
        if norm < 20: return "Largo / Contemplative (熟考)"
        if norm < 40: return "Andante / Deliberate (慎重)"
        if norm < 60: return "Moderato / Conversational (会話的)"
        if norm < 80: return "Allegro / Energetic (活発)"
        return "Presto / Urgent (性急)"
    
    @staticmethod
    def get_volume_tag(value: float) -> str:
        norm = value * 100
        if norm < 20: return "Whisper / Intimate (親密)"
        if norm < 40: return "Soft / Gentle (穏やか)"
        if norm < 60: return "Mezzo / Balanced (バランス)"
        if norm < 80: return "Forte / Projecting (発信)"
        return "Fortissimo / Commanding (威厳)"
    
    @staticmethod
    def get_tone_tag(value: float) -> str:
        # Normalize centroid Hz to 0-100
        norm = min(100, max(0, ((value - 1000) / 3000) * 100))
        if norm < 20: return "Husky / Textured (ハスキー)"
        if norm < 40: return "Smoky / Warm (スモーキー)"
        if norm < 60: return "Neutral / Natural (ナチュラル)"
        if norm < 80: return "Bright / Polished (ブライト)"
        return "Piercing / Pure (純粋)"
    
    @classmethod
    def quantize(cls, metrics: AcousticMetrics) -> AcousticTags:
        return AcousticTags(
            pitch_tag=cls.get_pitch_tag(metrics.pitch),
            speed_tag=cls.get_speed_tag(metrics.speed),
            volume_tag=cls.get_volume_tag(metrics.volume),
            tone_tag=cls.get_tone_tag(metrics.tone),
        )


class SCMAnalyzer:
    """Stereotype Content Model analysis"""
    
    JOB_SCORES = {
        'lawyer': (90, 30), 'executive': (90, 20), 'engineer': (85, 40),
        'doctor': (85, 70), 'pilot': (85, 60), 'founder': (80, 70),
        'artist': (50, 90), 'teacher': (60, 85), 'counselor': (50, 95),
        'student': (50, 60), 'freelancer': (55, 55), 'other': (50, 50),
    }
    
    ACCENT_MODS = {
        'us': (5, -5), 'uk': (10, -10), 'au': (-5, 10),
        'in': (5, 5), 'asia': (5, 0), 'eu': (5, 5),
        'latam': (-5, 15), 'unknown': (0, 0),
    }
    
    @classmethod
    def analyze(cls, job: str, accent: str, metrics: AcousticMetrics) -> dict:
        base_comp, base_warmth = cls.JOB_SCORES.get(job.lower(), (50, 50))
        acc_comp, acc_warmth = cls.ACCENT_MODS.get(accent.lower(), (0, 0))
        
        # Voice adjustments
        voice_comp = ((metrics.speed * 100 + metrics.volume * 100) / 2 - 50) * 0.3
        voice_warmth = (((metrics.tone - 1000) / 3000 * 100) - 50) * 0.25
        
        final_comp = max(0, min(100, base_comp + acc_comp + voice_comp))
        final_warmth = max(0, min(100, base_warmth + acc_warmth + voice_warmth))
        
        # Archetype
        if final_comp >= 50 and final_warmth >= 50:
            archetype = "The Charismatic Ideal"
        elif final_comp >= 50 and final_warmth < 50:
            archetype = "The Efficient Strategist"
        elif final_comp < 50 and final_warmth >= 50:
            archetype = "The Empathetic Soul"
        else:
            archetype = "The Free Spirit"
        
        return {
            'competence': int(final_comp),
            'warmth': int(final_warmth),
            'archetype': archetype,
        }


def extract_audio_segment(y: np.ndarray, sr: int, start: float, end: float) -> np.ndarray:
    """Extract a segment from audio array"""
    start_sample = int(start * sr)
    end_sample = int(end * sr)
    return y[start_sample:end_sample]


def analyze_segment(y: np.ndarray, sr: int) -> AcousticMetrics:
    """Analyze a single audio segment"""
    
    # Skip if too quiet
    rms = np.sqrt(np.mean(y**2))
    if rms < 0.01:
        return AcousticMetrics(
            pitch=150, speed=0.5, volume=0, tone=2000,
            pitch_std=0, volume_std=0
        )
    
    # Pitch detection using pyin
    f0, voiced_flag, voiced_probs = librosa.pyin(
        y, fmin=50, fmax=500, sr=sr
    )
    valid_f0 = f0[~np.isnan(f0)]
    pitch = float(np.median(valid_f0)) if len(valid_f0) > 0 else 150.0
    pitch_std = float(np.std(valid_f0)) if len(valid_f0) > 0 else 0.0
    
    # Speech rate estimation (based on onset detection)
    onset_env = librosa.onset.onset_strength(y=y, sr=sr)
    onsets = librosa.onset.onset_detect(y=y, sr=sr)
    duration = len(y) / sr
    syllables_per_sec = len(onsets) / duration if duration > 0 else 0
    speed = min(1.0, max(0.0, syllables_per_sec / 6))  # Normalize to 0-1
    
    # Volume (RMS)
    rms_values = librosa.feature.rms(y=y)[0]
    volume = float(np.mean(rms_values))
    volume_std = float(np.std(rms_values))
    
    # Spectral centroid (tone brightness)
    centroid = librosa.feature.spectral_centroid(y=y, sr=sr)
    tone = float(np.mean(centroid))
    
    return AcousticMetrics(
        pitch=pitch,
        speed=speed,
        volume=min(1.0, volume * 5),  # Normalize
        tone=tone,
        pitch_std=pitch_std,
        volume_std=volume_std,
    )


def analyze_unison(y: np.ndarray, sr: int, 
                   metrics_a: AcousticMetrics, 
                   metrics_b: AcousticMetrics) -> TogetherMetrics:
    """Analyze the unison (together) segment"""
    
    # Basic metrics
    rms = np.sqrt(np.mean(y**2))
    
    # Pitch detection for harmony analysis
    f0, _, _ = librosa.pyin(y, fmin=50, fmax=500, sr=sr)
    valid_f0 = f0[~np.isnan(f0)]
    
    # Harmony: Check if multiple pitches or single merged pitch
    # If they sync well, we see less pitch variance
    if len(valid_f0) > 0:
        pitch_variance = np.std(valid_f0)
        expected_variance = abs(metrics_a.pitch - metrics_b.pitch) / 2
        harmony_score = max(0, 100 - (pitch_variance / max(expected_variance, 1)) * 20)
    else:
        harmony_score = 50
    
    # Sync rate: Check onset consistency
    onset_env = librosa.onset.onset_strength(y=y, sr=sr)
    onset_variance = np.std(onset_env)
    sync_rate = max(0, 1 - onset_variance)
    
    # Dominance: Compare volumes
    total_expected = metrics_a.volume + metrics_b.volume
    if total_expected > 0:
        dominance_a = metrics_a.volume / total_expected
        dominance_b = metrics_b.volume / total_expected
    else:
        dominance_a = dominance_b = 0.5
    
    # Blend quality interpretation
    pitch_diff = abs(metrics_a.pitch - metrics_b.pitch)
    if pitch_diff < 20 and harmony_score > 70:
        blend = "Acoustic Twins - Eerily synchronized"
    elif pitch_diff < 50 and harmony_score > 50:
        blend = "Jazz Duo - Complementary improvisation"
    elif pitch_diff < 80:
        blend = "Rock vs Classical - Creative tension"
    else:
        blend = "Polar Frequencies - Contrast creates sparks"
    
    return TogetherMetrics(
        harmony_score=min(100, harmony_score),
        sync_rate=sync_rate,
        dominance_a=dominance_a,
        dominance_b=dominance_b,
        blend_quality=blend,
    )


def calculate_matrix_score(user_a: dict, user_b: dict, together: TogetherMetrics) -> int:
    """Calculate overall compatibility score"""
    
    # Extract metrics
    ma = user_a['metrics']
    mb = user_b['metrics']
    
    # Delta calculations (normalized 0-100)
    pitch_delta = abs(ma['pitch'] - mb['pitch']) / 200 * 100
    speed_delta = abs(ma['speed'] - mb['speed']) * 100
    volume_delta = abs(ma['volume'] - mb['volume']) * 100
    tone_delta = abs(ma['tone'] - mb['tone']) / 3000 * 100
    
    avg_delta = (pitch_delta + speed_delta + volume_delta + tone_delta) / 4
    
    # Base score (inverse of delta + harmony bonus)
    base_score = 100 - avg_delta * 0.5  # 50% from similarity
    harmony_bonus = together.harmony_score * 0.3  # 30% from unison
    sync_bonus = together.sync_rate * 20  # 20% from sync
    
    matrix_score = base_score + harmony_bonus + sync_bonus
    
    return int(max(0, min(100, matrix_score)))


def process_couple_audio(filepath: str, 
                         user_a_info: dict,
                         user_b_info: dict) -> CoupleAnalysisResult:
    """Main processing function"""
    
    print(f"Loading audio: {filepath}")
    y, sr = librosa.load(filepath, sr=44100, mono=True)
    
    print("Extracting segments...")
    
    # Extract and analyze each segment
    y_cal_a = extract_audio_segment(y, sr, *SEGMENTS['calibration_a'])
    y_cal_b = extract_audio_segment(y, sr, *SEGMENTS['calibration_b'])
    y_unison = extract_audio_segment(y, sr, *SEGMENTS['unison'])
    y_stress_a = extract_audio_segment(y, sr, *SEGMENTS['stress_a'])
    y_stress_b = extract_audio_segment(y, sr, *SEGMENTS['stress_b'])
    
    print("Analyzing User A (calibration + stress)...")
    metrics_a_cal = analyze_segment(y_cal_a, sr)
    metrics_a_stress = analyze_segment(y_stress_a, sr)
    
    print("Analyzing User B (calibration + stress)...")
    metrics_b_cal = analyze_segment(y_cal_b, sr)  
    metrics_b_stress = analyze_segment(y_stress_b, sr)
    
    # Average calibration and stress for final metrics
    metrics_a = AcousticMetrics(
        pitch=(metrics_a_cal.pitch + metrics_a_stress.pitch) / 2,
        speed=(metrics_a_cal.speed + metrics_a_stress.speed) / 2,
        volume=(metrics_a_cal.volume + metrics_a_stress.volume) / 2,
        tone=(metrics_a_cal.tone + metrics_a_stress.tone) / 2,
        pitch_std=(metrics_a_cal.pitch_std + metrics_a_stress.pitch_std) / 2,
        volume_std=(metrics_a_cal.volume_std + metrics_a_stress.volume_std) / 2,
    )
    
    metrics_b = AcousticMetrics(
        pitch=(metrics_b_cal.pitch + metrics_b_stress.pitch) / 2,
        speed=(metrics_b_cal.speed + metrics_b_stress.speed) / 2,
        volume=(metrics_b_cal.volume + metrics_b_stress.volume) / 2,
        tone=(metrics_b_cal.tone + metrics_b_stress.tone) / 2,
        pitch_std=(metrics_b_cal.pitch_std + metrics_b_stress.pitch_std) / 2,
        volume_std=(metrics_b_cal.volume_std + metrics_b_stress.volume_std) / 2,
    )
    
    print("Analyzing unison recording...")
    together = analyze_unison(y_unison, sr, metrics_a, metrics_b)
    
    print("Generating tags and SCM profiles...")
    quantizer = AcousticQuantizer()
    tags_a = quantizer.quantize(metrics_a)
    tags_b = quantizer.quantize(metrics_b)
    
    scm_a = SCMAnalyzer.analyze(
        user_a_info.get('job', 'other'),
        user_a_info.get('accent', 'unknown'),
        metrics_a
    )
    scm_b = SCMAnalyzer.analyze(
        user_b_info.get('job', 'other'),
        user_b_info.get('accent', 'unknown'),
        metrics_b
    )
    
    # Build user objects
    user_a = {
        'name': user_a_info.get('name', 'User A'),
        'age': user_a_info.get('age', ''),
        'job': user_a_info.get('job', 'other'),
        'accent': user_a_info.get('accent', 'unknown'),
        'metrics': asdict(metrics_a),
        'tags': asdict(tags_a),
        'scm': scm_a,
        'stress_volume': metrics_a_stress.volume,  # Extra: stress response
    }
    
    user_b = {
        'name': user_b_info.get('name', 'User B'),
        'age': user_b_info.get('age', ''),
        'job': user_b_info.get('job', 'other'),
        'accent': user_b_info.get('accent', 'unknown'),
        'metrics': asdict(metrics_b),
        'tags': asdict(tags_b),
        'scm': scm_b,
        'stress_volume': metrics_b_stress.volume,
    }
    
    # Calculate deltas
    delta = {
        'pitch': abs(metrics_a.pitch - metrics_b.pitch),
        'speed': abs(metrics_a.speed - metrics_b.speed),
        'volume': abs(metrics_a.volume - metrics_b.volume),
        'tone': abs(metrics_a.tone - metrics_b.tone),
    }
    
    # Matrix score
    matrix_score = calculate_matrix_score(user_a, user_b, together)
    
    print(f"Matrix Score: {matrix_score}/100")
    
    return CoupleAnalysisResult(
        user_a=user_a,
        user_b=user_b,
        together=asdict(together),
        delta=delta,
        matrix_score=matrix_score,
    )


def generate_llm_prompt(result: CoupleAnalysisResult) -> str:
    """Generate the LLM prompt for detailed analysis"""
    
    ua = result.user_a
    ub = result.user_b
    tog = result.together
    
    prompt = f"""<Role>
You are an Elite Linguistic Anthropologist and Relationship Analyst specializing in "Acoustic Psychology." Your style is reminiscent of a New Yorker essayist: deeply insightful, intellectually playful, and empathetic. You possess the rare ability to turn cold data into a warm, compelling narrative that makes couples feel "seen."
</Role>

<Context>
- **Objective**: Analyze the compatibility of this couple based on their vocal textures recorded from the same script.
- **Audience**: The couple themselves. They are looking for depth, not clichés.
- **Fundamental Principle**: Focus on the "vocal choreography"—how their backgrounds and acoustic profiles dance together.
</Context>

<User_A>
- Name: {ua['name']}, Age: {ua.get('age', 'N/A')}, Job: {ua['job']}, Accent: {ua['accent']}
- Raw Metrics: P:{ua['metrics']['pitch']:.0f}Hz, S:{ua['metrics']['speed']:.2f}, V:{ua['metrics']['volume']:.2f}, T:{ua['metrics']['tone']:.0f}Hz
- Acoustic Tags: {ua['tags']['pitch_tag']}, {ua['tags']['speed_tag']}, {ua['tags']['volume_tag']}, {ua['tags']['tone_tag']}
- SCM Profile: Competence {ua['scm']['competence']}, Warmth {ua['scm']['warmth']} → "{ua['scm']['archetype']}"
- Stress Response Volume: {ua['stress_volume']:.2f} (How loud when panicked)
</User_A>

<User_B>
- Name: {ub['name']}, Age: {ub.get('age', 'N/A')}, Job: {ub['job']}, Accent: {ub['accent']}
- Raw Metrics: P:{ub['metrics']['pitch']:.0f}Hz, S:{ub['metrics']['speed']:.2f}, V:{ub['metrics']['volume']:.2f}, T:{ub['metrics']['tone']:.0f}Hz
- Acoustic Tags: {ub['tags']['pitch_tag']}, {ub['tags']['speed_tag']}, {ub['tags']['volume_tag']}, {ub['tags']['tone_tag']}
- SCM Profile: Competence {ub['scm']['competence']}, Warmth {ub['scm']['warmth']} → "{ub['scm']['archetype']}"
- Stress Response Volume: {ub['stress_volume']:.2f}
</User_B>

<Together_Metrics>
- Harmony Score: {tog['harmony_score']:.0f}/100 (How well their pitches aligned when speaking together)
- Sync Rate: {tog['sync_rate']:.0%} (Tempo synchronization)
- Dominance: A:{tog['dominance_a']:.0%} / B:{tog['dominance_b']:.0%} (Who's louder when together)
- Blend Quality: "{tog['blend_quality']}"
</Together_Metrics>

<Delta_Analysis>
- Pitch Gap: {result.delta['pitch']:.0f} Hz
- Speed Gap: {result.delta['speed']:.2f}
- Volume Gap: {result.delta['volume']:.2f}
- Tone Gap: {result.delta['tone']:.0f} Hz
</Delta_Analysis>

<Pre_Calculated>
- Matrix Score: {result.matrix_score}/100
</Pre_Calculated>

<Instructions>
1. Use "Thick Description" (Geertz). Explain how each person's [Accent] and [Job] create a specific "vocal gravity."
2. Interpret the Delta: Small gaps = Symmetry (comfort but stagnation risk). Large gaps = Tension (excitement but friction risk).
3. Analyze the "Stress Response" volumes—who gets louder in a crisis? What does this mean for their arguments?
4. Comment on the "Unison" performance—can they harmonize, or are they destined to sing different songs?
5. Be witty but grounded. Use metaphors (musical genres, culinary pairings, architectural styles).
6. NO "As an AI..." or placeholders.
</Instructions>

<Output_Format>
# The Resonance Report: {ua['name']} & {ub['name']}

### I. The Compatibility Quotient
- **Score: {result.matrix_score}/100**
- **The Verdict**: [One witty sentence summary]

### II. Vocal Origins & Textures
- **{ua['name']}**: [Analysis of their acoustic-persona]
- **{ub['name']}**: [Analysis of their acoustic-persona]

### III. The Acoustic Duet
- [How their differences play out in daily life—Sunday morning arguments, Friday night celebrations, deciding where to eat]

### IV. The Stress Test
- [Analysis of who gets louder in crisis, who retreats, and what this means]

### V. The Unison Moment
- [Can they sync? What does their harmony score tell us about their future?]

### VI. The Closing Note
- [One piece of "Communication Bio-hacking" advice for better harmony]
</Output_Format>
"""
    return prompt


def main():
    parser = argparse.ArgumentParser(description='EtchVox Couple Audio Processor')
    parser.add_argument('input', help='Input WAV file path')
    parser.add_argument('--output', '-o', default='couple_result.json', help='Output JSON path')
    parser.add_argument('--name-a', default='User A', help='Name of User A')
    parser.add_argument('--name-b', default='User B', help='Name of User B')
    parser.add_argument('--job-a', default='other', help='Job of User A')
    parser.add_argument('--job-b', default='other', help='Job of User B')
    parser.add_argument('--accent-a', default='unknown', help='Accent of User A')
    parser.add_argument('--accent-b', default='unknown', help='Accent of User B')
    parser.add_argument('--age-a', default='', help='Age of User A')
    parser.add_argument('--age-b', default='', help='Age of User B')
    parser.add_argument('--prompt-only', action='store_true', help='Only output LLM prompt')
    
    args = parser.parse_args()
    
    user_a_info = {
        'name': args.name_a,
        'job': args.job_a,
        'accent': args.accent_a,
        'age': args.age_a,
    }
    user_b_info = {
        'name': args.name_b,
        'job': args.job_b,
        'accent': args.accent_b,
        'age': args.age_b,
    }
    
    result = process_couple_audio(args.input, user_a_info, user_b_info)
    
    if args.prompt_only:
        print(generate_llm_prompt(result))
    else:
        output = {
            'user_a': result.user_a,
            'user_b': result.user_b,
            'together': result.together,
            'delta': result.delta,
            'matrix_score': result.matrix_score,
            'llm_prompt': generate_llm_prompt(result),
        }
        
        with open(args.output, 'w', encoding='utf-8') as f:
            json.dump(output, f, indent=2, ensure_ascii=False)
        
        print(f"\nResults saved to: {args.output}")
        print(f"Matrix Score: {result.matrix_score}/100")
        print(f"Blend Quality: {result.together['blend_quality']}")


if __name__ == '__main__':
    main()
