
import React, { useState, useCallback, useRef, useEffect } from 'react';

interface ImageEditorProps {
  originalUrl: string;
  processedUrl: string | null;
  isAIProcessing: boolean;
}

const ImageEditor: React.FC<ImageEditorProps> = ({ originalUrl, processedUrl, isAIProcessing }) => {
  const [sliderPos, setSliderPos] = useState(50);
  const [isComparing, setIsComparing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percent = Math.min(Math.max((x / rect.width) * 100, 0), 100);
    setSliderPos(percent);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      handleMove(e.clientX);
    }
  }, [isDragging, handleMove]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (isDragging && e.touches[0]) {
      handleMove(e.touches[0].clientX);
    }
  }, [isDragging, handleMove]);

  const handleEnd = useCallback(() => {
    setIsDragging(false);
    setIsComparing(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleEnd);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging, handleMouseMove, handleTouchMove, handleEnd]);

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    setIsComparing(true);
    
    if ('touches' in e) {
      handleMove(e.touches[0].clientX);
    } else {
      handleMove(e.clientX);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      setSliderPos(prev => Math.max(0, prev - 5));
    } else if (e.key === 'ArrowRight') {
      setSliderPos(prev => Math.min(100, prev + 5));
    }
  };

  return (
    <div 
      className="relative w-full h-full flex items-center justify-center overflow-hidden p-4 group"
      role="region"
      aria-label="Image editor"
    >
      {isAIProcessing && (
        <div 
          className="absolute inset-0 z-40 bg-slate-900/60 backdrop-blur-sm flex flex-col items-center justify-center text-white p-6 text-center"
          role="status"
          aria-live="polite"
        >
          <div className="relative w-16 h-16 mb-4" aria-hidden="true">
            <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h3 className="text-lg font-bold">Gemini is analyzing your image</h3>
          <p className="text-slate-400 text-sm mt-2 max-w-xs">Applying context-aware blurring logic to preserve what matters.</p>
        </div>
      )}

      <div 
        ref={containerRef}
        className="relative max-h-full max-w-full shadow-2xl rounded-lg overflow-hidden flex items-center justify-center"
        onMouseDown={handleStart}
        onTouchStart={handleStart}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        role="slider"
        aria-label="Compare original and processed image"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(sliderPos)}
        aria-valuetext={`${Math.round(sliderPos)}% showing processed image`}
      >
        {/* Original Image */}
        <img 
          src={originalUrl} 
          alt="Original image" 
          className="max-h-[70vh] w-auto block select-none"
          draggable={false}
        />
        
        {/* Processed Overlay */}
        {processedUrl && (
          <div 
            className="absolute inset-0 h-full overflow-hidden transition-opacity duration-300"
            style={{ 
              clipPath: isComparing ? 'none' : `inset(0 0 0 ${sliderPos}%)`,
              opacity: isComparing ? 0 : 1
            }}
            aria-hidden={isComparing}
          >
            <img 
              src={processedUrl} 
              alt="Processed image" 
              className="h-full w-auto max-w-none select-none"
              style={{ objectFit: 'contain' }}
              draggable={false}
            />
          </div>
        )}

        {/* Comparison Slider */}
        {processedUrl && !isAIProcessing && (
          <div 
            className="absolute inset-y-0 z-30 flex items-center justify-center cursor-ew-resize group/slider"
            style={{ left: `${sliderPos}%` }}
            onMouseDown={(e) => {
              e.stopPropagation();
              setIsDragging(true);
            }}
            onTouchStart={(e) => {
              e.stopPropagation();
              setIsDragging(true);
            }}
            role="separator"
            aria-label="Drag to compare images"
            aria-orientation="vertical"
            tabIndex={0}
          >
            <div className="h-full w-0.5 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
            <div className="absolute w-8 h-8 bg-white rounded-full shadow-xl flex items-center justify-center -translate-x-0.5 border border-slate-200 group-hover/slider:scale-110 transition-transform">
              <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h8m0 0l-4-4m4 4l-4 4m0 6H8m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
          </div>
        )}

        {/* Info badges */}
        <div className="absolute top-4 left-4 z-20 flex gap-2">
          <span className="px-2 py-1 bg-black/50 text-white text-[10px] font-bold uppercase tracking-wider rounded backdrop-blur">
            Before
          </span>
        </div>
        <div className="absolute top-4 right-4 z-20 flex gap-2">
          <span className="px-2 py-1 bg-blue-500/80 text-white text-[10px] font-bold uppercase tracking-wider rounded backdrop-blur">
            After
          </span>
        </div>
      </div>

      {/* Quick Compare Button (Mobile) */}
      <button 
        onMouseDown={() => setIsComparing(true)}
        onMouseUp={() => setIsComparing(false)}
        onMouseLeave={() => setIsComparing(false)}
        onTouchStart={() => setIsComparing(true)}
        onTouchEnd={() => setIsComparing(false)}
        className="absolute bottom-4 right-4 z-50 md:hidden bg-slate-800 p-3 rounded-full shadow-lg border border-white/10 active:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Hold to compare with original"
      >
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      </button>

      {/* Instructions */}
      <div className="absolute bottom-4 left-4 z-20 hidden md:block">
        <p className="text-[10px] text-slate-500 bg-slate-900/80 px-3 py-1.5 rounded-full backdrop-blur">
          Drag slider or use ← → arrow keys to compare
        </p>
      </div>
    </div>
  );
};

export default ImageEditor;
