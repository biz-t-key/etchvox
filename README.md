# 🎤 EtchVox - AI Voice Personality Analysis

**"Your Face is 10/10. What about your Voice?"**

EtchVox is an AI-powered voice analysis platform that determines your personality type based on acoustic characteristics. Think MBTI, but for your voice.

🌐 **Demo**: [etchvox.ai](https://etchvox.ai) (Coming Soon)

---

## ✨ Features

### Core Features
- **🎯 16 Voice Types** - Scientifically categorized personality types
- **🔊 Real-time Analysis** - 100% client-side processing (zero server cost)
- **💀 Brutal Roasts** - Honest, witty personality insights
- **💕 Couple Mode** - Voice compatibility analysis for partners
- **🌏 Multi-language** - English & Japanese support

### Premium Features
- **🔓 Full Reports** - $4.99 unlock
- **🔒 Voice Vault** - Lifetime storage + aging tracker ($10)
- **📊 Compatibility Matrix** - 16x16 relationship insights
- **🎨 Custom OG Images** - Social sharing optimized

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 15, React 19, TypeScript |
| **Styling** | Tailwind CSS, Custom Cyberpunk Theme |
| **Analysis** | Web Audio API, Client-side ML |
| **Database** | Firebase (Firestore + Storage) |
| **Payments** | Stripe |
| **Hosting** | Vercel |
| **i18n** | Custom implementation |

---

## 🏗️ Project Structure

```
etchvox/
├─ src/
│  ├─ app/                    # Next.js App Router
│  │  ├─ page.tsx            # Landing Page
│  │  ├─ record/             # Recording Flow
│  │  ├─ result/[id]/        # Result Display + Payments
│  │  ├─ couple/             # Couple Mode
│  │  ├─ api/
│  │  │  ├─ checkout/        # Stripe Checkout
│  │  │  ├─ webhook/         # Stripe Webhooks
│  │  │  └─ og/              # OG Image Generation
│  ├─ components/            # React Components
│  ├─ lib/                   # Core Logic
│  │  ├─ analyzer.ts         # Voice Analysis Engine
│  │  ├─ types.ts            # 16 Types Master Data
│  │  ├─ quantizer.ts        # Acoustic → Semantic Tags
│  │  ├─ scm.ts              # Stereotype Content Model
│  │  ├─ compatibility.ts    # Couple Analysis
│  │  ├─ compatibilityMatrix.ts # 16x16 Scores
│  │  ├─ firebase.ts         # Firebase SDK
│  │  └─ storage.ts          # Data Persistence
│  └─ hooks/                 # Custom Hooks
├─ public/
│  └─ locales/               # i18n Translations
├─ scripts/
│  └─ couple_processor.py    # Couple Audio Processing
├─ FIREBASE_SETUP.md         # Firebase Guide
├─ STRIPE_SETUP.md          # Stripe Guide
└─ PHASE2_IMPLEMENTATION.md  # Advanced Features

```

---

## 🎯 Quick Start

### 1. Clone & Install

```bash
git clone <your-repo>
cd etchvox
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

# Stripe (Required for payments)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# App
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📱 User Flow

```
Landing Page
    ↓
Recording (3 steps, 30 seconds)
    ↓
Toxicity Input (Nicotine/Alcohol/Sleep)
    ↓
Accent Selection
    ↓
Analysis (Client-side)
    ↓
Result Page
    ├─ Free: Type + Blurred Roast + Compatibility Preview
    └─ Paid ($4.99): Full Unlock + Vault Option ($10 OTO)
```

---

## 💰 Monetization

### Pricing

| Product | Price | Conversion |
|---------|-------|------------|
| **Full Unlock** | $4.99 | ~5% of users |
| **Vault (OTO)** | +$10 | ~20% of unlocks |

### Revenue Projection

- **10,000 visitors/month**
- **500 unlock** ($4.99) = $2,495
- **100 vault** ($10) = $1,000
- **Monthly Revenue**: ~$3,500
- **Annual**: ~$42,000

---

## 🔧 Key Files Explained

### Voice Analysis

| File | Purpose |
|------|---------|
| `lib/analyzer.ts` | Web Audio API processing (pitch, speed, volume, tone) |
| `lib/types.ts` | 16 voice types master data with roasts |
| `lib/quantizer.ts` | Converts raw metrics to semantic tags |

### Payments

| File | Purpose |
|------|---------|
| `api/checkout/route.ts` | Stripe Checkout session creation |
| `api/webhook/route.ts` | Payment success handler |
| `result/[id]/page.tsx` | Unlock button + OTO modal |

### Couple Mode

| File | Purpose |
|------|---------|
| `couple/page.tsx` | Dual recording interface |
| `lib/compatibility.ts` | Couple analysis logic |
| `scripts/couple_processor.py` | Audio segmentation & LLM prompt |

---

## 🎨 Design Principles

### Theme: **Cyberpunk / Neon Brutalism**

- **Colors**: Cyan (#00F0FF), Magenta (#FF00FF), Electric Green (#00FF66)
- **Typography**: Inter (UI), JetBrains Mono (data display)
- **Effects**: Glassmorphism, neon glows, scan lines, glitch animations
- **Mobile First**: Touch-friendly (44px min targets), safe area support

### UI Philosophy

1. **Instant Gratification** - Analysis completes in 3 seconds
2. **Brutal Honesty** - No sugarcoating, entertainment over validation
3. **Social Proof** - Shareable OG images, Instagram-optimized
4. **Scarcity** - "Youngest voice you have left" messaging

---

## 🚢 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables
vercel env add STRIPE_SECRET_KEY
vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
vercel env add STRIPE_WEBHOOK_SECRET

# Deploy to production
vercel --prod
```

### Post-Deployment Checklist

- [ ] Set up Stripe webhook endpoint
- [ ] Configure Firebase (if using)
- [ ] Test payment flow end-to-end
- [ ] Verify OG images render correctly
- [ ] Test mobile on real devices
- [ ] Set up analytics (Vercel Analytics, etc.)

---

## 📊 Analytics to Track

| Metric | Tool | Target |
|--------|------|--------|
| **Conversion Rate** | Stripe Dashboard | >5% |
| **OTO Acceptance** | Custom tracking | >20% |
| **Avg Session Duration** | Vercel Analytics | >2 minutes |
| **Mobile vs Desktop** | Vercel Analytics | 70% mobile |
| **Social Shares** | URL params | Track manually |

---

## 🐛 Troubleshooting

### "Microphone not working"

```typescript
// Check browser permissions in DevTools → Application → Permissions
// Ensure HTTPS in production (localhost is OK for dev)
```

### "Stripe payment not updating result"

```typescript
// 1. Check webhook is receiving events (Stripe Dashboard → Webhooks)
// 2. Verify STRIPE_WEBHOOK_SECRET matches
// 3. Check Firestore rules allow writes
```

### "Firebase not saving data"

```typescript
// Check isFirebaseConfigured() returns true
// Verify Firestore rules (see FIREBASE_SETUP.md)
// Fallback to localStorage if Firebase fails (intentional)
```

---

## 📚 Additional Documentation

- **[FIREBASE_SETUP.md](./FIREBASE_SETUP.md)** - Complete Firebase guide
- **[STRIPE_SETUP.md](./STRIPE_SETUP.md)** - Payment integration guide
- **[PHASE2_IMPLEMENTATION.md](./PHASE2_IMPLEMENTATION.md)** - Advanced features

---

## 🤝 Contributing

This is a commercial project. For inquiries: [your-email@example.com]

---

## 📄 License

Proprietary. All rights reserved.

---

## 🙏 Acknowledgments

- **Voice Analysis**: Inspired by acoustic psychology research
- **16 Personality System**: Original framework
- **Design**: Cyberpunk 2077, Neon Genesis Evangelion aesthetics

---

**Built with 🔥 by a husband who was told he sounds like a robot.**
