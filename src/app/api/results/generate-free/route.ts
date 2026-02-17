import { NextRequest, NextResponse } from 'next/server';
import { getDb, isFirebaseConfigured } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { MILESTONES } from '@/config/milestones';

/**
 * Endpoint to trigger AI Analysis for FREE when community goals are met.
 */
export async function POST(req: NextRequest) {
    try {
        const { resultId } = await req.json();

        if (!resultId) {
            return NextResponse.json({ error: 'resultId is required' }, { status: 400 });
        }

        if (!isFirebaseConfigured()) {
            return NextResponse.json({ error: 'Firebase not configured' }, { status: 500 });
        }

        const db = getDb();
        const resultRef = doc(db, 'results', resultId);
        const resultSnap = await getDoc(resultRef);

        if (!resultSnap.exists()) {
            return NextResponse.json({ error: 'Result not found' }, { status: 404 });
        }

        const data = resultSnap.data();

        // 1. Check if already generated
        if (data.aiAnalysis) {
            return NextResponse.json({ success: true, message: 'Already exists' });
        }

        // 2. Unlocked for everyone now
        const isSolo = data.typeCode !== 'COUPLE_MIX' && !data.coupleData;
        const isCouple = !isSolo;

        let isUnlocked = true; // All features are now free

        // 3. Trigger Gemini generation (reusing logic from webhook)
        const { SoloIdentityEngine, CoupleResonanceEngine, normalizeMetricsForEngine } = await import('@/lib/voiceProcessor');
        const { generateContent } = await import('@/lib/gemini');
        const { SOLO_AUDIT_SYSTEM_PROMPT, COUPLE_AUDIT_SYSTEM_PROMPT } = await import('@/lib/prompts');

        let aiReport = null;

        if (isSolo && data.metrics) {
            const normalized = normalizeMetricsForEngine(data.metrics);
            const engine = new SoloIdentityEngine(
                normalized.p, normalized.s, normalized.v, normalized.t,
                data.mbti || 'INTJ', data.gender, data.birthYear
            );
            const payload = engine.generatePayload();
            aiReport = await generateContent(SOLO_AUDIT_SYSTEM_PROMPT, JSON.stringify(payload, null, 2));
        } else if (isCouple && data.coupleData) {
            const { userA, userB, relationshipType } = data.coupleData;
            const normalizedA = normalizeMetricsForEngine(userA.metrics);
            const normalizedB = normalizeMetricsForEngine(userB.metrics);
            const engine = new CoupleResonanceEngine(
                { ...normalizedA, name: userA.name, job: userA.job, accent: userA.accent || 'Standard English', gender: userA.gender, birthYear: userA.birthYear },
                { ...normalizedB, name: userB.name, job: userB.job, accent: userB.accent || 'Standard English', gender: userB.gender, birthYear: userB.birthYear },
                relationshipType || 'romantic'
            );
            const payload = engine.generatePayload();
            aiReport = await generateContent(COUPLE_AUDIT_SYSTEM_PROMPT, JSON.stringify(payload, null, 2));
        }

        if (aiReport) {
            await updateDoc(resultRef, {
                aiAnalysis: aiReport,
                updatedAt: new Date()
            });
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json({ error: 'Generation failed' }, { status: 500 });
        }

    } catch (error: any) {
        console.error('Free generation error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
