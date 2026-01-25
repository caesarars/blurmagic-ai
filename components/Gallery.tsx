
import React from 'react';
import { ImageState } from '../types';

interface GalleryProps {
  images: ImageState[];
  activeId: string;
  onSelect: (index: number) => void;
  onRemove: (id: string) => void;
}

const Gallery: React.FC<GalleryProps> = ({ images, activeId, onSelect, onRemove }) => {
  return (
    <div className="glass rounded-2xl p-3 flex gap-3 overflow-x-auto h-24 items-center scrollbar-hide">
      {images.map((img, index) => (
        <div 
          key={img.id}
          className={`relative h-16 min-w-16 rounded-lg overflow-hidden border-2 cursor-pointer transition-all shrink-0 group ${
            activeId === img.id ? 'border-blue-500 scale-105 shadow-lg shadow-blue-500/20' : 'border-white/10 grayscale hover:grayscale-0 hover:border-white/30'
          }`}
          onClick={() => onSelect(index)}
        >
          <img 
            src={img.processedUrl || img.url} 
            className="w-full h-full object-cover" 
            alt={`Batch item ${index}`} 
          />
          
          {img.isAIProcessing && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          <button 
            onClick={(e) => { e.stopPropagation(); onRemove(img.id); }}
            className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-lg"
          >
            <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/40">
            <div 
              className="h-full bg-blue-500 transition-all duration-300" 
              style={{ width: img.isAIProcessing ? '40%' : '100%' }}
            />
          </div>
        </div>
      ))}
      
      {/* Add Empty State / Placeholder for bulk context */}
      {images.length < 3 && (
        <div className="h-16 min-w-16 rounded-lg border-2 border-dashed border-white/5 flex items-center justify-center text-slate-600 italic text-[10px]">
          +
        </div>
      )}
    </div>
  );
};

export default Gallery;
