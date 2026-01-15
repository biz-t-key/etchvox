import math

# ==========================================
# 1. SHARED CORE: Acoustic Quantizer
# ==========================================
class AcousticQuantizer:
    """
    音響数値をLLMが解釈可能な「文脈タグ」に変換するクラス。
    0-100の数値を5段階の形容詞にマッピングし、レポートの表現力を底上げする。
    """

    @staticmethod
    def get_pitch_tag(value):
        if value < 20: return "Sub-bass / Gravitas (重厚)"
        if value < 40: return "Deep / Resonant (共鳴)"
        if value < 60: return "Baritone / Grounded (安定的)"
        if value < 80: return "Tenor / Clear (明瞭)"
        return "Soprano / Crystalline (透き通った)"

    @staticmethod
    def get_speed_tag(value):
        if value < 20: return "Largo / Contemplative (熟考)"
        if value < 40: return "Andante / Deliberate (慎重)"
        if value < 60: return "Moderato / Conversational (会話的)"
        if value < 80: return "Allegro / Energetic (活発)"
        return "Presto / Urgent (性急)"

    @staticmethod
    def get_volume_tag(value):
        if value < 20: return "Whisper / Intimate (親密・秘密)"
        if value < 40: return "Soft / Gentle (穏やか・配慮)"
        if value < 60: return "Mezzo / Balanced (バランス)"
        if value < 80: return "Forte / Projecting (発信・主張)"
        return "Fortissimo / Commanding (威厳・支配)"

    @staticmethod
    def get_tone_tag(value):
        # Tone: 低い＝ハスキー/雑味、高い＝クリア/純音
        if value < 20: return "Husky / Textured (陰影・ハスキー)"
        if value < 40: return "Smoky / Warm (温かみ・スモーキー)"
        if value < 60: return "Neutral / Natural (自然的)"
        if value < 80: return "Bright / Polished (磨かれた)"
        return "Piercing / Pure (純粋・鋭い)"

    @classmethod
    def get_all_tags(cls, p, s, v, t):
        return {
            "Pitch_Tag": cls.get_pitch_tag(p),
            "Speed_Tag": cls.get_speed_tag(s),
            "Volume_Tag": cls.get_volume_tag(v),
            "Tone_Tag": cls.get_tone_tag(t)
        }

