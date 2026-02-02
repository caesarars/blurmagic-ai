#!/usr/bin/env node

/**
 * Firebase Setup Helper Script
 * 
 * Usage: node scripts/setup-firebase.js
 * 
 * This script helps you set up Firebase configuration for BlurMagic AI
 */

import fs from 'fs';
import path from 'path';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

console.log(`
🔥 BlurMagic AI - Firebase Setup Helper
========================================

This script will help you set up Firebase configuration.
Make sure you have:
1. Created a Firebase project at https://console.firebase.google.com
2. Enabled Authentication (Google, Email/Password)
3. Created Firestore Database
4. Copied your Firebase config

Let's get started!
`);

async function setup() {
  try {
    // Check if .env.local exists
    const envPath = path.join(process.cwd(), '.env.local');
    const envExamplePath = path.join(process.cwd(), '.env.example');
    
    let envContent = '';
    
    if (fs.existsSync(envPath)) {
      const overwrite = await question('.env.local already exists. Overwrite? (y/n): ');
      if (overwrite.toLowerCase() !== 'y') {
        console.log('Setup cancelled. Your existing .env.local is preserved.');
        rl.close();
        return;
      }
      envContent = fs.readFileSync(envPath, 'utf8');
    } else if (fs.existsSync(envExamplePath)) {
      envContent = fs.readFileSync(envExamplePath, 'utf8');
    }

    console.log('\n📋 Enter your Firebase configuration:');
    console.log('(Find these in Firebase Console → Project Settings → Your Apps → Web)\n');

    const apiKey = await question('API Key: ');
    const authDomain = await question('Auth Domain: ');
    const projectId = await question('Project ID: ');
    const storageBucket = await question('Storage Bucket: ');
    const messagingSenderId = await question('Messaging Sender ID: ');
    const appId = await question('App ID: ');

    console.log('\n📝 Enter your Gemini API Key:');
    const geminiKey = await question('Gemini API Key: ');

    // Build env content
    const newEnvContent = `# Firebase Configuration
VITE_FIREBASE_API_KEY=${apiKey}
VITE_FIREBASE_AUTH_DOMAIN=${authDomain}
VITE_FIREBASE_PROJECT_ID=${projectId}
VITE_FIREBASE_STORAGE_BUCKET=${storageBucket}
VITE_FIREBASE_MESSAGING_SENDER_ID=${messagingSenderId}
VITE_FIREBASE_APP_ID=${appId}

# Gemini API Key
VITE_GEMINI_API_KEY=${geminiKey}
`;

    // Write to .env.local
    fs.writeFileSync(envPath, newEnvContent);

    console.log(`
✅ Success! Firebase configuration saved to .env.local

Next steps:
1. Run: npm run dev
2. Open: http://localhost:3001
3. Test authentication

Make sure you have:
- Enabled Google Sign-In in Firebase Console
- Enabled Email/Password Sign-In
- Set up Firestore Database with security rules

Happy coding! 🚀
`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    rl.close();
  }
}

setup();
