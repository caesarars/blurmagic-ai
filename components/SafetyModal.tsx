import React, { useState } from 'react';
import { hasAcceptedToS, acceptToS, hasVerifiedAge, verifyAge } from '../services/safetyService';

interface SafetyModalProps {
  isOpen: boolean;
  onAccept: () => void;
}

const SafetyModal: React.FC<SafetyModalProps> = ({ isOpen, onAccept }) => {
  const [ageVerified, setAgeVerified] = useState(false);
  const [tosAccepted, setTosAccepted] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  if (!isOpen) return null;

  const handleAccept = () => {
    if (ageVerified && tosAccepted) {
      verifyAge();
      acceptToS();
      onAccept();
    }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-xl">
      <div className="relative w-full max-w-2xl bg-slate-900 rounded-3xl border border-white/10 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-white/10 bg-gradient-to-r from-red-500/10 to-amber-500/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Content Safety Agreement</h2>
              <p className="text-red-400 text-sm">Required before using BlurMagic AI</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          {/* Age Verification */}
          <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
            <h3 className="text-lg font-bold text-amber-400 mb-2 flex items-center gap-2">
              <span className="text-xl">🔞</span>
              Age Verification Required
            </h3>
            <p className="text-slate-300 mb-4">
              You must be 18 years or older to use this service. This tool is designed for 
              content creators who need to blur/censor their own content for privacy or 
              platform compliance.
            </p>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={ageVerified}
                onChange={(e) => setAgeVerified(e.target.checked)}
                className="w-5 h-5 rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-blue-500"
              />
              <span className="text-white font-medium">
                I am 18 years or older and legally allowed to view adult content
              </span>
            </label>
          </div>

          {/* Prohibited Content */}
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
            <h3 className="text-lg font-bold text-red-400 mb-3 flex items-center gap-2">
              <span className="text-xl">🚫</span>
              Strictly Prohibited Content
            </h3>
            <div className="grid md:grid-cols-2 gap-3 text-sm text-slate-300">
              <div className="flex items-start gap-2">
                <span className="text-red-400">✕</span>
                <span>Child sexual abuse material (CSAM)</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-red-400">✕</span>
                <span>Non-consensual intimate imagery</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-red-400">✕</span>
                <span>Extreme violence or gore</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-red-400">✕</span>
                <span>Bestiality or animal cruelty</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-red-400">✕</span>
                <span>Illegal activities documentation</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-red-400">✕</span>
                <span>Content you don't own/rights to</span>
              </div>
            </div>
          </div>

          {/* Terms */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-white mb-3">Terms of Service</h3>
            <div className="bg-slate-800/50 rounded-xl p-4 text-sm text-slate-400 max-h-40 overflow-y-auto space-y-2">
              <p><strong className="text-white">1. Content Ownership:</strong> You must have full rights to any content you upload. By using this service, you confirm you own the content or have explicit permission from the owner.</p>
              
              <p><strong className="text-white">2. Prohibited Use:</strong> This tool may not be used to process CSAM, non-consensual imagery, or any illegal content. Violations will be reported to authorities.</p>
              
              <p><strong className="text-white">3. Automated Scanning:</strong> Uploaded images are automatically scanned for prohibited content. Flagged content will be blocked and may be reported.</p>
              
              <p><strong className="text-white">4. No Storage:</strong> We do not store your images after processing. Images are processed in memory and immediately discarded.</p>
              
              <p><strong className="text-white">5. Legal Compliance:</strong> You agree to comply with all applicable laws regarding adult content and privacy in your jurisdiction.</p>
              
              <p><strong className="text-white">6. Account Termination:</strong> Violation of these terms will result in immediate account termination and potential legal action.</p>
            </div>
          </div>

          {/* Checkboxes */}
          <div className="space-y-3">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={tosAccepted}
                onChange={(e) => setTosAccepted(e.target.checked)}
                className="w-5 h-5 mt-0.5 rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-blue-500"
              />
              <span className="text-slate-300">
                I have read and agree to the{' '}
                <a
                  className="text-blue-400 hover:text-blue-300 underline underline-offset-2"
                  href="/terms-and-conditions"
                  target="_blank"
                  rel="noreferrer"
                >
                  Terms of Service
                </a>{' '}
                and{' '}
                <span className="text-blue-400">Content Guidelines</span>. 
                I understand that violating these terms may result in account termination 
                and legal consequences.
              </span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 bg-slate-900">
          <button
            onClick={handleAccept}
            disabled={!ageVerified || !tosAccepted}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold text-lg transition-all shadow-lg"
          >
            {ageVerified && tosAccepted ? 'I Agree - Enter Application' : 'Please Accept All Terms'}
          </button>
          <p className="text-center text-xs text-slate-500 mt-3">
            By clicking "I Agree", you confirm you are 18+ and accept full legal responsibility for your actions.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SafetyModal;
