# 🔥 Firebase Setup Guide untuk BlurMagic AI

Panduan lengkap step-by-step integrasi BlurMagic AI dengan Firebase project kamu.

---

## 📱 Step 1: Buat Firebase Project

### 1.1 Buka Firebase Console
```
🔗 https://console.firebase.google.com
```

### 1.2 Create New Project
1. Click **"Create a project"**
2. **Project name**: `blurmagic-ai` (atau nama lain)
3. **Enable Google Analytics**: Optional (bisa skip)
4. Click **"Create project"**
5. Tunggu sampai ready, lalu click **"Continue"**

---

## 🔐 Step 2: Enable Authentication

### 2.1 Buka Authentication Section
1. Di sidebar kiri, click **"Authentication"**
2. Click tab **"Sign-in method"**

### 2.2 Enable Providers

#### Google Sign-In:
1. Click **"Google"**
2. Toggle **"Enable"**
3. **Project support email**: Pilih email kamu
4. Click **"Save"**

#### Email/Password:
1. Click **"Email/Password"**
2. Toggle **"Enable"**
3. **Email link (passwordless sign-in)**: Optional (bisa OFF)
4. Click **"Save"**

#### Twitter/X (Optional):
1. Click **"Twitter"**
2. Toggle **"Enable"**
3. Butuh **API Key** dan **API Secret** dari Twitter Developer Portal
4. (Skip dulu kalau belum punya)

---

## 💾 Step 3: Setup Firestore Database

### 3.1 Create Database
1. Di sidebar kiri, click **"Firestore Database"**
2. Click **"Create database"**
3. Pilih **"Start in production mode"**
4. Click **"Next"**
5. **Cloud Firestore location**: Pilih yang terdekat:
   - **Asia**: `asia-southeast2` (Jakarta) ← Recommended untuk Indonesia
   - **US**: `us-central`
   - **Europe**: `europe-west`
6. Click **"Enable"**

### 3.2 Setup Security Rules

1. Click tab **"Rules"**
2. Replace rules dengan ini (basic, user bisa read/write doc sendiri):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Deny all other access by default
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

3. Click **"Publish"**

> Kalau kamu pakai model berbayar (manual billing + credits), rules di atas terlalu longgar (user bisa edit `plan/credits` sendiri).
> Pakai rules yang lebih ketat dari file `firestore.rules` di repo ini: hanya boleh update profile fields, sedangkan `plan/credits` server-controlled via Admin API (Vercel `/api`).

---

## ⚙️ Step 4: Get Firebase Config

### 4.1 Project Settings
1. Click icon **⚙️ (Settings)** di sidebar kiri
2. Pilih **"Project settings"**
3. Scroll ke section **"Your apps"**
4. Click icon **"</>"** (Web)

### 4.2 Register App
1. **App nickname**: `blurmagic-web`
2. **Also set up Firebase Hosting**: Jangan centang (sudah pakai Vercel)
3. Click **"Register app"**

### 4.3 Copy Config
Akan muncul kode seperti ini:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyBxxxxxxxxxxxxxxxxxxxx",
  authDomain: "blurmagic-ai-xxxxx.firebaseapp.com",
  projectId: "blurmagic-ai-xxxxx",
  storageBucket: "blurmagic-ai-xxxxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123def456"
};
```

**Copy semua values ini!**

---

## 📝 Step 5: Setup Environment Variables

### 5.1 Buat .env.local File

Di terminal:
```bash
cd blurmagic-ai
cp .env.example .env.local
```

### 5.2 Edit .env.local

Buka file `.env.local` dan paste config:

```env
# Gemini API Key
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# Firebase Config (paste dari step 4.3)
VITE_FIREBASE_API_KEY=AIzaSyBxxxxxxxxxxxxxxxxxxxx
VITE_FIREBASE_AUTH_DOMAIN=blurmagic-ai-xxxxx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=blurmagic-ai-xxxxx
VITE_FIREBASE_STORAGE_BUCKET=blurmagic-ai-xxxxx.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123def456
```

### 5.3 Save File

---

## 🚀 Step 6: Test Local

### 6.1 Install Dependencies (kalau belum)
```bash
npm install
```

### 6.2 Run Development Server
```bash
npm run dev
```

### 6.3 Test Authentication

1. Buka browser: `http://localhost:3001`
2. Click **"Try Free"** atau **"Launch App"**
3. Akan muncul **"Sign In Required"**
4. Click **"Sign In to Continue"**
5. Test login dengan:
   - ✅ Google
   - ✅ Email/Password

