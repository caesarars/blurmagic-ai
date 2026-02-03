import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  onRequireAuth: () => void;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, onRequireAuth }) => {
  const { user, usage, loading: authLoading } = useAuth();
  const [showLoading, setShowLoading] = useState(true);

  const handleUpgrade = async () => {
    if (!user) return;
    const uid = user.uid;
    const email = user.email || '';
    const text = `Hi BlurMagic, I reached my limit and want to upgrade.\nUID: ${uid}\nEmail: ${email}\nPlan: PRO (monthly)\n`;
    const wa = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(wa, '_blank', 'noopener,noreferrer');
  };

  useEffect(() => {
    // Give a small delay to prevent flash of content
    const timer = setTimeout(() => {
      setShowLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Show loading while checking auth state
  if (authLoading || showLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Check if user is authenticated
  if (!user) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center p-8">
          <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">Sign In Required</h2>
          <p className="text-slate-400 mb-6 max-w-sm">
            Please sign in to use BlurMagic AI. Free tier includes 5 images per day.
          </p>
          <button
            onClick={onRequireAuth}
            className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-full font-semibold transition-all shadow-lg"
          >
            Sign In to Continue
          </button>
        </div>
      </div>
    );
  }

  // Check if user has reached daily limit (but allow if usage is 0/5 - new user)
  if (!usage.canUse && usage.remaining === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center p-8 max-w-md">
          <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-800 rounded-full text-sm text-slate-400 mb-4">
            <span>Free Tier:</span>
            <span className="text-white font-bold">{usage.limit} images/day</span>
          </div>
          <h2 className="text-2xl font-bold mb-2">Daily Limit Reached</h2>
          <p className="text-slate-400 mb-2">
            You've used all {usage.limit} images for today.
          </p>
          <p className="text-sm text-slate-500 mb-6">
            Your limit will reset at midnight. Upgrade to Pro for 100 images/day.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => handleUpgrade().catch(console.error)}
              className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white px-6 py-3 rounded-full font-semibold transition-all shadow-lg"
            >
              Upgrade to Pro
            </button>
            <button
              className="bg-white/5 hover:bg-white/10 text-white px-6 py-3 rounded-full font-semibold transition-all border border-white/10"
            >
              Learn More
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