# ==========================================
# 2. SOLO ENGINE: Voice Identity & Gap Analysis
# ==========================================
class SoloIdentityEngine:
    """
    単身者向け($10プラン)。
    「声のアーキタイプ」を特定し、ユーザー申告のMBTIとの「ギャップ」を計算する。
    """
    
    def __init__(self, p, s, v, t, mbti_type):
        self.p = p
        self.s = s
        self.v = v
        self.t = t
        self.mbti = mbti_type.upper()

    def _calculate_axes(self):
        # Axis 1: Projection (投射力) - 外交的エネルギー
        # VolumeとSpeedが高いほど、前に出る力が強い
        projection = (self.v + self.s) / 2
        
        # Axis 2: Texture (質感) - 情報処理の温度感
        # Toneが高い(Clear)かつPitchが高い = Cool/Intellectual
        # Toneが低い(Husky)かつPitchが低い = Warm/Emotional
        texture = (self.p + self.t) / 2
        
        return projection, texture

    def _determine_archetype(self, proj, text):
        # 4象限マトリクスによる分類
        if proj >= 50:
            if text >= 50:
                return {
                    "Label": "The Lightning Rod (雷撃の扇動者)",
                    "Quote": "Words like electric shocks. Impossible to ignore.",
                    "Vibe": "High Voltage & Sharp"
                }
            else:
                return {
                    "Label": "The Thunder King (轟く覇者)",
                    "Quote": "A voice that shakes the floorboards. Pure dominance.",
                    "Vibe": "High Voltage & Heavy"
                }
        else:
            if text >= 50:
                return {
                    "Label": "The Ice Sculptor (氷の彫刻家)",
                    "Quote": "Precision over volume. Every syllable cuts deep.",
                    "Vibe": "Low Voltage & Sharp"
                }
            else:
                return {
                    "Label": "The Midnight FM (深夜のDJ)",
                    "Quote": "Velvet frequencies. You bypass ears and speak to the soul.",
                    "Vibe": "Low Voltage & Heavy"
                }

    def _analyze_gap(self, proj, text):
        # MBTIから期待される音声値を推論
        # E vs I -> Expected Projection
        expected_proj = 80 if 'E' in self.mbti else 30
        # T vs F -> Expected Texture (T=Cool/High, F=Warm/Low)
        expected_text = 80 if 'T' in self.mbti else 30

        proj_gap = proj - expected_proj
        text_gap = text - expected_text
        
        tags = []
        
        # Gap Diagnosis logic
        if proj_gap > 30: tags.append("Over-Amplified (Masking Introversion)")
        elif proj_gap < -30: tags.append("Under-Projecting (Holding Back)")
        else: tags.append("Authentic Projection (Aligned)")

        if text_gap > 30: tags.append("Cooler than Personality (Logical Mask)")
        elif text_gap < -30: tags.append("Warmer than Personality (Social Mask)")
        else: tags.append("Authentic Texture (Aligned)")

        return {
            "Projection_Delta": int(proj_gap),
            "Texture_Delta": int(text_gap),
            "Diagnosis_Tags": tags
        }

    def generate_payload(self):
        proj, text = self._calculate_axes()
        archetype = self._determine_archetype(proj, text)
        gap_analysis = self._analyze_gap(proj, text)
        quantized_metrics = AcousticQuantizer.get_all_tags(self.p, self.s, self.v, self.t)

        return {
            "User_MBTI": self.mbti,
            "Voice_Archetype": {
                "Label": archetype["Label"],
                "Quote": archetype["Quote"],
                "Stats": {"Projection": int(proj), "Texture": int(text)}
            },
            "Gap_Analysis": gap_analysis,
            "Raw_Metrics_Tags": quantized_metrics,
            "System_Instruction": "Focus on the discrepancy between MBTI and Voice Archetype."
        }

