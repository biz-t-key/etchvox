# 🔧 VoiceGlow - 残りの統合ガイド

改行コードの問題でファイル編集が困難なため、残りの実装を手動で行う手順をまとめます。

---

## ✅ Task 1: Vault Download Section（完了）

**作成済みファイル:**
- `src/components/result/VaultDownloadSection.tsx`

**統合手順:**

### 1. import追加
`src/app/result/[id]/page.tsx` の冒頭に追加:
```tsx
import VaultDownloadSection from '@/components/result/VaultDownloadSection';
```

### 2. コンポーネント使用
Line 309 (`})` の後、Line 311 (`{/* Share */}`) の前に以下を挿入:

```tsx
                {/* Vault Enabled - Download Section */}
                {result.vaultEnabled && result.audioUrl && (
                    <VaultDownloadSection 
                        audioUrl={result.audioUrl} 
                        resultId={result.id}
                        createdAt={result.createdAt}
                    />
                )}
```

---

## ⏳ Task 2: Toxicity Selector統合

**必要なファイル修正:**
- `src/app/record/page.tsx`

### 1. handleToxicitySelect関数を追加

`handleAccentSelect` の前に以下を追加:

```tsx
const handleToxicitySelect = (profile: ToxicityProfile) => {
    setToxicity(profile);
    setPhase('accent'); // Toxicity選択後 → Accent選択へ
};
```

### 2. finishRecordingを修正

Line 163-165を以下に変更:

```tsx
        // Show toxicity selector after brief delay
        setTimeout(() => {
            setPhase('toxicity');
        }, 1500);
```

### 3. UIにToxicity フェーズ追加

Line 324（`{phase === 'accent' && (`）の前に以下を挿入:

```tsx
                {/* Toxicity Selection Phase */}
                {phase === 'toxicity' && (
                    <ToxicitySelector onSelect={handleToxicitySelect} />
                )}
```

### 4. 結果保存時にtoxicityを含める

`handleAccentSelect`関数内のresultオブジェクトに追加:

```tsx
            const result: VoiceResult = {
                id: resultId,
                sessionId,
                typeCode: analysisResult.typeCode,
                metrics: analysisResult.metrics,
                accentOrigin: accent,
                createdAt: new Date().toISOString(),
                locale: 'en',
                userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
                vaultEnabled: false,
                toxicityProfile: toxicity, // ← これを追加
            };
```

### 5. 型定義を更新

`src/lib/storage.ts` の `VoiceResult` interfaceに追加:

```tsx
export interface VoiceResult {
    // ... 既存のフィールド
    toxicityProfile?: ToxicityProfile;  // ← これを追加
}
```

そして import を追加:
```tsx
import { ToxicityProfile } from './toxicity';
```

---

## 🎨 Task 3: ソロ結果ページ段階表示（Optional）

**難易度: 高い（カップルモードと同じパターンで実装）**

### 実装パターン:

```tsx
// src/app/result/[id]/page.tsx

const [displayStage, setDisplayStage] = useState<'label' | 'metrics' | 'full'>('label');

useEffect(() => {
    if (!result) return;
    
    setTimeout(() => setDisplayStage('label'), 500);
    setTimeout(() => setDisplayStage('metrics'), 2500);
    setTimeout(() => setDisplayStage('full'), 4500);
}, [result]);

// Stage 1: Label Only
{displayStage === 'label' && (
    <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
            <h1 className="text-7xl font-black text-cyan-400 mb-4">
                {voiceType.name}
            </h1>
            <p className="text-2xl text-gray-300 italic">
                "{voiceType.catchphrase}"
            </p>
            <div className="text-8xl mt-8">{voiceType.icon}</div>
        </div>
    </div>
)}

// Stage 2: Metrics Dashboard
{displayStage === 'metrics' && (
    // メトリクスダッシュボード表示
)}

// Stage 3: Full Report
{displayStage === 'full' && (
    // 現在の完全なレポート表示
)}
```

---

## 📝 統合チェックリスト

- [ ] Task 1: Vault Download Section統合
- [ ] Task 2.1: handleToxicitySelect追加
- [ ] Task 2.2: finishRecording修正
- [ ] Task 2.3: Toxicity Phase UI追加
- [ ] Task 2.4: 結果保存時にtoxicity含める
- [ ] Task 2.5: VoiceResult型定義更新
- [ ] Task 3: ソロ結果ページ段階表示（Optional）

---

## 🧪 テスト手順

### 1. Vault Download Test
```
1. 録音完了
2. Stripe決済でVault購入（Test card: 4242 4242 4242 4242）
3. 結果ページに緑色の "Vault Activated" セクション表示
4. "Download Raw Audio" ボタンクリック
5. webmファイルダウンロード成功
```

### 2. Toxicity Selector Test
```
1. 録音開始
2. 3ステップ録音完了
3. Analyzing → Toxicity Selector表示
4. Nicotine/Ethanol/Sleep選択
5. Accent Selector表示
6. 結果ページでtoxicityデータ保存確認
```

---

**改行コード問題で自動編集できなかったため、手動での統合をお願いします！**

すべての実装コードは用意済みです。
