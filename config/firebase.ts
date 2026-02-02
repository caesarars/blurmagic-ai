import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  TwitterAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  signOut,
  onAuthStateChanged,
  type User,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc,
  serverTimestamp,
  type Timestamp,
  enableIndexedDbPersistence
} from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Validate config
if (!firebaseConfig.apiKey || firebaseConfig.apiKey === 'your-api-key') {
  console.error('❌ Firebase config missing! Check .env.local file');
}

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

// Enable offline persistence for Firestore
try {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Firestore persistence failed: Multiple tabs open');
    } else if (err.code === 'unimplemented') {
      console.warn('Firestore persistence not supported');
    }
  });
} catch (e) {
  console.warn('Persistence setup error:', e);
}

// Set auth persistence to LOCAL (survives browser restart)
setPersistence(auth, browserLocalPersistence).catch(console.error);

// Auth Providers
const googleProvider = new GoogleAuthProvider();
const twitterProvider = new TwitterAuthProvider();

// Add scopes for Google
googleProvider.addScope('email');
googleProvider.addScope('profile');

// User Data Interface
export interface UserData {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  plan: 'free' | 'pro' | 'team';
  dailyUsage: number;
  totalUsage: number;
  lastResetDate: Timestamp | null;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
}

// Auth Functions
export const signInWithGoogle = async () => {
  try {
    console.log('🔐 Starting Google Sign In...');
    console.log('🔧 Auth Domain:', firebaseConfig.authDomain);
    
    const result = await signInWithPopup(auth, googleProvider);
    console.log('✅ Google Sign In successful:', result.user.email);
    
    console.log('📝 Creating user document...');
    await createUserDocument(result.user);
    console.log('✅ User document created');
    
    return { user: result.user, error: null };
  } catch (error: any) {
    console.error('❌ Google Sign In Error:', error);
    console.error('Error Code:', error.code);
    console.error('Error Message:', error.message);
    
    // Handle specific errors
    if (error.code === 'auth/popup-closed-by-user') {
      return { user: null, error: 'Login cancelled. Please try again.' };
    }
    if (error.code === 'auth/popup-blocked') {
      return { user: null, error: 'Popup blocked. Please allow popups for this site.' };
    }
    if (error.code === 'auth/unauthorized-domain') {
      return { user: null, error: 'This domain is not authorized. Please add localhost to Firebase authorized domains.' };
    }
    if (error.code === 'auth/cancelled-popup-request') {
      return { user: null, error: 'Login cancelled. Please try again.' };
    }
    
    return { user: null, error: error.message };
  }
};

export const signInWithTwitter = async () => {
  try {
    console.log('🔐 Starting Twitter Sign In...');
    const result = await signInWithPopup(auth, twitterProvider);
    console.log('✅ Twitter Sign In successful:', result.user.email);
    
    await createUserDocument(result.user);
    console.log('✅ User document created');
    
    return { user: result.user, error: null };
  } catch (error: any) {
    console.error('❌ Twitter Sign In Error:', error);
    console.error('Error Code:', error.code);
    console.error('Error Message:', error.message);
    
    if (error.code === 'auth/popup-closed-by-user') {
      return { user: null, error: 'Login cancelled. Please try again.' };
    }
    if (error.code === 'auth/popup-blocked') {
      return { user: null, error: 'Popup blocked. Please allow popups for this site.' };
    }
    
    return { user: null, error: error.message };
  }
};

export const signInWithEmail = async (email: string, password: string) => {
  try {
    console.log('🔐 Starting Email Sign In...');
    const result = await signInWithEmailAndPassword(auth, email, password);
    console.log('✅ Email Sign In successful:', result.user.email);
    return { user: result.user, error: null };
  } catch (error: any) {
    console.error('❌ Email Sign In Error:', error);
    
    if (error.code === 'auth/user-not-found') {
      return { user: null, error: 'Account not found. Please check your email or sign up.' };
    }
    if (error.code === 'auth/wrong-password') {
      return { user: null, error: 'Incorrect password. Please try again.' };
    }
    if (error.code === 'auth/invalid-email') {
      return { user: null, error: 'Invalid email address.' };
    }
    if (error.code === 'auth/too-many-requests') {
      return { user: null, error: 'Too many failed attempts. Please try again later.' };
    }
    
    return { user: null, error: error.message };
  }
};

export const signUpWithEmail = async (email: string, password: string, displayName: string) => {
  try {
    console.log('🔐 Starting Email Sign Up...');
    const result = await createUserWithEmailAndPassword(auth, email, password);
    console.log('✅ Account created:', result.user.email);
    
    await updateProfile(result.user, { displayName });
    console.log('✅ Profile updated with display name');
    
    await createUserDocument(result.user, { displayName });
    console.log('✅ User document created');
    
    return { user: result.user, error: null };
  } catch (error: any) {
    console.error('❌ Email Sign Up Error:', error);
    
    if (error.code === 'auth/email-already-in-use') {
      return { user: null, error: 'Email already registered. Please sign in instead.' };
    }
    if (error.code === 'auth/invalid-email') {
      return { user: null, error: 'Invalid email address.' };
    }
    if (error.code === 'auth/weak-password') {
      return { user: null, error: 'Password is too weak. Use at least 6 characters.' };
    }
    
    return { user: null, error: error.message };
  }
};

