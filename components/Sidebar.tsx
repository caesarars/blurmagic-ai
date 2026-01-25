
import React from 'react';
import { BlurSettings, ImageState, WatermarkPosition, CompliancePreset } from '../types';

interface SidebarProps {
  imageCount: number;
  activeImage: ImageState | null;
  settings: BlurSettings;
  onSettingsChange: React.Dispatch<React.SetStateAction<BlurSettings>>;
  onAIAction: (prompt: string) => void;
  onBulkAIAction: (prompt: string) => void;
  onNuclearCensor?: () => void;
  onBulkNuclearCensor?: () => void;
  onCompliancePreset?: (preset: CompliancePreset) => void;
  onBulkCompliancePreset?: (preset: CompliancePreset) => void;
  onBulkIntensity: () => void;
  onDownloadActive: () => void;
  onDownloadAll: () => void;
  isDownloadingBatch?: boolean;
  onReset: () => void;
  onAddMore: () => void;
  onInspectMetadata?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  imageCount,
  activeImage, 
  settings, 
  onSettingsChange, 
  onAIAction, 
  onBulkAIAction,
  onNuclearCensor,
  onBulkNuclearCensor,
  onCompliancePreset,
  onBulkCompliancePreset,
  onBulkIntensity,
  onDownloadActive,
  onDownloadAll,
  isDownloadingBatch,
  onReset,
  onAddMore,
  onInspectMetadata
}) => {
  const hasImages = imageCount > 0;
  const isAIProcessing = activeImage?.isAIProcessing;
  const isAIEdited = activeImage?.isAIEdited;
  const isReady = hasImages && !isAIProcessing;

  const aiOptions = [
    { 
      id: 'faces', 
      label: 'Anonymize Faces', 
      prompt: 'Detect all human facial features and apply a high-opacity privacy blur to anonymize the individuals.' 
    },
    { 
      id: 'loc_anonymize', 
      label: 'Location Anonymizer', 
      prompt: 'Identify the main subjects and perfectly preserve them. Then, apply a heavy, unrecoverable artistic blur to the entire background to obfuscate the location, hiding windows, furniture, room details, and outdoor scenery for complete anonymity.' 
    },
    { 
      id: 'text', 
      label: 'Redact Sensitive Text', 
      prompt: 'Identify and redact all readable text, characters, license plates, and sensitive documents using a heavy digital blur filter for privacy protection.' 
    },
    { 
        id: 'bg', 
        label: 'Subject Isolation', 
        prompt: 'Apply a professional bokeh depth-of-field blur to the background regions to isolate the subject while softly obscuring context.' 
    },
  ];

  return (
    <div className="w-full md:w-80 flex flex-col gap-4 overflow-y-auto pr-1 shrink-0 pb-10">
      {/* Upload More */}
      {hasImages && (
        <button 
          onClick={onAddMore}
          className="w-full py-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl text-xs font-bold hover:bg-blue-500/20 transition-all"
        >
          + Add More Images
        </button>
      )}

      {/* Security & Metadata Wipe Section */}
      <section className="glass rounded-2xl p-5 border-l-2 border-l-red-500 bg-red-500/5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <h3 className="text-[10px] font-bold text-red-400 uppercase tracking-widest">Privacy Shield</h3>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer" 
              checked={settings.wipeMetadata} 
              onChange={() => onSettingsChange(s => ({ ...s, wipeMetadata: !s.wipeMetadata }))}
            />
            <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-red-600"></div>
          </label>
        </div>
        <div className="space-y-3">
          <p className="text-[11px] font-bold text-slate-200">Nuclear Metadata Wiper</p>
          <div className="flex flex-col gap-2">
            {hasImages && (
              <button 
                onClick={onInspectMetadata}
                className="w-full text-center py-1.5 bg-slate-800 border border-white/5 rounded-lg text-[10px] font-bold text-slate-300 hover:bg-slate-700 transition-all flex items-center justify-center gap-2"
              >
                Check Hidden Metadata
              </button>
            )}
            {settings.wipeMetadata && (
               <div className="flex items-center gap-1.5 bg-red-500/20 text-red-400 px-2 py-1.5 rounded-md text-[9px] font-bold">
                 <span>🛡️ Metadata Stripped: GPS & Device info removed</span>
               </div>
            )}
          </div>
        </div>
      </section>

      {/* Compliance Presets */}
      <section className="glass rounded-2xl p-5 border-l-2 border-l-amber-500 bg-amber-500/5">
        <h3 className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-4">Platform Compliance</h3>
        <div className="grid grid-cols-1 gap-2">
          <div className="flex gap-1.5">
            <button
              disabled={!isReady}
              onClick={() => onCompliancePreset?.('twitter_safe')}
              className="flex-1 flex items-center justify-between px-3 py-2 bg-slate-800/50 border border-amber-500/20 rounded-xl text-[11px] font-bold text-white hover:bg-amber-500/10 hover:border-amber-500 transition-all disabled:opacity-30"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">📱</span>
                <div className="text-left">
                  <p>Social Compliance</p>
                  <p className="text-[8px] text-amber-500/70 font-medium">Twitter / IG (20px Pixel)</p>
                </div>
              </div>
            </button>
            <button 
              disabled={!hasImages}
              onClick={() => onBulkCompliancePreset?.('twitter_safe')}
              className="px-2 bg-amber-500/20 border border-amber-500/30 rounded-xl text-[9px] font-bold text-amber-400 hover:bg-amber-600 hover:text-white transition-all disabled:opacity-30"
            >
              ALL
            </button>
          </div>

          <div className="flex gap-1.5">
            <button
              disabled={!isReady}
              onClick={() => onCompliancePreset?.('member_teaser')}
              className="flex-1 flex items-center justify-between px-3 py-2 bg-slate-800/50 border border-amber-500/20 rounded-xl text-[11px] font-bold text-white hover:bg-amber-500/10 hover:border-amber-500 transition-all disabled:opacity-30"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">💎</span>
                <div className="text-left">
                  <p>Member Teaser</p>
                  <p className="text-[8px] text-amber-500/70 font-medium">Curiosity Blur (Gaussian)</p>
                </div>
              </div>
            </button>
            <button 
              disabled={!hasImages}
              onClick={() => onBulkCompliancePreset?.('member_teaser')}
              className="px-2 bg-amber-500/20 border border-amber-500/30 rounded-xl text-[9px] font-bold text-amber-400 hover:bg-amber-600 hover:text-white transition-all disabled:opacity-30"
            >
              ALL
            </button>
          </div>

          <button
            disabled={!isReady}
            onClick={() => onCompliancePreset?.('clean')}
            className="flex items-center justify-center px-3 py-1.5 bg-slate-900 border border-white/5 rounded-lg text-[10px] font-bold text-slate-400 hover:text-white transition-all"
          >
            ✨ Restore Areas (Clean)
          </button>
        </div>
      </section>

      {/* AI Active Status */}
      {isAIEdited && (
        <div className="bg-blue-600/20 border border-blue-500/30 rounded-2xl p-4 flex flex-col gap-2">
           <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase">
             AI Edit Active
           </div>
           <p className="text-[10px] text-slate-400">Manual effects disabled for AI preservation.</p>
           <button onClick={onReset} className="text-[10px] bg-blue-600 hover:bg-blue-500 text-white py-1.5 rounded-lg font-bold">
             Clear AI Edit
           </button>
        </div>
      )}

      {/* Manual Effect Controls */}
      <section className={`glass rounded-2xl p-5 border-l-2 border-l-blue-500 transition-opacity ${isAIEdited ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
        <h3 className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-6">Manual Effect</h3>
        <div className="space-y-6">
          <div>
            <label className="text-xs font-medium text-slate-200 block mb-2">Effect Type</label>
            <div className="flex bg-slate-800/50 p-1 rounded-lg border border-white/5">
              <button disabled={!hasImages || isAIEdited} onClick={() => onSettingsChange(s => ({ ...s, type: 'gaussian' }))} className={`flex-1 py-1.5 text-[10px] font-bold rounded-md ${settings.type === 'gaussian' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400'}`}>BLUR</button>
              <button disabled={!hasImages || isAIEdited} onClick={() => onSettingsChange(s => ({ ...s, type: 'pixelate' }))} className={`flex-1 py-1.5 text-[10px] font-bold rounded-md ${settings.type === 'pixelate' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400'}`}>PIXELATE</button>
            </div>
          </div>
          <div>
            <div className="flex justify-between items-center mb-2 text-xs font-medium text-slate-200">
              <label>Effect Intensity</label>
              <span className="text-[10px] font-mono text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded">{settings.intensity}{settings.type === 'pixelate' ? '%' : 'px'}</span>
            </div>
            <input type="range" min="0" max="100" value={settings.intensity} disabled={!hasImages || isAIEdited} onChange={(e) => onSettingsChange(s => ({ ...s, intensity: parseInt(e.target.value) }))} className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500" />
          </div>
        </div>
      </section>

      {/* AI Smart Actions */}
      <section className="glass rounded-2xl p-5 border-l-2 border-l-blue-500">
        <h3 className="text-[10px] font-bold text-white uppercase tracking-widest mb-4">Smart Recognition</h3>
        <div className="space-y-1.5">
          {aiOptions.map((action) => (
            <div key={action.id} className="group relative">
              <button
                disabled={!isReady}
                onClick={() => onAIAction(action.prompt)}
                className={`w-full text-left px-3 py-2.5 rounded-xl bg-slate-800/40 border border-white/5 hover:border-blue-500 transition-all text-[11px] font-medium text-slate-300 flex items-center justify-between disabled:opacity-30 ${action.id === 'loc_anonymize' ? 'border-cyan-500/20 bg-cyan-500/5' : ''}`}
              >
                <div className="flex items-center gap-2">
                   {action.id === 'loc_anonymize' && <span className="text-cyan-400">🛡️</span>}
                   {action.label}
                </div>
                <span 
                  onClick={(e) => { e.stopPropagation(); onBulkAIAction(action.prompt); }}
                  className="text-[9px] bg-blue-600/20 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/30 hover:bg-blue-600 hover:text-white cursor-pointer"
                >
                  ALL
                </span>
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Footer Actions */}
      <div className="mt-auto flex flex-col gap-2 pt-4">
        <button
            onClick={onDownloadActive}
            disabled={!activeImage || isAIProcessing || isDownloadingBatch}
            className="w-full bg-blue-600 text-white text-xs font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-blue-500 disabled:opacity-30 transition-all active:scale-[0.98]"
        >
            Download Image
        </button>
        {imageCount > 1 && (
          <button
              onClick={onDownloadAll}
              disabled={isDownloadingBatch}
              className="w-full bg-white text-slate-900 text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-100 disabled:opacity-30 transition-all active:scale-[0.98]"
          >
              {isDownloadingBatch ? (
                <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
              )}
              {isDownloadingBatch ? 'Processing...' : `Download ZIP (${imageCount})`}
          </button>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
