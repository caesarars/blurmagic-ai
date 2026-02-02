import React from 'react';
import { useAuth } from '../contexts/AuthContext';

interface UserProfileProps {
  onOpenAuth: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ onOpenAuth }) => {
  const { user, userData, usage, logout } = useAuth();

  if (!user) {
    return (
      <button
        onClick={onOpenAuth}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-full text-sm font-medium transition-all"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        Sign In
      </button>
    );
  }

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'pro': return 'bg-gradient-to-r from-purple-500 to-pink-500';
      case 'team': return 'bg-gradient-to-r from-amber-500 to-orange-500';
      default: return 'bg-slate-600';
    }
  };

  const getPlanLabel = (plan: string) => {
    switch (plan) {
      case 'pro': return 'PRO';
      case 'team': return 'TEAM';
      default: return 'FREE';
    }
  };

  const progressPercent = (usage.remaining / usage.limit) * 100;

  return (
    <div className="relative group">
      <button className="flex items-center gap-3 p-1.5 pr-4 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-all">
        {user.photoURL ? (
          <img 
            src={user.photoURL} 
            alt={user.displayName || 'User'} 
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-sm font-bold">
            {(user.displayName || user.email || 'U')[0].toUpperCase()}
          </div>
        )}
        <span className="text-sm font-medium hidden sm:block">{user.displayName || user.email?.split('@')[0]}</span>
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold text-white ${getPlanColor(userData?.plan || 'free')}`}>
          {getPlanLabel(userData?.plan || 'free')}
        </span>
      </button>

      {/* Dropdown Menu */}
      <div className="absolute right-0 top-full mt-2 w-72 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-3 mb-3">
            {user.photoURL ? (
              <img 
                src={user.photoURL} 
                alt={user.displayName || 'User'} 
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-lg font-bold">
                {(user.displayName || user.email || 'U')[0].toUpperCase()}
              </div>
            )}
            <div>
              <p className="font-semibold">{user.displayName || 'Anonymous'}</p>
              <p className="text-sm text-slate-400">{user.email}</p>
            </div>
          </div>

          {/* Usage Stats */}
          <div className="bg-slate-800/50 rounded-xl p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-400">Daily Usage</span>
              <span className="text-sm font-medium">
                {usage.remaining}/{usage.limit} remaining
              </span>
            </div>
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all ${
                  progressPercent > 50 ? 'bg-green-500' : 
                  progressPercent > 20 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            {usage.remaining === 0 && (
              <p className="text-xs text-red-400 mt-2">
                Daily limit reached. Upgrade for more.
              </p>
            )}
          </div>
        </div>

        <div className="p-2">
          {userData?.plan === 'free' && (
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 text-left transition-colors">
              <span className="text-lg">⭐</span>
              <div>
                <p className="font-medium text-sm">Upgrade to Pro</p>
                <p className="text-xs text-slate-400">Get 100 images/day</p>
              </div>
            </button>
          )}

          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 text-left transition-colors text-red-400"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="font-medium text-sm">Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
