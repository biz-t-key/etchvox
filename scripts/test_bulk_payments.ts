import { getDb, isFirebaseConfigured } from '../src/lib/firebase';
import { doc, setDoc, getDoc, Timestamp } from 'firebase/firestore';

async function runBulkTest() {
    if (!isFirebaseConfigured()) {
        console.error('Firebase not configured');
        return;
    }

    const db = getDb();
    const testIds = Array.from({ length: 10 }, (_, i) => `test_user_v2_${Date.now()}_${i}`);

    console.log('--- Phase 1: Creating 10 Virtual Users ---');
    for (const id of testIds) {
        await setDoc(doc(db, 'results', id), {
            id,
            typeCode: 'HIRED',
            isPremium: false,
            createdAt: Timestamp.now(),
            mode: 'solo',
            email: `test_${id}@example.com`
        });
        console.log(`Created: ${id}`);
    }

    console.log('\n--- Phase 2: Simulating 10 Concurrent Webhooks ---');
    const start = Date.now();

    // Inject bypass logic for testing
    const webhookPromises = testIds.map(async (id) => {
        const payload = {
            type: 'order.created',
            data: {
                id: `order_${id}`,
                metadata: { result_id: id },
                customer: { email: `test_${id}@example.com` }
            }
        };

        const res = await fetch('http://localhost:3000/api/webhook/polar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'webhook-signature': 'test_dummy',
                'x-test-bypass': 'true'
            },
            body: JSON.stringify(payload)
        });
        return { id, status: res.status, body: await res.json() };
    });

    const results = await Promise.all(webhookPromises);
    const end = Date.now();
    console.log(`Sent 10 webhooks in ${end - start}ms`);
    results.forEach(r => console.log(`ID: ${r.id} -> Status: ${r.status}`));

    console.log('\n--- Phase 3: Verifying Firestore Unlocks ---');
    let successCount = 0;
    for (const id of testIds) {
        const snap = await getDoc(doc(db, 'results', id));
        if (snap.exists() && snap.data().isPremium === true) {
            console.log(`✓ Result ${id}: UNLOCKED`);
            successCount++;
        } else {
            console.log(`✗ Result ${id}: STILL LOCKED`);
        }
    }

    console.log(`\nSimulation Result: ${successCount}/10 successful.`);
}

runBulkTest();
