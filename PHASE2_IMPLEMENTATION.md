# 🚀 VoiceGlow MVP Phase 2 Implementation Guide

このドキュメントは、残りの重要機能の実装ガイドです。

---

## ✅ 完了済み機能

### 1. Toxicity Levels
- **ファイル**: `src/lib/toxicity.ts`, `src/components/recording/ToxicitySelector.tsx`
- **統合**: `record/page.tsx` に `toxicity` フェーズを追加する必要あり

### 2. Compatibility Matrix (16x16)
- **ファイル**: `src/lib/compatibilityMatrix.ts`
- **使用例**:
```typescript
import { getCompatibilityScore, getBestMatches, getWorstMatches } from '@/lib/compatibilityMatrix';

const score = getCompatibilityScore('HFEC', 'LSCD'); // 62
const bestMatches = getBestMatches('HFEC'); // Top 3
const worstMatches = getWorstMatches('HFEC'); // Bottom 3
```

---

## 📋 未実装機能 - 実装ガイド

### 3. Vault保存 + タイムカプセル訴求

#### 3.1 結果画面に訴求メッセージ追加

**ファイル**: `src/app/result/[id]/page.tsx`

```typescript
// 結果表示後、下記を追加
<div className="bg-gradient-to-r from-cyan-500/10 to-magenta-500/10 border border-cyan-500/30 rounded-xl p-6 mb-6">
  <div className="text-center mb-4">
    <p className="text-lg font-semibold text-cyan-400 mb-2">
      ⏳ This is the youngest voice you have left.
    </p>
    <p className="text-sm text-gray-400">
      Your voice changes 0.5% every year due to stress and aging.
      This recording will never sound like this again.
    </p>
  </div>
  
  <div className="glass rounded-lg p-4 mb-4">
    <h3 className="font-semibold mb-2">🔒 VoiceGlow Vault - $10 (Lifetime)</h3>
    <ul className="text-sm text-gray-300 space-y-1">
      <li>✓ Raw audio (no noise reduction)</li>
      <li>✓ Background ambience preserved</li>
      <li>✓ Your hesitation, your breath, everything</li>
      <li>✓ Track voice aging over time</li>
      <li>✓ Lifetime access</li>
    </ul>
  </div>
  
  <button className="w-full btn-primary py-3 rounded-full">
    🔓 Secure My Legacy - $10
  </button>
  
  <p className="text-center text-gray-600 text-xs mt-2">
    "Freeze your vibe. Before life changes it."
  </p>
</div>
```

#### 3.2 Vault用データモデル

**ファイル**: `src/lib/types.ts` に追加

```typescript
export interface VaultRecord {
  id: string;
  userId: string;
  createdAt: string;
  audioUrl: string; // Raw audio (Firebase Storage)
  resultId: string;
  typeCode: TypeCode;
  metrics: AnalysisMetrics;
  toxicity?: ToxicityProfile;
  isPremium: boolean;
}

export interface DriftAnalysis {
  baselineId: string; // First recording
  currentId: string;  // Latest recording
  driftRate: number;  // Percentage change (-100 to +100)
  status: 'STABLE' | 'UPGRADE' | 'DEGRADING';
  changes: {
    pitch: number;
    speed: number;
    volume: number;
    tone: number;
  };
}
```

---

### 4. Stripe統合

#### 4.1 Stripe Checkoutセッション作成

**ファイル**: `src/app/api/checkout/route.ts` (新規作成)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export async function POST(req: NextRequest) {
  const { resultId, type } = await req.json();
  
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: type === 'vault' ? 'VoiceGlow Vault - Lifetime' : 'Unlock Full Report',
            description: type === 'vault' 
              ? 'Preserve your voice forever. Track aging. Raw audio included.'
              : 'Full roast, metrics, and waveform video.',
          },
          unit_amount: type === 'vault' ? 1000 : 499, // $10 or $4.99
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/result/${resultId}?payment=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/result/${resultId}?payment=cancel`,
    metadata: {
      resultId,
      type,
    },
  });

  return NextResponse.json({ sessionId: session.id });
}
```

#### 4.2 フロントエンド統合

```typescript
// result/[id]/page.tsx
const handleVaultPurchase = async () => {
  const res = await fetch('/api/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ resultId, type: 'vault' }),
  });
  
  const { sessionId } = await res.json();
  
  const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
  await stripe.redirectToCheckout({ sessionId });
};
```

#### 4.3 Webhook処理

**ファイル**: `src/app/api/webhook/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getDb } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  const sig = req.headers.get('stripe-signature')!;
  const body = await req.text();
  
  const event = stripe.webhooks.constructEvent(
    body,
    sig,
    process.env.STRIPE_WEBHOOK_SECRET!
  );

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const { resultId, type } = session.metadata;
    
    // Update Firestore
    const db = getDb();
    await updateDoc(doc(db, 'results', resultId), {
      isPremium: true,
      vaultEnabled: type === 'vault',
      purchasedAt: new Date().toISOString(),
    });
  }

  return NextResponse.json({ received: true });
}
```

