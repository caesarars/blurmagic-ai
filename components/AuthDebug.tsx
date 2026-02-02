import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const AuthDebug: React.FC = () => {
  const { user, loading, usage } = useAuth();
  const [envVars, setEnvVars] = useState<Record<string, string>>({});
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    // Check environment variables
    setEnvVars({
      'VITE_FIREBASE_API_KEY': import.meta.env.VITE_FIREBASE_API_KEY ? '✅ Set' : '❌ Missing',
      'VITE_FIREBASE_AUTH_DOMAIN': import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '❌ Missing',
      'VITE_FIREBASE_PROJECT_ID': import.meta.env.VITE_FIREBASE_PROJECT_ID ? '✅ Set' : '❌ Missing',
      'VITE_GEMINI_API_KEY': import.meta.env.VITE_GEMINI_API_KEY ? '✅ Set' : '❌ Missing',
    });
  }, []);

  if (!showDebug) {
    return (
      <button
        onClick={() => setShowDebug(true)}
        className="fixed bottom-4 left-4 z-50 bg-slate-800/80 text-slate-400 px-3 py-1 rounded-full text-xs hover:bg-slate-700"
      >
        Debug
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[300] bg-slate-950/95 flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-2xl p-6 max-w-lg w-full border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Auth Debug Info</h2>
          <button 
            onClick={() => setShowDebug(false)}
            className="text-slate-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          {/* Auth State */}
          <div className="bg-slate-800 rounded-lg p-4">
            <h3 className="font-semibold mb-2 text-blue-400">Auth State</h3>
            <div className="space-y-1 text-sm">
              <p>Loading: {loading ? '⏳ Yes' : '✅ No'}</p>
              <p>User: {user ? `✅ ${user.email}` : '❌ Not logged in'}</p>
              <p>UID: {user?.uid || 'N/A'}</p>
            </div>
          </div>

          {/* Usage */}
          <div className="bg-slate-800 rounded-lg p-4">
            <h3 className="font-semibold mb-2 text-green-400">Usage</h3>
            <div className="space-y-1 text-sm">
              <p>Can Use: {usage.canUse ? '✅ Yes' : '❌ No'}</p>
              <p>Remaining: {usage.remaining}</p>
              <p>Limit: {usage.limit}</p>
            </div>
          </div>

          {/* Environment */}
          <div className="bg-slate-800 rounded-lg p-4">
            <h3 className="font-semibold mb-2 text-amber-400">Environment Variables</h3>
            <div className="space-y-1 text-sm">
              {Object.entries(envVars).map(([key, value]) => (
                <p key={key}>
                  <span className="text-slate-400">{key}:</span>{' '}
                  <span className={value.includes('✅') ? 'text-green-400' : 'text-red-400'}>
                    {value}
                  </span>
                </p>
              ))}
            </div>
          </div>

          {/* Browser Info */}
          <div className="bg-slate-800 rounded-lg p-4">
            <h3 className="font-semibold mb-2 text-purple-400">Browser Info</h3>
            <div className="space-y-1 text-sm text-slate-400">
              <p>URL: {window.location.href}</p>
              <p>Origin: {window.location.origin}</p>
              <p>User Agent: {navigator.userAgent.slice(0, 50)}...</p>
            </div>
          </div>

          {/* Troubleshooting */}
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
            <h3 className="font-semibold mb-2 text-amber-400">Common Issues</h3>
            <ul className="text-sm space-y-1 text-slate-300">
              <li>• Make sure <code>localhost</code> is in Firebase authorized domains</li>
              <li>• Check browser console for error messages</li>
              <li>• Disable popup blockers</li>
              <li>• Try incognito/private browsing mode</li>
            </ul>
          </div>
        </div>

        <button
          onClick={() => setShowDebug(false)}
          className="w-full mt-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default AuthDebug;
