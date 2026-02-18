# 🎙️ EtchVox - AI Voice Intelligence Platform

**"Your Face is 10/10. What about your Voice?"**

EtchVox is a high-fidelity AI voice analysis platform and cinematic training system. It transforms raw acoustic data into personality archetypes, relationship resonance maps, and cinematic identity assets.

🌐 **Live**: [etchvox.com](https://etchvox.com)

---

## ✨ Core Experience Modes

### 🪞 The Mirror (Premium Subscription)
A 7-day cinematic ritual designed to transform your vocal identity through narrative-driven reading sessions.
- **Narrative Archetypes**: 4 distinct paths (The Optimizer, The Stoic, The Alchemist, The Cinematic Grit).
- **Ritualistic Reading**: 252 curated stories across multiple genres (Eldritch, Cyberpunk, Neo-Noir, etc.).
- **Dynamic Context**: Persistent ritual state tracking via `MirrorContext`.
- **7-Day Recap Movie**: Post-ritual FFmpeg orchestration that stitches 7 days of logs into a cinematic R2-hosted movie.
- **Biometric Calibration**: Real-time acoustic tracking with Z-Score deviation analysis.

### 🎭 Solo Identity (Pay-per-Use / Identity Kit)
- **16 Voice Archetypes**: Deep personality mapping from acoustic vectors.
- **Identity Kit ($3)**: Ultra-HD 4K asset export (PNG Identity Card + MP4 Cinematic Nebula Loop).
- **Full Intelligence Audit ($10)**: Comprehensive AI-generated report decoding hidden vocal traits.
- **Acoustic Nebula**: Device-aware GPU shaders visualizing your unique voice frequency.

### 💕 Duo Resonance (Pay-per-Use)
- **Relationship Synthesis**: Analysis for Couples, Rivals, and Friends.
- **Resonance Map**: Comparative 5-domain radar charts visualizing vocal alignment.
- **Shared Identity Kit ($5)**: Dual-signature cinematic cards and video loops.
- **Resonance Hook**: AI-generated taglines based on relationship dynamics.

### 🕵️ Spy Mode (Stealth & Burn)
- **Mission Briefing**: Cinematic prep phase for unauthorized voice capture.
- **Self-Destruct Protocol**: Automatic data purging and hard-purge utility.
- **Elon Mode**: High-priority simulation mode for celebrity-grade analysis.

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 16 (Turbopack), React 19, Framer Motion |
| **Analysis** | Web Audio API, Client-side Vectorization, AI-Persona Audit |
| **Visuals** | Three.js Shaders (Acoustic Nebula), Cinematic Grain Filters |
| **Backend** | Firebase (Firestore + Auth), Cloud Functions |
| **Storage** | Cloudflare R2 (Recap Movies, Voice Logs) |
| **Media** | Serverless FFmpeg (recaps), `html-to-image` (Identity Cards) |
| **Monetization** | Polar.sh (Tiered pricing, Webhooks, Upsell logic) |
| **Analytics** | Google Tag Manager (Custom `trackEv` DataLayer) |

---

## 🏗️ Project Architecture

```
voiceglow/
├─ src/
│  ├─ app/                    # Next.js App Router
│  │  ├─ mirror/             # Mirror Mode (7-day Training Dashboard)
│  │  ├─ record/             # Recording Interface (Solo/Duo/Spy)
│  │  ├─ result/[id]/        # Cinematic Result Page & Social Matrix
│  │  ├─ couple/             # Duo Resonance Flow
│  │  ├─ api/
│  │  │  ├─ checkout/polar/  # Polar.sh Payment API
│  │  │  ├─ webhook/polar/   # Payment & Subscription Webhooks
│  │  │  ├─ mirror/recap/    # FFmpeg Recap Orchestration
│  │  │  └─ results/delete   # Secure Purge Logic
│  ├─ components/
│  │  ├─ mirror/             # BackgroundLayer, StorySelector, MirrorRecap
│  │  ├─ result/             # AcousticNebula, PremiumExporter, ShareButtons
│  │  └─ common/             # Cinematic UI Primitives
│  ├─ lib/
│  │  ├─ analyzer.ts         # Acoustic Vector Core
│  │  ├─ analytics.ts        # trackEv GTM Bridge
│  │  ├─ drift.ts           # Vocal Consistency Tracking
│  │  └─ storage.ts          # Z-Knowledge Auth & Dual-Stream Privacy
├─ public/                   # Static assets & cinematic textures
├─ config/
│  └─ features.ts            # Polar.sh IDs & Global Mode Toggles
```

---

## 🎯 Quick Start

### 1. Clone & Install
```bash
git clone <repository-url>
cd voiceglow
npm install
```

### 2. Configure Environment
Create `.env.local`:
```bash
# Polar.sh Configuration
POLAR_ACCESS_TOKEN=
POLAR_ORGANIZATION_ID=
POLAR_WEBHOOK_SECRET=
NEXT_PUBLIC_POLAR_WEEKLY_PRODUCT_ID=
NEXT_PUBLIC_POLAR_MONTHLY_PRODUCT_ID=
NEXT_PUBLIC_POLAR_SOLO_PRODUCT_ID=       # Intelligence Report (Solo)
NEXT_PUBLIC_POLAR_COUPLE_PRODUCT_ID=     # Intelligence Report (Duo)
NEXT_PUBLIC_POLAR_IDENTITY_SOLO_PRODUCT_ID= # Identity Kit ($3)
NEXT_PUBLIC_POLAR_IDENTITY_DUO_PRODUCT_ID=  # Identity Kit ($5)

# Cloudflare R2 (for Mirror Recaps)
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=

# Firebase (Core Analytics & Auth)
NEXT_PUBLIC_FIREBASE_API_KEY=
...
```

### 3. Run Development Server
```bash
npm run dev
```

---

## 💰 Monetization Strategy
EtchVox utilizes a **Tiered Upsell Funnel**:
1.  **Free Preview**: Basic archetype reveal and "Acoustic Nebula" preview.
2.  **Identity Kit Unlocks ($3 - $5)**: User pays for high-res visual assets (PNG/MP4).
3.  **Intelligence Report Upsell**: Post-export trigger encouraging upgrade to the full AI audit ($10 - $15).
4.  **Mirror Subscription**: Recurring revenue for 7-day training and cinematic recaps.

---

## 🎨 Cinematic Standards (Aesop Style)
- **Minimalist Luxury**: 1 element per screen, high whitespace (`py-64`).
- **Scroll-Linked Narrative**: Smooth transitions via `framer-motion` `useScroll`.
- **Atmospheric Visuals**: Film grain overlays, exposure reveals, signature amplitude pulses.

---

## 🚢 Deployment (Vercel)
```bash
vercel --prod
```

---

**Built with 🔥 by a team that believes your voice deserves as much attention as your face.**
Proprietary. All rights reserved. 2026.
