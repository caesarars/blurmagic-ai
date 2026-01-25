
import React from 'react';
import { ImageState } from '../types';

interface MetadataInspectorProps {
  isOpen: boolean;
  onClose: () => void;
  activeImage: ImageState | null;
}

const MetadataInspector: React.FC<MetadataInspectorProps> = ({ isOpen, onClose, activeImage }) => {
  if (!isOpen) return null;

  const metadata = activeImage?.metadata;
  const hasMetadata = metadata && Object.keys(metadata).length > 0;

  const formatValue = (key: string, value: any) => {
    if (value instanceof Date) return value.toLocaleString();
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      <div className="relative glass w-full max-w-md rounded-3xl overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-300">
        <div className="p-5 border-b border-white/10 flex items-center justify-between shrink-0 bg-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-white">Metadata Inspector</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeImage ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4 mb-6">
                <img src={activeImage.url} className="w-20 h-20 object-cover rounded-xl border border-white/10" alt="Preview" />
                <div>
                  <h3 className="text-sm font-bold text-white truncate max-w-[200px]">{activeImage.file.name}</h3>
                  <p className="text-[10px] text-slate-500">{(activeImage.file.size / 1024).toFixed(1)} KB • {activeImage.width}x{activeImage.height}px</p>
                </div>
              </div>

              {hasMetadata ? (
                <div className="space-y-1.5">
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Detected EXIF Data</h4>
                  {Object.entries(metadata).map(([key, value]) => (
                    value !== undefined && (
                      <div key={key} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                        <span className="text-[11px] text-slate-400 font-medium">{key}</span>
                        <span className="text-[11px] text-white font-mono bg-white/5 px-2 py-0.5 rounded text-right max-w-[60%] truncate">
                          {formatValue(key, value)}
                        </span>
                      </div>
                    )
                  ))}
                  
                  {(metadata.latitude || metadata.longitude) && (
                    <div className="mt-4 p-3 bg-red-500/10 rounded-xl border border-red-500/20">
                      <div className="flex items-center gap-2 text-red-400 mb-1">
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-[10px] font-bold uppercase">Sensitive: GPS Found</span>
                      </div>
                      <p className="text-[10px] text-red-300/70">Precise location coordinates are embedded in this image. Nuclear Wipe recommended.</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-12 flex flex-col items-center justify-center text-center opacity-50">
                  <svg className="w-12 h-12 text-slate-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm font-medium text-slate-400">Clean: No EXIF metadata detected</p>
                  <p className="text-[10px] text-slate-600 mt-1">This image may have already been stripped or lacks metadata.</p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-center text-slate-500 text-sm">No active image selected.</p>
          )}
        </div>

        <div className="p-5 border-t border-white/10 bg-white/5 flex justify-center">
          <button 
            onClick={onClose}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};

export default MetadataInspector;