### 6.4 Check Firestore Database

1. Buka Firebase Console
2. Click **"Firestore Database"**
3. Click tab **"Data"**
4. Kalau login berhasil, akan muncul collection `users` dengan document user kamu

---

## 🌐 Step 7: Deploy (Vercel)

### 7.1 Add Environment Variables ke Vercel

1. Buka https://vercel.com/dashboard
2. Pilih project BlurMagic AI
3. Click **"Settings"** tab
4. Click **"Environment Variables"**
5. Add satu per satu:

| Name | Value |
|------|-------|
| `VITE_GEMINI_API_KEY` | your_gemini_key |
| `VITE_FIREBASE_API_KEY` | AIzaSy... |
| `VITE_FIREBASE_AUTH_DOMAIN` | blurmagic-ai-xxxxx.firebaseapp.com |
| `VITE_FIREBASE_PROJECT_ID` | blurmagic-ai-xxxxx |
| `VITE_FIREBASE_STORAGE_BUCKET` | blurmagic-ai-xxxxx.appspot.com |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | 123456789 |
| `VITE_FIREBASE_APP_ID` | 1:123456789:web:... |

6. Click **"Save"**

### 7.2 Redeploy
```bash
vercel --prod
```

Atau push ke GitHub (auto-deploy).

---

## 💳 Step 9: Manual Billing (No Payment Gateway)

Karena kamu nggak mau pakai payment gateway, upgrade dilakukan **manual** (misal transfer bank) lalu kamu grant plan/credits lewat Admin API.

### 9.1 Tambah Environment Variables di Vercel

Vercel → Project → Settings → Environment Variables:

```env
# Firebase Admin (service account json)
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}

# Admin API (keep secret)
ADMIN_API_SECRET=your_long_random_secret
```

> Tips: kalau value JSON terlalu panjang, pakai `FIREBASE_SERVICE_ACCOUNT_JSON_BASE64` dan isi base64 dari JSON itu.

### 9.2 Local dev untuk API routes

- Jalankan `npm run dev:vercel` (bukan `npm run dev`) supaya route `/api/*` kebaca.

### 9.3 Grant Plan/Credits (Admin)

Set plan:
- Endpoint: `POST /api/admin-set-plan`
- Header: `x-admin-secret: <ADMIN_API_SECRET>`
- Body JSON:
```json
{ "uid": "<firebase_uid>", "plan": "pro" }
```

Grant credits:
- Endpoint: `POST /api/admin-grant-credits`
- Header: `x-admin-secret: <ADMIN_API_SECRET>`
- Body JSON:
```json
{ "uid": "<firebase_uid>", "amount": 3000, "reason": "manual_monthly" }
```

### 9.4 UX Upgrade

Di UI, tombol **Upgrade to Pro** akan buka WhatsApp template berisi UID + email user.

---

## 🔧 Step 8: Authorized Domains (Important!)

Kalau login error "auth/unauthorized-domain", tambahkan domain:

1. Firebase Console → Authentication → Settings
2. Scroll ke **"Authorized domains"**
3. Click **"Add domain"**
4. Tambahkan:
   - `localhost`
   - `blurmagic-ai.vercel.app` (production domain)
   - Custom domain kalau pakai

---

## 🧪 Troubleshooting

### Error: "auth/configuration-not-found"
**Solusi**: Authentication provider belum di-enable. Cek Step 2.

### Error: "permission-denied"
**Solusi**: Firestore rules belum di-set. Cek Step 3.2.

### Error: "auth/unauthorized-domain"
**Solusi**: Domain belum di-whitelist. Cek Step 8.

### Data tidak muncul di Firestore
**Solusi**: 
1. Cek browser console untuk error
2. Pastikan user sudah login
3. Cek Firestore rules sudah di-publish

---

## ✅ Checklist

- [ ] Firebase project created
- [ ] Google Sign-In enabled
- [ ] Email/Password enabled
- [ ] Firestore database created
- [ ] Security rules published
- [ ] Firebase config copied
- [ ] .env.local file created and filled
- [ ] App running locally
- [ ] Login test passed
- [ ] Firestore shows user data
- [ ] Vercel env vars configured
- [ ] Production deploy successful

---

## 📞 Need Help?

Kalau stuck:
1. Cek browser console (F12) untuk error message
2. Screenshot error dan kirim ke saya
3. Atau cek Firebase docs: https://firebase.google.com/docs/web/setup

---

**Selamat! 🎉**
BlurMagic AI sekarang sudah terintegrasi dengan Firebase kamu!
