
import React, { useState } from 'react';

interface ImageEditorProps {
  originalUrl: string;
  processedUrl: string | null;
  isAIProcessing: boolean;
}

const ImageEditor: React.FC<ImageEditorProps> = ({ originalUrl, processedUrl, isAIProcessing }) => {
  const [sliderPos, setSliderPos] = useState(50);
  const [isComparing, setIsComparing] = useState(false);

  const handleMouseDown = () => setIsComparing(true);
  const handleMouseUp = () => setIsComparing(false);

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden p-4 group">
      {isAIProcessing && (
        <div className="absolute inset-0 z-40 bg-slate-900/60 backdrop-blur-sm flex flex-col items-center justify-center text-white p-6 text-center">
          <div className="relative w-16 h-16 mb-4">
            <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h3 className="text-lg font-bold">Gemini is analyzing your image</h3>
          <p className="text-slate-400 text-sm mt-2 max-w-xs">Applying context-aware blurring logic to preserve what matters.</p>
        </div>
      )}

      <div className="relative max-h-full max-w-full shadow-2xl rounded-lg overflow-hidden flex items-center justify-center">
        {/* Original */}
        <img 
          src={originalUrl} 
          alt="Original" 
          className="max-h-[70vh] w-auto block select-none"
        />
        
        {/* Processed Overlay */}
        {processedUrl && (
          <div 
            className="absolute inset-0 h-full overflow-hidden transition-opacity duration-300"
            style={{ 
                clipPath: isComparing ? 'none' : `inset(0 0 0 ${sliderPos}%)`,
                opacity: isComparing ? 0 : 1
            }}
          >
            <img 
              src={processedUrl} 
              alt="Processed" 
              className="h-full w-auto max-w-none select-none"
              style={{ objectFit: 'contain' }}
            />
          </div>
        )}

        {/* Comparison Slider */}
        {processedUrl && !isAIProcessing && (
            <div 
                className="absolute inset-y-0 z-30 flex items-center justify-center cursor-ew-resize group/slider"
                style={{ left: `${sliderPos}%` }}
                onMouseDown={(e) => {
                    // Capture the reference to the parent container immediately
                    const container = e.currentTarget.parentElement;
                    if (!container) return;

                    const handleMove = (moveEvent: MouseEvent) => {
                        const rect = container.getBoundingClientRect();
                        const x = moveEvent.clientX - rect.left;
                        const percent = Math.min(Math.max((x / rect.width) * 100, 0), 100);
                        setSliderPos(percent);
                    };
                    const handleUp = () => {
                        window.removeEventListener('mousemove', handleMove);
                        window.removeEventListener('mouseup', handleUp);
                    };
                    window.addEventListener('mousemove', handleMove);
                    window.addEventListener('mouseup', handleUp);
                }}
            >
                <div className="h-full w-0.5 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                <div className="absolute w-8 h-8 bg-white rounded-full shadow-xl flex items-center justify-center -translate-x-0.5 border border-slate-200 group-hover/slider:scale-110 transition-transform">
                   <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h8m0 0l-4-4m4 4l-4 4m0 6H8m0 0l4 4m-4-4l4-4" />
                   </svg>
                </div>
            </div>
        )}

        {/* Info badges */}
        <div className="absolute top-4 left-4 z-20 flex gap-2">
            <span className="px-2 py-1 bg-black/50 text-white text-[10px] font-bold uppercase tracking-wider rounded backdrop-blur">Before</span>
        </div>
        <div className="absolute top-4 right-4 z-20 flex gap-2">
            <span className="px-2 py-1 bg-blue-500/80 text-white text-[10px] font-bold uppercase tracking-wider rounded backdrop-blur">After</span>
        </div>
      </div>

      {/* Quick Compare Button (Mobile Friendly) */}
      <button 
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchEnd={handleMouseUp}
        className="absolute bottom-4 right-4 z-50 md:hidden bg-slate-800 p-3 rounded-full shadow-lg border border-white/10 active:bg-blue-600"
      >
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      </button>
    </div>
  );
};

export default ImageEditor;
