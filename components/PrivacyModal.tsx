
import React from 'react';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PrivacyModal: React.FC<PrivacyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative glass w-full max-w-2xl max-h-[80vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-300">
        <div className="p-6 border-b border-white/10 flex items-center justify-between shrink-0 bg-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white">Privacy & Data Terms</h2>
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

        <div className="p-8 overflow-y-auto text-slate-300 space-y-6 text-sm leading-relaxed">
          <section>
            <h3 className="text-white font-semibold text-base mb-2 uppercase tracking-wider text-[11px]">Privacy Commitment</h3>
            <p>
              BlurMagic AI is built with a "Privacy First" philosophy. We understand that your photos are personal, 
              and we have designed this suite to minimize data exposure and prioritize on-device processing.
            </p>
          </section>

          <section className="bg-blue-500/5 p-4 rounded-xl border border-blue-500/10">
            <h3 className="text-blue-400 font-semibold text-base mb-2 uppercase tracking-wider text-[11px]">1. Local Processing</h3>
            <p>
              Manual blurs (intensity slider) and Watermarking effects are processed <strong>entirely within your browser</strong> 
              using HTML5 Canvas technology. No image data is sent to our servers for these operations. Your pixels stay on your machine.
            </p>
          </section>

          <section className="bg-amber-500/5 p-4 rounded-xl border border-amber-500/10">
            <h3 className="text-amber-400 font-semibold text-base mb-2 uppercase tracking-wider text-[11px]">2. AI Smart Features</h3>
            <p>
              Features labeled as "AI Smart Actions" (Face/Text Detection) utilize the Google Gemini API. When you use these features:
            </p>
            <ul className="list-disc ml-5 mt-2 space-y-1 text-slate-400">
              <li>Images are temporarily transmitted to Google's secure servers for analysis.</li>
              <li>Data is processed in real-time and returned to you immediately.</li>
              <li>We do not store your images on any persistent database.</li>
              <li>Your data is not used to train our models or shared with third parties for advertising.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-white font-semibold text-base mb-2 uppercase tracking-wider text-[11px]">3. Data Retention</h3>
            <p>
              We do not track you. We do not use cookies for tracking, nor do we store any history of the images you process 
              after you close the browser tab. All session data is cleared upon refresh or exit.
            </p>
          </section>

          <section className="pt-4 border-t border-white/5">
            <p className="text-slate-500 italic">
              By using BlurMagic AI, you acknowledge that while we take every precaution to secure your data, AI processing 
              requires transient internet transmission. Always ensure you have the rights to the images you upload.
            </p>
          </section>
        </div>

        <div className="p-6 border-t border-white/10 bg-white/5 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-lg active:scale-95"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrivacyModal;
