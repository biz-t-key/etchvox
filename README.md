# 🎤 VoiceGlow - AI Voice Analysis Platform

**"Your Face is 10/10. What about your Voice?"**

VoiceGlow is an AI-powered voice analysis platform featuring three distinct diagnostic modes: **Voice Mirror** (7-day voice training), **Solo Analysis** (16 personality types), and **Couple Compatibility** (relationship insights).

🌐 **Live**: [voiceglow.com](https://voiceglow.com) (formerly etchvox.com)

---

## ✨ Features

### 🪞 Voice Mirror (Premium - Subscription Required)
- **7-Day Voice Training** - Daily reading practice with AI-guided resonance tracking
- **4 Archetypal Identities** - Philosophy, Thriller, Poetic, Cinematic Grit
- **AI Oracle Analysis** - Deep acoustic insights with Alignment Score (0-100%)
- **Resonance Dossier** - Beautiful video export with identity-specific visuals
  - Optimizer: Cyan grid + barcode stamp
  - Stoic: Parchment texture + wax seal
  - Alchemist: Sacred geometry + gold accents
  - Cinematic Grit: Concrete effect + CLASSIFIED stamp
- **Privacy-First** - All data stored in browser (IndexedDB + localStorage)

### 🎯 Solo Analysis (Pay-per-Use)
- **16 Voice Types** - Personality archetypes based on acoustic characteristics
- **Brutal Roasts** - Honest, witty AI-generated insights
- **Real-time Processing** - 100% client-side analysis (Web Audio API)
- **Spy Mode** - Anonymous voice analysis with self-destruct timer
- **Multi-language** - English & Japanese support

### 💕 Couple Mode (Pay-per-Use)
- **Voice Compatibility Analysis** - Relationship insights for partners
- **16x16 Compatibility Matrix** - Detailed interaction dynamics
- **Dual Recording Interface** - Synchronized analysis for two voices

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 15, React 19, TypeScript |
| **Styling** | Tailwind CSS, Custom Cyberpunk Theme |
| **Analysis** | Web Audio API, Client-side ML |
| **Database** | Firebase (Firestore + Storage) |
| **Payments** | Lemon Squeezy (Subscriptions + One-time) |
| **Hosting** | Vercel |
| **i18n** | Custom implementation |

---

## 🏗️ Project Structure

```
voiceglow/
├─ src/
│  ├─ app/                    # Next.js App Router
│  │  ├─ page.tsx            # Landing Page
│  │  ├─ mirror/             # Voice Mirror (7-day training)
│  │  ├─ record/             # Solo Analysis Recording
│  │  ├─ result/[id]/        # Result Display + Payments
│  │  ├─ couple/             # Couple Mode
│  │  ├─ gallery/            # Debug Gallery (Dev)
│  │  ├─ terms/              # Terms of Service
│  │  ├─ privacy/            # Privacy Policy
│  │  ├─ api/
│  │  │  ├─ checkout/lemonsqueezy/  # Subscription Checkout
│  │  │  ├─ webhook/lemonsqueezy/   # Subscription Webhooks
│  │  │  ├─ identity/        # Solo/Couple Analysis APIs
│  │  │  └─ og/              # OG Image Generation
│  ├─ components/
│  │  ├─ mirror/             # Voice Mirror Components
│  │  │  ├─ MirrorDashboard.tsx   # Analysis Results
│  │  │  ├─ MirrorRecap.tsx       # 7-Day Video Recap
│  │  │  └─ SubscriptionWall.tsx  # Paywall
│  │  └─ result/             # Result Components
│  │     ├─ ResultCard.tsx        # Solo Analysis Card
│  │     └─ SpyReportCard.tsx     # Spy Mode Card
│  ├─ lib/
│  │  ├─ analyzer.ts         # Voice Analysis Engine
│  │  ├─ types.ts            # 16 Types Master Data
│  │  ├─ mirrorContent.ts    # Voice Mirror Scenarios
│  │  ├─ mirrorEngine.ts     # Z-Score Analysis Engine
│  │  ├─ mirrorDb.ts         # IndexedDB for Audio Storage
│  │  ├─ subscription.ts     # Lemon Squeezy Integration
│  │  ├─ firebase.ts         # Firebase SDK
│  │  └─ storage.ts          # Data Persistence
│  └─ hooks/                 # Custom Hooks
├─ public/
│  └─ locales/               # i18n Translations
└─ config/
   └─ features.ts            # Feature Flags & Pricing

```

---

## 🎯 Quick Start

### 1. Clone & Install

```bash
git clone <your-repo>
cd voiceglow
npm install
```

### 2. Configure Environment

Create `.env.local`:

```bash
# Firebase (Optional - gracefully falls back to localStorage)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Lemon Squeezy (Required for payments)
LEMONSQUEEZY_API_KEY=
LEMONSQUEEZY_WEBHOOK_SECRET=
NEXT_PUBLIC_LEMONSQUEEZY_STORE_ID=
NEXT_PUBLIC_LEMONSQUEEZY_WEEKLY_VARIANT_ID=
NEXT_PUBLIC_LEMONSQUEEZY_MONTHLY_VARIANT_ID=
NEXT_PUBLIC_LEMONSQUEEZY_SOLO_VARIANT_ID=
NEXT_PUBLIC_LEMONSQUEEZY_COUPLE_VARIANT_ID=
NEXT_PUBLIC_LEMONSQUEEZY_SPY_VARIANT_ID=

# App
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📱 User Flows

### Voice Mirror Flow (Subscription Required)

```
Landing → Subscribe (Weekly/Monthly)
    ↓
Biometric Authentication (Mnemonic Phrase)
    ↓
Genre Selection (Philosophy / Thriller / Poetic / Cinematic Grit)
    ↓
Day 1-7: Calibration → Mood Selection → Reading (6 seconds)
    ↓
AI Oracle Analysis (Alignment Score, Predictions, Tags)
    ↓
Day 7: Resonance Dossier (Video Export with Archetypal Design)
```

### Solo Analysis Flow

```
Landing → Record (30 seconds)
    ↓
Toxicity Input (Nicotine/Alcohol/Sleep)
    ↓
Accent Selection
    ↓
Analysis (Client-side)
    ↓
Result Page → $10 Unlock (Solo Analysis)
    ├─ Free Preview: Type + Blurred Roast
    └─ Paid: Full Report + Downloadable PDF
```

### Couple Mode Flow

```
Landing → Couple Mode → Dual Recording
    ↓
Analysis (Both Voices)
    ↓
Result Page → $15 Unlock (Couple Compatibility)
    ├─ Free Preview: Basic Compatibility Score
    └─ Paid: Full Matrix + Relationship Insights
```

---

## 💰 Monetization

### Pricing Model

| Product | Price | Type |
|---------|-------|------|
| **Voice Mirror (Weekly)** | $10/week | Subscription |
| **Voice Mirror (Monthly)** | $30/month | Subscription |
| **Solo Analysis** | $10 | One-time |
| **Couple Analysis** | $15 | One-time |
| **Spy Mode** | $10 | One-time |

### Revenue Projection

- **Voice Mirror**: 100 subscribers/month @ $30 = $3,000/mo
- **Solo Analysis**: 200 unlocks/month @ $10 = $2,000/mo
- **Couple Analysis**: 50 unlocks/month @ $15 = $750/mo
- **Monthly Revenue**: ~$5,750
- **Annual**: ~$69,000

---

## 🔧 Key Features Explained

### Voice Mirror Components

| Component | Purpose |
|-----------|---------|
| `MirrorDashboard.tsx` | AI Oracle analysis results with Z-Score visualization |
| `MirrorRecap.tsx` | 7-day video recap with archetypal visual design |
| `MirrorContent.ts` | 4 genres × 3 scenarios × 7 days of curated reading texts |
| `MirrorEngine.ts` | Z-Score calculation engine for voice deviation tracking |
| `MirrorDb.ts` | IndexedDB wrapper for audio blob storage (browser-only) |
| `SubscriptionWall.tsx` | Paywall component with Lemon Squeezy integration |

### Solo Analysis Components

| Component | Purpose |
|-----------|---------|
| `ResultCard.tsx` | 16 personality types with AI roasts |
| `SpyReportCard.tsx` | Anonymous analysis with self-destruct timer |
| `analyzer.ts` | Web Audio API processing (pitch, speed, volume, tone) |
| `types.ts` | 16 voice types master data with roasts |

### Payment Integration

| File | Purpose |
|------|---------|
| `api/checkout/lemonsqueezy/route.ts` | Checkout session creation |
| `api/webhook/lemonsqueezy/route.ts` | Subscription event handler |
| `lib/subscription.ts` | Subscription status verification |

---

## 🎨 Design Principles

### Theme: **Cyberpunk / Neon Brutalism**

- **Colors**: Cyan (#00F0FF), Magenta (#FF00FF), Electric Green (#00FF66)
- **Typography**: 
  - UI: Inter, Oswald (Cinematic Grit)
  - Data: JetBrains Mono
  - Serif: EB Garamond (Stoic), Cinzel (Alchemist)
- **Effects**: Glassmorphism, neon glows, scan lines, glitch animations
- **Voice Mirror Archetypes**:
  - Optimizer: Tech grid + barcode
  - Stoic: Parchment + wax seal
  - Alchemist: Sacred geometry + gold
  - Cinematic Grit: Concrete + CLASSIFIED stamp

### UI Philosophy

1. **Instant Gratification** - Analysis completes in 3 seconds
2. **Brutal Honesty** - No sugarcoating, entertainment over validation
3. **Privacy First** - All Voice Mirror data stays in browser
4. **Scarcity** - "7 days to transform your voice" messaging

---

## 🚢 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables
vercel env add LEMONSQUEEZY_API_KEY
vercel env add LEMONSQUEEZY_WEBHOOK_SECRET
vercel env add NEXT_PUBLIC_LEMONSQUEEZY_STORE_ID

# Deploy to production
vercel --prod
```

### Post-Deployment Checklist

- [ ] Set up Lemon Squeezy webhook endpoint (`/api/webhook/lemonsqueezy`)
- [ ] Configure Firebase (if using)
- [ ] Test Voice Mirror subscription flow end-to-end
- [ ] Test Solo/Couple payment flows
- [ ] Verify OG images render correctly
- [ ] Test mobile on real devices
- [ ] Set up analytics (Vercel Analytics, Lemon Squeezy Dashboard)

---

##📊 Analytics to Track

| Metric | Tool | Target |
|--------|------|--------|
| **Voice Mirror Subscription Rate** | Lemon Squeezy Dashboard | >3% |
| **Solo/Couple Conversion Rate** | Firebase Analytics | >5% |
| **7-Day Retention (Voice Mirror)** | Custom tracking | >60% |
| **Avg Session Duration** | Vercel Analytics | >3 minutes |
| **Mobile vs Desktop** | Vercel Analytics | 70% mobile |

---

## 🐛 Troubleshooting

### "Microphone not working"

```typescript
// Check browser permissions in DevTools → Application → Permissions
// Ensure HTTPS in production (localhost is OK for dev)
```

### "Lemon Squeezy payment not updating subscription"

```typescript
// 1. Check webhook is receiving events (Lemon Squeezy Dashboard → Webhooks)
// 2. Verify LEMONSQUEEZY_WEBHOOK_SECRET matches
// 3. Check Firestore rules allow writes
```

### "Voice Mirror data not persisting"

```typescript
// Check browser IndexedDB (DevTools → Application → IndexedDB → voiceMirrorDB)
// Verify localStorage has mirrorLogs (DevTools → Application → Local Storage)
// All data is browser-local by design (no server sync)
```

---

## 🤝 Contributing

This is a commercial project. For inquiries: [info@voiceglow.com]

---

## 📄 License

Proprietary. All rights reserved.

---

## 🙏 Acknowledgments

- **Voice Analysis**: Inspired by acoustic psychology research
- **16 Personality System**: Original framework
- **Voice Mirror**: Inspired by voice training methodologies
- **Design**: Cyberpunk 2077, Neon Genesis Evangelion aesthetics

---

**Built with 🔥 by a team that believes your voice deserves as much attention as your face.**