export const resetPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { error: null };
  } catch (error: any) {
    console.error('❌ Password Reset Error:', error);
    
    if (error.code === 'auth/user-not-found') {
      return { error: 'No account found with this email.' };
    }
    if (error.code === 'auth/invalid-email') {
      return { error: 'Invalid email address.' };
    }
    
    return { error: error.message };
  }
};

export const logOut = async () => {
  try {
    await signOut(auth);
    return { error: null };
  } catch (error: any) {
    console.error('❌ Logout Error:', error);
    return { error: error.message };
  }
};

// Firestore Functions
const createUserDocument = async (user: User, additionalData: Partial<UserData> = {}) => {
  if (!user) {
    console.error('❌ No user provided to createUserDocument');
    return;
  }

  console.log('📝 Creating/fetching user document for:', user.uid);

  const userRef = doc(db, 'users', user.uid);
  
  try {
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      console.log('📝 User document does not exist, creating new...');
      
      const userData: Omit<UserData, 'uid'> = {
        email: user.email,
        displayName: additionalData.displayName || user.displayName,
        photoURL: user.photoURL,
        plan: 'free',
        dailyUsage: 0,
        totalUsage: 0,
        lastResetDate: serverTimestamp() as unknown as Timestamp,
        createdAt: serverTimestamp() as unknown as Timestamp,
        updatedAt: serverTimestamp() as unknown as Timestamp,
      };

      await setDoc(userRef, userData);
      console.log('✅ User document created successfully');
    } else {
      console.log('ℹ️ User document already exists');
    }
  } catch (error) {
    console.error('❌ Error creating user document:', error);
    // Don't throw - we don't want to break the auth flow if Firestore fails
  }
};

export const getUserData = async (uid: string, retries = 3): Promise<UserData | null> => {
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return { uid, ...userSnap.data() } as UserData;
    }
    return null;
  } catch (error: any) {
    // Retry if offline error
    if (error.code === 'unavailable' && retries > 0) {
      console.warn(`⚠️ Firestore offline, retrying... (${retries} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return getUserData(uid, retries - 1);
    }
    
    console.error('❌ Error getting user data:', error);
    // Return null but don't break the app
    return null;
  }
};

export const updateUserPlan = async (uid: string, plan: 'free' | 'pro' | 'team') => {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      plan,
      updatedAt: serverTimestamp()
    });
    return { error: null };
  } catch (error: any) {
    console.error('❌ Error updating plan:', error);
    return { error: error.message };
  }
};

export const incrementUserUsage = async (uid: string, count: number = 1) => {
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) return { error: 'User not found' };
    
    const userData = userSnap.data() as UserData;
    const now = new Date();
    const lastReset = userData.lastResetDate?.toDate() || new Date(0);
    
    const isSameDay = lastReset.toDateString() === now.toDateString();
    
    if (!isSameDay) {
      await updateDoc(userRef, {
        dailyUsage: count,
        totalUsage: (userData.totalUsage || 0) + count,
        lastResetDate: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } else {
      await updateDoc(userRef, {
        dailyUsage: (userData.dailyUsage || 0) + count,
        totalUsage: (userData.totalUsage || 0) + count,
        updatedAt: serverTimestamp()
      });
    }
    
    return { error: null };
  } catch (error: any) {
    console.error('❌ Error incrementing usage:', error);
    return { error: error.message };
  }
};

export const checkUsageLimit = async (uid: string): Promise<{ canUse: boolean; remaining: number; limit: number }> => {
  try {
    const userData = await getUserData(uid);
    
    // Default untuk user baru yang belum ada document
    if (!userData) {
      console.log('ℹ️ User data not found, assuming new user with free tier');
      return { canUse: true, remaining: 5, limit: 5 };
    }
    
    const limits = {
      free: 5,
      pro: 100,
      team: 500
    };
    
    const limit = limits[userData.plan] || 5;
    const now = new Date();
    const lastReset = userData.lastResetDate?.toDate() || new Date(0);
    const isSameDay = lastReset.toDateString() === now.toDateString();
    
    const dailyUsage = isSameDay ? userData.dailyUsage : 0;
    const remaining = Math.max(0, limit - dailyUsage);
    
    console.log(`📊 Usage check: ${dailyUsage}/${limit} used, remaining: ${remaining}`);
    
    return { canUse: remaining > 0, remaining, limit };
  } catch (error) {
    console.error('❌ Error checking usage limit:', error);
    // Default allow access kalau error, jangan block user
    return { canUse: true, remaining: 5, limit: 5 };
  }
};

// Auth State Observer
export const onAuthChange = (callback: (user: User | null) => void) => {
  console.log('👂 Setting up auth state listener...');
  return onAuthStateChanged(auth, (user) => {
    console.log('🔄 Auth state changed:', user ? `User: ${user.email}` : 'No user');
    callback(user);
  });
};

export { auth, db, app };
export default app;
