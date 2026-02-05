import React, { useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface UserProfileProps {
  onOpenAuth: () => void;
}

type DepositInfo = {
  address: string;
  chain: string;
  token: string;
  priceUsdt: number;
  credits: number;
};

const UserProfile: React.FC<UserProfileProps> = ({ onOpenAuth }) => {
  const { user, userData, usage, logout, refreshUsage } = useAuth();

  const apiBase = (import.meta as any)?.env?.VITE_API_BASE_URL || '';

  const [deposit, setDeposit] = useState<DepositInfo | null>(null);
  const [loadingPay, setLoadingPay] = useState(false);
  const [txid, setTxid] = useState('');

  const priceLabel = useMemo(() => {
    const p = deposit?.priceUsdt ?? 10;
    return `$${p} / month`;
  }, [deposit?.priceUsdt]);

  const handleGetDeposit = async () => {
    if (!user) return;
    setLoadingPay(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch(`${apiBase}/api/tron-deposit`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const text = await res.text();
      const payload = (() => {
        try {
          return text ? JSON.parse(text) : {};
        } catch {
          return { error: 'Non-JSON response', raw: text.slice(0, 200) };
        }
      })();
      if (!res.ok) throw new Error(payload?.error || `Failed (${res.status})`);
      setDeposit(payload as DepositInfo);
    } finally {
      setLoadingPay(false);
    }
  };

  const handleCheckPayment = async () => {
    if (!user) return;
    setLoadingPay(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch(`${apiBase}/api/tron-claim`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ txid: txid.trim() || undefined }),
      });
      const text = await res.text();
      const payload = (() => {
        try {
          return text ? JSON.parse(text) : {};
        } catch {
          return { error: 'Non-JSON response', raw: text.slice(0, 200) };
        }
      })();
      if (!res.ok) throw new Error(payload?.error || `Failed (${res.status})`);

      if (payload?.paid) {
        await refreshUsage();
        alert('Payment confirmed ✅ Pro activated + 1000 credits');
      } else {
        alert('Belum kebaca payment-nya. Coba lagi 1-2 menit ya.');
      }
    } finally {
      setLoadingPay(false);
    }
  };

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
            <div className="px-3 py-2 rounded-xl border border-white/10 bg-slate-800/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Upgrade to Pro</p>
                  <p className="text-xs text-slate-400">Pay with USDT (TRC20) — {priceLabel} • 1000 credits</p>
                </div>
                <button
                  onClick={() => handleGetDeposit().catch((e) => alert(e?.message || 'Failed'))}
                  disabled={loadingPay}
                  className="ml-3 rounded-lg bg-purple-600 px-3 py-2 text-xs font-semibold hover:bg-purple-500 disabled:opacity-60"
                >
                  {loadingPay ? '...' : deposit ? 'Refresh' : 'Get address'}
                </button>
              </div>

              {deposit && (
                <div className="mt-3">
                  <div className="text-xs text-slate-300">Send exactly <b>{deposit.priceUsdt} USDT</b> to:</div>
                  <div className="mt-1 flex items-center gap-2">
                    <code className="flex-1 rounded-lg bg-slate-950/60 px-2 py-2 text-[11px] text-slate-200 break-all">
                      {deposit.address}
                    </code>
                    <button
                      onClick={() => navigator.clipboard.writeText(deposit.address)}
                      className="rounded-lg bg-slate-700 px-2 py-2 text-[11px] font-semibold hover:bg-slate-600"
                    >
                      Copy
                    </button>
                  </div>

                  <div className="mt-2 grid grid-cols-1 gap-2">
                    <input
                      value={txid}
                      onChange={(e) => setTxid(e.target.value)}
                      placeholder="Optional: paste TXID (trx hash)"
                      className="w-full rounded-lg border border-white/10 bg-slate-950/60 px-2 py-2 text-[12px]"
                    />
                    <button
                      onClick={() => handleCheckPayment().catch((e) => alert(e?.message || 'Failed'))}
                      disabled={loadingPay}
                      className="w-full rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold hover:bg-emerald-500 disabled:opacity-60"
                    >
                      {loadingPay ? 'Checking…' : "I've paid, check now"}
                    </button>
                    <div className="text-[11px] text-slate-400">
                      Note: confirmation can take a bit. If it says not found, wait 1–2 minutes and retry.
                    </div>
                  </div>
                </div>
              )}
            </div>
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
