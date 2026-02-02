
import React from 'react';
import UserProfile from './UserProfile';

interface HeaderProps {
  onOpenPrivacy: () => void;
  onOpenAuth: () => void;
}

const Header: React.FC<HeaderProps> = ({ onOpenPrivacy, onOpenAuth }) => {
  return (
    <header className="h-16 flex items-center justify-between px-6 glass sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-gradient-to-tr from-blue-600 to-cyan-400 rounded-lg shadow-inner flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
          </svg>
        </div>
        <h1 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
          BlurMagic <span className="text-blue-500">AI</span>
        </h1>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
          <button 
            onClick={onOpenPrivacy}
            className="hover:text-white transition-colors"
          >
            How it works
          </button>
          <button 
            onClick={onOpenPrivacy}
            className="hover:text-white transition-colors flex items-center gap-1.5"
          >
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Privacy First
          </button>
        </div>
        
        <UserProfile onOpenAuth={onOpenAuth} />
      </div>
    </header>
  );
};

export default Header;