---

### 5. OTO (One Time Offer)

#### 5.1 決済完了ページにモーダル表示

**ファイル**: `src/app/result/[id]/page.tsx`

```typescript
// URLパラメータで判定
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  if (params.get('payment') === 'success' && !params.get('vault')) {
    // $4.99決済完了、but Vaultは未購入
    setShowOTO(true);
  }
}, []);

// OTOモーダル
{showOTO && (
  <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
    <div className="glass max-w-md p-6 rounded-xl">
      <h2 className="text-2xl font-bold text-cyan-400 mb-4">
        ⚠️ Wait. Access Granted... but memory is volatile.
      </h2>
      <p className="text-gray-300 mb-4">
        Do you want to enable "LIFETIME TIMELINE"?
        Track your voice aging, stress levels, and emotional decay forever.
      </p>
      <div className="text-3xl font-bold text-center mb-4">
        Add to order for just <span className="text-magenta-400">+$10.00</span>
      </div>
      <button 
        onClick={handleVaultPurchase}
        className="w-full btn-primary py-3 rounded-full mb-2"
      >
        ✅ Yes, Secure My Legacy
      </button>
      <button 
        onClick={() => setShowOTO(false)}
        className="w-full text-gray-500 text-sm hover:text-gray-300"
      >
        No, I'll fade away
      </button>
    </div>
  </div>
)}
```

---

### 6. Drift Rate（経年変化追跡）

#### 6.1 データモデル

```typescript
// Firestoreに保存
interface VoiceTimeline {
  userId: string;
  recordings: Array<{
    id: string;
    date: string;
    typeCode: TypeCode;
    metrics: AnalysisMetrics;
    toxicity?: ToxicityProfile;
  }>;
}
```

#### 6.2 Drift計算

**ファイル**: `src/lib/drift.ts` (新規作成)

```typescript
export function calculateDrift(
  baseline: AnalysisMetrics,
  current: AnalysisMetrics
): DriftAnalysis {
  const pitchDrift = ((current.pitch - baseline.pitch) / baseline.pitch) * 100;
  const speedDrift = ((current.speed - baseline.speed) / baseline.speed) * 100;
  const volumeDrift = ((current.vibe - baseline.vibe) / baseline.vibe) * 100;
  const toneDrift = ((current.tone - baseline.tone) / baseline.tone) * 100;
  
  const avgDrift = (pitchDrift + speedDrift + volumeDrift + toneDrift) / 4;
  
  let status: 'STABLE' | 'UPGRADE' | 'DEGRADING';
  if (Math.abs(avgDrift) < 5) status = 'STABLE';
  else if (avgDrift > 0 && toneDrift > 0) status = 'UPGRADE';
  else status = 'DEGRADING';
  
  return {
    driftRate: avgDrift,
    status,
    changes: {
      pitch: pitchDrift,
      speed: speedDrift,
      volume: volumeDrift,
      tone: toneDrift,
    },
  };
}
```

#### 6.3 UI表示

```typescript
<div className="glass rounded-xl p-4 mb-4">
  <h3 className="font-semibold mb-2">📊 Voice Drift Analysis</h3>
  <div className="flex items-center justify-between mb-2">
    <span>Status:</span>
    <span className={`font-bold ${
      driftAnalysis.status === 'STABLE' ? 'text-green-400' :
      driftAnalysis.status === 'UPGRADE' ? 'text-cyan-400' :
      'text-red-400'
    }`}>
      {driftAnalysis.status}
    </span>
  </div>
  <div className="text-sm text-gray-400">
    <p>Drift Rate: {driftAnalysis.driftRate.toFixed(1)}% from baseline</p>
    <p className="text-xs mt-1">
      Recorded: {daysSince} days ago ({baselineDate})
    </p>
  </div>
</div>
```

---

## 🎯 優先実装順序

1. ✅ **Toxicity Levels** (完了)
2. ✅ **Compatibility Matrix** (完了)
3. **Vault訴求UI** (1時間) - 高ROI
4. **Stripe統合** (2-3時間) - 収益化必須
5. **OTO Modal** (30分) - 収益最大化
6. **Drift Rate** (2時間) - リピート促進

---

## 💡 Tips

### 環境変数

```.env.local
# Stripe
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Firebase (既存)
NEXT_PUBLIC_FIREBASE_API_KEY=...

# App
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### Vercel Deployment

```bash
vercel env add STRIPE_SECRET_KEY
vercel env add STRIPE_WEBHOOK_SECRET
```

### Stripe Webhook設定

```
Endpoint URL: https://yourdomain.com/api/webhook
Events: checkout.session.completed
```

---

**実装完了チェックリスト**:
- [ ] Toxicity Selector統合
- [ ] Compatibility Matrix表示
- [ ] Vault訴求メッセージ
- [ ] Stripe Checkout
- [ ] Webhook処理
- [ ] OTOモーダル
- [ ] Drift Rate計算
- [ ] Timeline表示

Phase 2完成後の推定MRR: $5,000-10,000/月（1,000ユーザー想定）
