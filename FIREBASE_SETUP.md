# 🔥 Firebase Setup Guide for VoiceGlow

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"**
3. Project name: `voiceglow` (or your preferred name)
4. Disable Google Analytics (optional for MVP)
5. Click **"Create project"**

---

## Step 2: Enable Firestore

1. In Firebase Console, go to **Build → Firestore Database**
2. Click **"Create database"**
3. Select **"Start in production mode"**
4. Choose location: `asia-northeast1` (Tokyo) or your preferred region
5. Click **"Enable"**

### Firestore Security Rules (Copy & Paste)

Go to **Firestore → Rules** and replace with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Results collection - public read, client write
    match /results/{resultId} {
      allow read: if true;
      allow create: if true;
      allow update: if request.resource.data.diff(resource.data).affectedKeys()
        .hasOnly(['audioUrl', 'audioPath', 'isPremium', 'premiumPurchasedAt', 'updatedAt']);
    }
    
    // Sessions collection - client read/write own session
    match /sessions/{sessionId} {
      allow read, write: if true;
    }
    
    // Stats collection - public read, server-only write in production
    match /stats/{docId} {
      allow read: if true;
      allow write: if true; // Change to false and use server functions in production
    }
  }
}
```

---

## Step 3: Enable Storage

1. Go to **Build → Storage**
2. Click **"Get started"**
3. Select **"Start in production mode"**
4. Choose same location as Firestore
5. Click **"Done"**

### Storage Security Rules (Copy & Paste)

Go to **Storage → Rules** and replace with:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Audio files - public read, client write
    match /audio/{fileName} {
      allow read: if true;
      allow write: if request.resource.size < 10 * 1024 * 1024  // Max 10MB
                   && request.resource.contentType.matches('audio/.*');
    }
  }
}
```

---

## Step 4: Get Configuration

1. Go to **Project Settings** (gear icon)
2. Scroll down to **"Your apps"**
3. Click **"Web"** icon (</>) to add a web app
4. App nickname: `voiceglow-web`
5. **DO NOT** enable Firebase Hosting (we use Vercel)
6. Click **"Register app"**
7. Copy the configuration object

### Configuration Example

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyA...",
  authDomain: "voiceglow-xxxxx.firebaseapp.com",
  projectId: "voiceglow-xxxxx",
  storageBucket: "voiceglow-xxxxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123def456"
};
```

---

## Step 5: Add to .env.local

Create `.env.local` in your project root:

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyA...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=voiceglow-xxxxx.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=voiceglow-xxxxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=voiceglow-xxxxx.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123def456

# App Configuration
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXT_PUBLIC_DEFAULT_LOCALE=en
```

---

## Step 6: Initialize Stats Document

After setup, create the initial stats document in Firestore:

**Collection:** `stats`
**Document ID:** `global`

```json
{
  "totalScans": 14028,
  "totalDataBytes": 482000000000,
  "lastUpdatedAt": "<server timestamp>"
}
```

---

## Verification Checklist

- [ ] Firebase project created
- [ ] Firestore enabled with rules
- [ ] Storage enabled with rules
- [ ] Web app registered
- [ ] `.env.local` created with config
- [ ] Restart dev server (`npm run dev`)
- [ ] Check console for "Result saved to Firestore" message after recording

---

## Troubleshooting

### "Permission denied" error
→ Check Firestore/Storage security rules

### "Firebase not configured" warning
→ Verify all NEXT_PUBLIC_FIREBASE_* env variables are set

### Images/audio not loading
→ Check Storage rules allow read access

---

*Firebase Setup Guide v1.0*
