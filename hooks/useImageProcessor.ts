
import { useState, useCallback, useRef, useEffect } from 'react';
import type { ImageState, BlurSettings, BoundingBox, CompliancePreset } from '../types';

interface UseImageProcessorReturn {
  images: ImageState[];
  activeImageIndex: number;
  activeImage: ImageState | null;
  isProcessing: boolean;
  setIsProcessing: React.Dispatch<React.SetStateAction<boolean>>;
  setImages: React.Dispatch<React.SetStateAction<ImageState[]>>;
  setActiveImageIndex: React.Dispatch<React.SetStateAction<number>>;
  addImages: (files: File[]) => Promise<void>;
  removeImage: (id: string) => void;
  updateImage: (id: string, updates: Partial<ImageState>) => void;
  processImage: (image: ImageState, settings: BlurSettings) => Promise<string>;
  setActiveById: (id: string) => void;
}

export const useImageProcessor = (): UseImageProcessorReturn => {
  const [images, setImages] = useState<ImageState[]>([]);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const processingCache = useRef<Map<string, string>>(new Map());

  const activeImage = images[activeImageIndex] || null;

  const generateId = () => Math.random().toString(36).substring(2, 11);

  const loadImage = (file: File): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = url;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const parseMetadata = async (file: File) => {
    try {
      const exifr = (await import('exifr')).default;
      return await exifr.parse(file, {
        pick: ['Make', 'Model', 'DateTimeOriginal', 'Software', 'ExifImageWidth', 'ExifImageHeight'],
        gps: true
      });
    } catch (e) {
      console.warn("Failed to parse metadata:", e);
      return null;
    }
  };

  const addImages = useCallback(async (files: File[]) => {
    setIsProcessing(true);
    
    try {
      const newImages: ImageState[] = [];
      
      for (const file of files) {
        if (!file.type.startsWith('image/')) continue;
        
        const [img, metadata] = await Promise.all([
          loadImage(file),
          parseMetadata(file)
        ]);

        const reader = new FileReader();
        const url = await new Promise<string>((resolve) => {
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(file);
        });

        newImages.push({
          id: generateId(),
          file,
          url,
          width: img.width,
          height: img.height,
          originalAspectRatio: img.width / img.height,
          processedUrl: url,
          isAIProcessing: false,
          isAIEdited: false,
          manualIntensity: 0,
          metadata
        });
      }

      setImages(prev => [...prev, ...newImages]);
    } catch (error) {
      console.error('Error adding images:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const removeImage = useCallback((id: string) => {
    setImages(prev => {
      const newImages = prev.filter(img => img.id !== id);
      if (activeImageIndex >= newImages.length) {
        setActiveImageIndex(Math.max(0, newImages.length - 1));
      }
      return newImages;
    });
    processingCache.current.delete(id);
  }, [activeImageIndex]);

  const updateImage = useCallback((id: string, updates: Partial<ImageState>) => {
    setImages(prev => prev.map(img => 
      img.id === id ? { ...img, ...updates } : img
    ));
  }, []);

  const setActiveById = useCallback((id: string) => {
    const index = images.findIndex(img => img.id === id);
    if (index !== -1) {
      setActiveImageIndex(index);
    }
  }, [images]);

  const processImage = useCallback(async (image: ImageState, settings: BlurSettings): Promise<string> => {
    const cacheKey = `${image.id}-${settings.intensity}-${settings.focusRadius}-${settings.type}-${settings.watermarkText}-${settings.watermarkPosition}`;
    
    if (processingCache.current.has(cacheKey)) {
      return processingCache.current.get(cacheKey)!;
    }

    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        if (settings.intensity > 0) {
          const effectCanvas = document.createElement('canvas');
          effectCanvas.width = canvas.width;
          effectCanvas.height = canvas.height;
          const eCtx = effectCanvas.getContext('2d');
          
          if (eCtx) {
            if (settings.type === 'pixelate') {
              const scale = Math.max(0.01, 1 - (settings.intensity / 100));
              const tempCanvas = document.createElement('canvas');
              const tempCtx = tempCanvas.getContext('2d');
              if (tempCtx) {
                const w = Math.max(1, Math.floor(canvas.width * scale));
                const h = Math.max(1, Math.floor(canvas.height * scale));
                tempCanvas.width = w;
                tempCanvas.height = h;
                tempCtx.imageSmoothingEnabled = false;
                tempCtx.drawImage(img, 0, 0, w, h);
                eCtx.imageSmoothingEnabled = false;
                eCtx.drawImage(tempCanvas, 0, 0, w, h, 0, 0, canvas.width, canvas.height);
              }
            } else {
              eCtx.filter = `blur(${settings.intensity}px)`;
              eCtx.drawImage(img, 0, 0);
            }

            if (settings.focusRadius > 0) {
              const centerX = canvas.width / 2;
              const centerY = canvas.height / 2;
              const maxDim = Math.max(canvas.width, canvas.height);
              const sharpRadius = (settings.focusRadius / 100) * (maxDim / 0.8);
              const gradient = ctx.createRadialGradient(
                centerX, centerY, sharpRadius * 0.5, 
                centerX, centerY, sharpRadius
              );
              gradient.addColorStop(0, 'rgba(0,0,0,0)');
              gradient.addColorStop(1, 'rgba(0,0,0,1)');
              
              const maskCanvas = document.createElement('canvas');
              maskCanvas.width = canvas.width;
              maskCanvas.height = canvas.height;
              const mCtx = maskCanvas.getContext('2d');
              if (mCtx) {
                mCtx.fillStyle = gradient;
                mCtx.fillRect(0, 0, canvas.width, canvas.height);
                mCtx.globalCompositeOperation = 'source-in';
                mCtx.drawImage(effectCanvas, 0, 0);
                ctx.drawImage(maskCanvas, 0, 0);
              }
            } else {
              ctx.drawImage(effectCanvas, 0, 0);
            }
          }
        }

        if (settings.watermarkText.trim()) {
          const fontSize = Math.max(20, Math.floor(canvas.width / 20));
          ctx.font = `bold ${fontSize}px Inter, sans-serif`;
          ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
          ctx.lineWidth = Math.max(1, fontSize / 15);
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          const padding = fontSize;
          let x = 0; let y = 0;
          switch (settings.watermarkPosition) {
            case 'tl': ctx.textAlign = 'left'; x = padding; y = padding + fontSize / 2; break;
            case 'tr': ctx.textAlign = 'right'; x = canvas.width - padding; y = padding + fontSize / 2; break;
            case 'bl': ctx.textAlign = 'left'; x = padding; y = canvas.height - padding - fontSize / 2; break;
            case 'br': ctx.textAlign = 'right'; x = canvas.width - padding; y = canvas.height - padding - fontSize / 2; break;
            case 'center': ctx.textAlign = 'center'; x = canvas.width / 2; y = canvas.height / 2; break;
          }
          ctx.strokeText(settings.watermarkText, x, y);
          ctx.fillText(settings.watermarkText, x, y);
        }

        const result = canvas.toDataURL('image/png');
        processingCache.current.set(cacheKey, result);
        
        // Limit cache size
        if (processingCache.current.size > 50) {
          const firstKey = processingCache.current.keys().next().value;
          processingCache.current.delete(firstKey);
        }
        
        resolve(result);
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = image.url;
    });
  }, []);

  // Cleanup cache on unmount
  useEffect(() => {
    return () => {
      processingCache.current.clear();
    };
  }, []);

  return {
    images,
    activeImageIndex,
    activeImage,
    isProcessing,
    setIsProcessing,
    setImages,
    setActiveImageIndex,
    addImages,
    removeImage,
    updateImage,
    processImage,
    setActiveById
  };
};

export default useImageProcessor;
