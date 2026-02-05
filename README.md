# 🔮 BlurMagic AI

AI-powered image blurring tool for content creators, privacy advocates, and social media managers. Blur photos in seconds with intelligent detection and one-click compliance presets.

![BlurMagic AI](https://img.shields.io/badge/BlurMagic-AI-blue?style=for-the-badge)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4-06B6D4?style=for-the-badge&logo=tailwindcss)

## ✨ Features

### 🤖 AI-Powered Blurring
- **Smart Detection**: Automatically detect faces, text, and sensitive areas using Google Gemini AI
- **One-Click Presets**: Platform-specific compliance (Twitter, Instagram, OnlyFans)
- **Context Awareness**: AI understands what to preserve and what to blur

### 🎨 Manual Controls
- **Gaussian Blur**: Professional soft blur effect
- **Pixelate**: Hard pixelation for heavy censoring
- **Adjustable Intensity**: Fine-tune blur strength (0-100)
- **Focus Radius**: Selective blur with focal points

### 🔒 Privacy First
- **Client-Side Processing**: Manual edits happen in your browser
- **Metadata Wiping**: Remove EXIF, GPS, and camera data
- **No Storage**: Images are never stored on our servers

### ⚡ Productivity
- **Batch Processing**: Edit hundreds of images at once
- **Before/After Slider**: Compare original and processed
- **Keyboard Shortcuts**: Power-user friendly
- **Drag & Drop**: Easy image upload

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Gemini API Key ([Get one free](https://aistudio.google.com/app/apikey))
- Firebase Account ([Create free](https://console.firebase.google.com))

### Installation

```bash
# Clone the repository
git clone https://github.com/caesarars/blurmagic-ai.git
cd blurmagic-ai

# Install dependencies
npm install

# Set up Firebase (see Firebase Setup section below)

# Start development server
npm run dev
```

## 🔥 Firebase Setup

BlurMagic AI uses Firebase for authentication and user data storage. Follow these steps:

### Option 1: Interactive Setup (Recommended)

```bash
node scripts/setup-firebase.js
```

### Option 2: Manual Setup

#### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Create a project"
3. Follow the setup wizard

#### 2. Enable Authentication
1. Go to **Authentication** → **Sign-in method**
2. Enable:
   - ✅ **Google** (enable and add support email)
   - ✅ **Email/Password**
   - (Optional) Twitter/X

#### 3. Setup Firestore Database
1. Go to **Firestore Database**
2. Click "Create database"
3. Choose **"Start in production mode"**
4. Select region: `asia-southeast2` (Jakarta) for Indonesia

#### 4. Security Rules
Go to Firestore **Rules** tab and paste:

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

#### 5. Get Firebase Config
1. Go to **Project Settings** → **General**
2. Scroll to "Your apps" → Click **"</>"** (Web)
3. Register app and copy the config

#### 6. Create .env.local

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
# Gemini API Key
VITE_GEMINI_API_KEY=your_gemini_api_key

# Firebase Config
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

For detailed instructions, see [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS
- **AI**: Google Gemini API
- **Image Processing**: HTML5 Canvas, EXIFR
- **Utilities**: JSZip, React Hooks

## 📁 Project Structure

```
blurmagic-ai/
├── components/          # React components
│   ├── AuthModal.tsx       # Login/signup modal
│   ├── ErrorBoundary.tsx
│   ├── Gallery.tsx
│   ├── Header.tsx
│   ├── ImageEditor.tsx
│   ├── LandingPage.tsx     # Marketing landing page
│   ├── MetadataInspector.tsx
│   ├── PrivacyModal.tsx
│   ├── ProtectedRoute.tsx  # Auth guard
│   ├── Sidebar.tsx
│   └── UserProfile.tsx     # User menu & usage stats
├── config/              # Configuration
│   └── firebase.ts      # Firebase setup & functions
├── contexts/            # React contexts
│   ├── AuthContext.tsx  # Authentication state
│   └── ToastContext.tsx
├── hooks/               # Custom React hooks
│   ├── useA11y.ts
│   ├── useImageProcessor.ts
│   └── useKeyboardShortcuts.ts
├── scripts/             # Helper scripts
│   └── setup-firebase.js
├── services/            # API services
│   └── geminiService.ts
├── App.tsx              # Main app component
├── index.tsx            # Entry point
├── index.css            # Global styles
├── types.ts             # TypeScript types
└── ...config files
```

## 🎯 Use Cases

### Content Creators
- Create teaser content for premium subscribers
- Compliance-friendly previews for social media
- Batch process photoshoots

### Privacy Advocates
- Anonymize faces in protest photos
- Hide license plates
- Redact sensitive documents

### Social Media Managers
- Brand-safe content moderation
- Quick blurring for user-generated content
- Consistent styling across platforms

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + O` | Open file picker |
| `Ctrl + S` | Download active image |
| `←` `→` | Navigate between images |
| `Delete` | Remove active image |

## 🎨 Customization

### Adding New Presets

Edit `App.tsx` to add custom compliance presets:

```typescript
const customPresets = {
  heavy_censor: { intensity: 50, type: 'pixelate' },
  light_blur: { intensity: 10, type: 'gaussian' }
};
```

### Theming

Modify `tailwind.config.js` and `index.css` to customize:
- Colors
- Border radius
- Animations
- Shadows

## 🚀 Deployment

### Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

### Netlify

```bash
npm run build
# Drag 'dist' folder to Netlify
```

### Environment Setup for Production

Set these environment variables in your hosting platform:

```env
# Required
VITE_GEMINI_API_KEY=your_gemini_key
VITE_FIREBASE_API_KEY=your_firebase_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

#### Vercel
1. Go to Project Settings → Environment Variables
2. Add each variable one by one
3. Redeploy the project

#### Authorized Domains
In Firebase Console → Authentication → Settings → Authorized Domains, add:
- `localhost` (for local dev)
- `your-app.vercel.app` (production)
- Your custom domain (if any)

## 📝 API Usage

### Free Tier Limits
- Gemini API: 1,500 requests/day (free tier)
- Rate limit: 60 requests/minute

### Optimizations
- Images are resized to 1024px max before API call
- JPEG compression for faster uploads
- Client-side caching of processed images

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing`)
5. Open a Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) file

## 🔗 Links

- [Live Demo](https://blurmagic.vercel.app)
- [Report Bug](https://github.com/caesarars/blurmagic-ai/issues)
- [Request Feature](https://github.com/caesarars/blurmagic-ai/issues)

---

<p align="center">
  Built with ❤️ for creators who value privacy
</p>
 
vercel-rebuild: 05/02/2026 17:06:04,64 
