import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthView = 'login' | 'signup' | 'forgot';

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [view, setView] = useState<AuthView>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { signInWithGoogle, signInWithTwitter, signInWithEmail, signUpWithEmail, resetPassword } = useAuth();
  const { addToast } = useToast();

  if (!isOpen) return null;

  const handleSocialLogin = async (provider: 'google' | 'twitter') => {
    setIsLoading(true);
    console.log(`🔘 ${provider} login button clicked`);
    
    try {
      let result;
      if (provider === 'google') {
        result = await signInWithGoogle();
      } else {
        result = await signInWithTwitter();
      }
      
      console.log('📊 Login result:', result);
      
      if (result.error) {
        console.error('❌ Login error:', result.error);
        addToast(result.error, 'error');
      } else if (result.user) {
        console.log('✅ Login successful, closing modal');
        addToast(`Successfully signed in with ${provider}!`, 'success');
        onClose();
      }
    } catch (error: any) {
      console.error('❌ Unexpected error:', error);
      addToast(error.message || `Failed to sign in with ${provider}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (view === 'login') {
        await signInWithEmail(email, password);
        addToast('Successfully signed in!', 'success');
        onClose();
      } else if (view === 'signup') {
        await signUpWithEmail(email, password, displayName);
        addToast('Account created successfully!', 'success');
        onClose();
      } else if (view === 'forgot') {
        await resetPassword(email);
        addToast('Password reset email sent!', 'success');
        setView('login');
      }
    } catch (error: any) {
      addToast(error.message || 'An error occurred', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setDisplayName('');
  };

  const switchView = (newView: AuthView) => {
    setView(newView);
    resetForm();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-md bg-slate-900 rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-cyan-400 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  {view === 'login' && 'Welcome Back'}
                  {view === 'signup' && 'Create Free Account'}
                  {view === 'forgot' && 'Reset Password'}
                </h2>
                <p className="text-sm text-slate-400">
                  {view === 'login' && 'Sign in to continue blurring'}
                  {view === 'signup' && 'Get 5 free images every day'}
                  {view === 'forgot' && 'Enter your email to reset'}
                </p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Free Tier Banner - Show on signup */}
          {view === 'signup' && (
            <div className="mb-6 p-4 bg-gradient-to-r from-blue-600/20 to-cyan-500/20 border border-blue-500/30 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="text-3xl">🎁</div>
                <div>
                  <h3 className="font-bold text-white">Free Tier Included</h3>
                  <p className="text-sm text-slate-300">
                    <span className="text-blue-400 font-bold">5 images/day</span> at no cost. No credit card required.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Social Login Buttons */}
          {view !== 'forgot' && (
            <div className="space-y-3 mb-6">
              <button
                onClick={() => handleSocialLogin('google')}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white text-slate-900 rounded-xl font-medium hover:bg-slate-100 transition-all disabled:opacity-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>
              
              <button
                onClick={() => handleSocialLogin('twitter')}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-slate-800 text-white rounded-xl font-medium hover:bg-slate-700 transition-all disabled:opacity-50"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                Continue with X
              </button>
            </div>
          )}

          {/* Divider */}
          {view !== 'forgot' && (
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-slate-900 text-slate-400">Or continue with email</span>
              </div>
            </div>
          )}

          {/* Email Form */}
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            {view === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="John Doe"
                  required
                />
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="you@example.com"
                required
              />
            </div>

            {view !== 'forgot' && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white rounded-xl font-semibold transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                view === 'login' ? 'Sign In' : 
                view === 'signup' ? 'Create Account' : 
                'Send Reset Link'
              )}
            </button>
          </form>

          {/* Footer Links */}
          <div className="mt-6 text-center text-sm">
            {view === 'login' && (
              <>
                <p className="text-slate-400 mb-2">
                  Don't have an account?{' '}
                  <button 
                    onClick={() => switchView('signup')}
                    className="text-blue-400 hover:text-blue-300 font-medium"
                  >
                    Sign up
                  </button>
                </p>
                <button 
                  onClick={() => switchView('forgot')}
                  className="text-slate-500 hover:text-slate-400"
                >
                  Forgot password?
                </button>
              </>
            )}
            
            {view === 'signup' && (
              <p className="text-slate-400">
                Already have an account?{' '}
                <button 
                  onClick={() => switchView('login')}
                  className="text-blue-400 hover:text-blue-300 font-medium"
                >
                  Sign in
                </button>
              </p>
            )}
            
            {view === 'forgot' && (
              <button 
                onClick={() => switchView('login')}
                className="text-blue-400 hover:text-blue-300 font-medium"
              >
                Back to sign in
              </button>
            )}
          </div>

          {/* Terms */}
          <p className="mt-6 text-xs text-center text-slate-500">
            By continuing, you agree to our{' '}
            <a href="#" className="text-slate-400 hover:text-white">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="text-slate-400 hover:text-white">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