# ==========================================
# 3. COUPLE ENGINE: Resonance & SCM Analysis
# ==========================================
class CoupleResonanceEngine:
    """
    カップル向け($15プラン)。
    SCM(Stereotype Content Model)と音響シンクロ率を計算し、関係性をプロファイリングする。
    """
    
    # 職業別ベーススコア (Competence, Warmth)
    JOB_DB = {
        "lawyer": (90, 30), "executive": (90, 20), "engineer": (85, 40),
        "doctor": (85, 70), "founder": (85, 65), "consultant": (80, 40),
        "artist": (50, 90), "teacher": (60, 85), "designer": (60, 80),
        "nurse": (50, 95), "writer": (40, 80), "musician": (45, 90),
        "student": (50, 60), "sales": (70, 80), "other": (50, 50)
    }

    def __init__(self, user_a_data, user_b_data):
        # user_data expects: {'name': str, 'job': str, 'accent': str, 'p': int, 's': int, 'v': int, 't': int}
        self.ua = user_a_data
        self.ub = user_b_data

    def _calculate_scm(self, job, p, s, v, t):
        # 1. 職業ベース値
        base_c, base_w = self.JOB_DB.get(job.lower(), (50, 50))
        
        # 2. 音声による補正 (Dynamic Adjustment)
        # Competence: 速く(S)、大きい(V)声は有能に見える
        voice_c_impact = ((s + v) / 2 - 50) * 0.5
        
        # Warmth: トーンが高く(T:Clear)、ピッチが高すぎない声は温かい
        # ※ピッチが高すぎる(>85)とキンキンしてWarmthが下がる調整を入れる
        p_factor = p if p < 85 else (170 - p) 
        voice_w_impact = ((t + p_factor) / 2 - 50) * 0.5

        final_c = max(0, min(100, base_c + voice_c_impact))
        final_w = max(0, min(100, base_w + voice_w_impact))
        
        # 3. ペルソナラベル付与
        if final_c >= 50 and final_w >= 50: label = "The Charismatic Ideal (Admiration)"
        elif final_c >= 50 and final_w < 50: label = "The Efficient Strategist (Respect)"
        elif final_c < 50 and final_w >= 50: label = "The Empathetic Soul (Sympathy)"
        else: label = "The Free Spirit (Unconventional)"
        
        return {"Competence": int(final_c), "Warmth": int(final_w), "Archetype": label}

    def _calculate_synergy(self):
        # 全指標の差分(Delta)を計算
        delta_p = abs(self.ua['p'] - self.ub['p'])
        delta_s = abs(self.ua['s'] - self.ub['s'])
        delta_v = abs(self.ua['v'] - self.ub['v'])
        delta_t = abs(self.ua['t'] - self.ub['t'])
        
        mean_delta = (delta_p + delta_s + delta_v + delta_t) / 4
        sync_score = 100 - mean_delta # シンクロ率 (高いほど似ている)

        # Dynamic Typeの判定
        if sync_score > 80:
            dtype = "High-Sync / Mirroring"
            desc = "Like looking in an acoustic mirror."
        elif sync_score < 40:
            dtype = "High-Contrast / Opposites"
            desc = "Magnetic attraction of opposites."
        else:
            dtype = "Complementary / Balanced"
            desc = "A healthy mix of similarity and difference."
            
        return {
            "Sync_Score": int(sync_score),
            "Mean_Delta": int(mean_delta),
            "Dynamic_Type": dtype,
            "Description": desc,
            "Volume_Delta_Specific": self.ua['v'] - self.ub['v'] # 正ならAが大きい
        }

    def generate_payload(self):
        # Process User A
        scm_a = self._calculate_scm(self.ua['job'], self.ua['p'], self.ua['s'], self.ua['v'], self.ua['t'])
        tags_a = AcousticQuantizer.get_all_tags(self.ua['p'], self.ua['s'], self.ua['v'], self.ua['t'])
        
        # Process User B
        scm_b = self._calculate_scm(self.ub['job'], self.ub['p'], self.ub['s'], self.ub['v'], self.ub['t'])
        tags_b = AcousticQuantizer.get_all_tags(self.ub['p'], self.ub['s'], self.ub['v'], self.ub['t'])

        # Synergy
        synergy = self._calculate_synergy()

        return {
            "Report_Type": "Couple_Resonance_v1",
            "Relationship_Core": synergy,
            "User_A_Insight": {
                "Name": self.ua['name'],
                "Profile": f"{self.ua['job']} ({self.ua['accent']})",
                "SCM_Profile": scm_a,
                "Acoustic_Tags": tags_a
            },
            "User_B_Insight": {
                "Name": self.ub['name'],
                "Profile": f"{self.ub['job']} ({self.ub['accent']})",
                "SCM_Profile": scm_b,
                "Acoustic_Tags": tags_b
            },
            "Narrative_Hint": f"User A is {scm_a['Archetype']}, User B is {scm_b['Archetype']}. Interaction is {synergy['Dynamic_Type']}."
        }

if __name__ == "__main__":
    # ==========================================
    # CASE 1: SOLO USER ($10 Plan)
    # ==========================================
    print("--- SOLO REPORT GENERATION ---")
    solo_user = SoloIdentityEngine(
        p=85, s=90, v=80, t=70,  # ハイテンションな声
        mbti_type="INFP"         # でも本人は内向的と主張
    )
    solo_payload = solo_user.generate_payload()
    print(solo_payload)
    # Output Example: 
    # Archetype: The Lightning Rod
    # Gap: Over-Amplified (Masking Introversion) -> LLM will roast this.


    # ==========================================
    # CASE 2: COUPLE USERS ($15 Plan)
    # ==========================================
    print("\n--- COUPLE REPORT GENERATION ---")
    tom = {'name': 'Tom', 'job': 'lawyer', 'accent': 'NY', 'p': 30, 's': 80, 'v': 85, 't': 40}
    mary = {'name': 'Mary', 'job': 'artist', 'accent': 'LA', 'p': 80, 's': 40, 'v': 40, 't': 80}
    
    couple_engine = CoupleResonanceEngine(tom, mary)
    couple_payload = couple_engine.generate_payload()
    print(couple_payload)
    # Output Example:
    # Tom: Efficient Strategist (High Comp, Low Warmth)
    # Mary: Empathetic Soul (Low Comp, High Warmth)
    # Synergy: High-Contrast / Opposites -> LLM will write about "Power vs Poetry
