# 🔧 Auth Troubleshooting Guide

## Problem: Login berhasil tapi tidak redirect ke app

Kamu login dengan Google, popup muncul, login berhasil, tapi app tetap menunjukkan "Sign In Required".

---

## 🔍 Langkah 1: Cek Browser Console

Buka browser DevTools (F12) → tab **Console**.

Cari pesan error seperti:
- `auth/unauthorized-domain`
- `auth/popup-closed-by-user`
- `auth/popup-blocked`
- `Error creating user document`

---

## 🔧 Langkah 2: Fix Authorized Domains (Paling Umum!)

### Buka Firebase Console:
```
https://console.firebase.google.com/project/blurimage-ai/authentication/settings
```

### Tambahkan Domain:
1. Scroll ke section **"Authorized domains"**
2. Click **"Add domain"**
3. Tambahkan:
   - `localhost`
   - `127.0.0.1`
   - `localhost:3001` (atau port yang kamu pakai)

![Authorized Domains](https://i.imgur.com/example.png)

---

## 🔧 Langkah 3: Enable Authentication Providers

### Buka Firebase Console:
```
https://console.firebase.google.com/project/blurimage-ai/authentication/providers
```

### Pastikan ini sudah **Enabled**:
- ✅ **Google** (sign-in method enabled)
- ✅ **Email/Password** (sign-in method enabled)

Kalau belum:
1. Click provider
2. Toggle **"Enable"**
3. Click **"Save"**

---

## 🔧 Langkah 4: Setup Firestore Database

### Buka Firebase Console:
```
https://console.firebase.google.com/project/blurimage-ai/firestore
```

### Pastikan:
1. Database sudah dibuat (Create database)
2. Security rules sudah di-set

### Security Rules (PASTIKAN SUDAH DI-PUBLISH!):
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

**Jangan lupa click "Publish"!**

---

## 🔧 Langkah 5: Disable Popup Blockers

Chrome/Safari sering block popup dari Firebase.

### Cara allow:
1. Saat login, browser akan block popup (icon di address bar)
2. Click icon tersebut
3. Pilih **"Always allow popups from localhost"**

Atau:
1. Chrome Settings → Privacy → Site Settings → Popups
2. Add `localhost` to allowed list

---

## 🔧 Langkah 6: Test dengan Debug Panel

Setelah update kode, jalankan:

```bash
npm run dev
```

Buka `http://localhost:3001`

### Gunakan Debug Panel:
1. Click tombol **"Debug"** di pojok kiri bawah
2. Cek status:
   - `VITE_FIREBASE_API_KEY` harus: ✅ Set
   - `VITE_FIREBASE_AUTH_DOMAIN` harus: ✅ Set
   - User harus: (email kamu)

---

## 🔍 Common Error Codes

| Error Code | Arti | Solusi |
|------------|------|--------|
| `auth/unauthorized-domain` | Domain tidak di-whitelist | Tambahkan localhost ke Firebase authorized domains |
| `auth/popup-blocked` | Popup diblock browser | Allow popup untuk localhost |
| `auth/popup-closed-by-user` | User menutup popup | Login ulang, jangan close popup |
| `auth/cancelled-popup-request` | Multiple popup dibuka | Tutup semua popup, coba lagi |
| `auth/network-request-failed` | Koneksi internet bermasalah | Cek koneksi, coba lagi |
| `permission-denied` | Firestore rules salah | Update security rules, publish |

---

## 🧪 Test Flow Lengkap

1. **Clear browser cache & cookies** untuk localhost
2. **Restart dev server** (`npm run dev`)
3. Buka `http://localhost:3001`
4. Click **"Debug"** → pastikan env vars ter-set
5. Click **"Try Free"** atau **"Launch App"**
6. Click **"Sign In"**
7. Pilih **Google**
8. **Allow popup** kalau ditanya browser
9. Login dengan Google account
10. Popup seharusnya close otomatis
11. App seharusnya show user avatar & usage bar

---

## 🚨 Kalau Masih Tidak Work

### Coba Incognito Mode:
```
Chrome: Ctrl+Shift+N
Firefox: Ctrl+Shift+P
Safari: Cmd+Shift+N
```

Lalu ulangi test flow di atas.

### Coba Different Browser:
Kalau Chrome tidak work, coba Firefox atau Safari.

### Check .env.local:
```bash
cat .env.local
```

Pastikan semua variable ter-set dengan benar (bukan "your-api-key" atau kosong).

---

## 📞 Masih Stuck?

Screenshot dan kirim:
1. Browser console (F12 → Console)
2. Debug panel (click tombol Debug)
3. Firebase Console → Authentication → Users (cek user sudah terbuat?)

---

## ✅ Checklist Sebelum Login

- [ ] `npm run dev` jalan tanpa error
- [ ] `.env.local` punya semua Firebase config
- [ ] Firebase project `blurimage-ai` sudah dibuat
- [ ] Google Sign-In enabled di Firebase Console
- [ ] Firestore Database created
- [ ] Firestore Rules published
- [ ] `localhost` di authorized domains
- [ ] Popup blockers disabled
