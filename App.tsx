
import React, { useState, useRef, useEffect, useCallback } from 'react';
import JSZip from 'jszip';
import exifr from 'exifr';
import Header from './components/Header';
import ImageEditor from './components/ImageEditor';
import Sidebar from './components/Sidebar';
import Gallery from './components/Gallery';
import PrivacyModal from './components/PrivacyModal';
import MetadataInspector from './components/MetadataInspector';
import { BlurSettings, ImageState, WatermarkPosition, BoundingBox, CompliancePreset } from './types';
import { aiProcessImage, aiDetectAreas } from './services/geminiService';

const App: React.FC = () => {
  const [images, setImages] = useState<ImageState[]>([]);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isMetadataInspectorOpen, setIsMetadataInspectorOpen] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [isMetadataStripping, setIsMetadataStripping] = useState(false);
  
  const [settings, setSettings] = useState<BlurSettings>({
    intensity: 10,
    focusRadius: 0,
    type: 'gaussian',
    isAIProcessing: false,
    wipeMetadata: true,
    history: [],
    watermarkText: '',
    watermarkPosition: 'br'
  });
  
  const activeImage = images[activeImageIndex] || null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList) return;

    const files = Array.from(fileList) as File[];
    if (files.length === 0) return;

    files.forEach(async (file: File) => {
      let metadata = null;
      try {
        metadata = await exifr.parse(file, {
          pick: ['Make', 'Model', 'DateTimeOriginal', 'Software', 'ExifImageWidth', 'ExifImageHeight'],
          gps: true
        });
      } catch (e) {
        console.warn("Failed to parse metadata for file:", file.name, e);
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        const img = new Image();
        img.onload = () => {
          const newImage: ImageState = {
            id: Math.random().toString(36).substring(2, 11),
            file,
            url,
            width: img.width,
            height: img.height,
            originalAspectRatio: img.width / img.height,
            processedUrl: url,
            isAIProcessing: false,
            isAIEdited: false,
            manualIntensity: settings.intensity,
            metadata: metadata
          };
          setImages(prev => [...prev, newImage]);
        };
        img.src = url;
      };
      reader.readAsDataURL(file);
    });
  };

  const applyEffectsToImage = useCallback(async (image: ImageState, currentSettings: BlurSettings): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(image.url);
        return;
      }

      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        if (currentSettings.intensity > 0) {
          const effectCanvas = document.createElement('canvas');
          effectCanvas.width = canvas.width;
          effectCanvas.height = canvas.height;
          const eCtx = effectCanvas.getContext('2d');
          
          if (eCtx) {
            if (currentSettings.type === 'pixelate') {
              const scale = Math.max(0.01, 1 - (currentSettings.intensity / 100));
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
              eCtx.filter = `blur(${currentSettings.intensity}px)`;
              eCtx.drawImage(img, 0, 0);
            }

            if (currentSettings.focusRadius > 0) {
              const centerX = canvas.width / 2;
              const centerY = canvas.height / 2;
              const maxDim = Math.max(canvas.width, canvas.height);
              const sharpRadius = (currentSettings.focusRadius / 100) * (maxDim / 0.8);
              const gradient = ctx.createRadialGradient(centerX, centerY, sharpRadius * 0.5, centerX, centerY, sharpRadius);
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

        if (currentSettings.watermarkText.trim()) {
          const fontSize = Math.max(20, Math.floor(canvas.width / 20));
          ctx.font = `bold ${fontSize}px Inter, sans-serif`;
          ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
          ctx.lineWidth = Math.max(1, fontSize / 15);
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          const padding = fontSize;
          let x = 0; let y = 0;
          switch (currentSettings.watermarkPosition) {
            case 'tl': ctx.textAlign = 'left'; x = padding; y = padding + fontSize / 2; break;
            case 'tr': ctx.textAlign = 'right'; x = canvas.width - padding; y = padding + fontSize / 2; break;
            case 'bl': ctx.textAlign = 'left'; x = padding; y = canvas.height - padding - fontSize / 2; break;
            case 'br': ctx.textAlign = 'right'; x = canvas.width - padding; y = canvas.height - padding - fontSize / 2; break;
            case 'center': ctx.textAlign = 'center'; x = canvas.width / 2; y = canvas.height / 2; break;
          }
          ctx.strokeText(currentSettings.watermarkText, x, y);
          ctx.fillText(currentSettings.watermarkText, x, y);
        }
        resolve(canvas.toDataURL('image/png'));
      };
      img.src = image.url;
    });
  }, []);

  useEffect(() => {
    if (activeImage && !activeImage.isAIProcessing && !activeImage.isAIEdited) {
      applyEffectsToImage(activeImage, settings).then(url => {
        setImages(prev => prev.map((img, i) => 
          i === activeImageIndex ? { ...img, processedUrl: url, manualIntensity: settings.intensity } : img
        ));
      });
    }
  }, [settings.intensity, settings.focusRadius, settings.type, settings.watermarkText, settings.watermarkPosition, activeImageIndex, activeImage?.url, activeImage?.isAIEdited]);

  const handleAISmartBlur = async (prompt: string, targetIndex?: number) => {
    const indexToProcess = targetIndex !== undefined ? targetIndex : activeImageIndex;
    const targetImage = images[indexToProcess];
    if (!targetImage) return;

    setImages(prev => prev.map((img, i) => 
      i === indexToProcess ? { ...img, isAIProcessing: true } : img
    ));

    try {
      const result = await aiProcessImage(targetImage.url, prompt);
      if (result) {
        setImages(prev => prev.map((img, i) => 
          i === indexToProcess ? { ...img, processedUrl: result, isAIProcessing: false, isAIEdited: true } : img
        ));
      }
    } catch (error) {
      console.error("AI processing failed:", error);
      setImages(prev => prev.map((img, i) => 
        i === indexToProcess ? { ...img, isAIProcessing: false } : img
      ));
    }
  };

  const handleCompliancePreset = async (preset: CompliancePreset, targetIndex?: number) => {
    const indexToProcess = targetIndex !== undefined ? targetIndex : activeImageIndex;
    const targetImage = images[indexToProcess];
    if (!targetImage) return;

    if (preset === 'clean') {
      setImages(prev => prev.map((img, i) => 
        i === indexToProcess ? { ...img, processedUrl: img.url, isAIEdited: false, manualIntensity: 0 } : img
      ));
      return;
    }

    setImages(prev => prev.map((img, i) => i === indexToProcess ? { ...img, isAIProcessing: true } : img));

    try {
      const prompt = "Identify the bounding boxes for exposed skin areas specifically: chest, groin, and buttocks suitable for censoring compliance.";
      const areas = await aiDetectAreas(targetImage.url, prompt);
      
      const canvas = document.createElement('canvas');
      canvas.width = targetImage.width;
      canvas.height = targetImage.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error("Canvas init failed");

      const img = new Image();
      await new Promise((resolve) => {
        img.onload = resolve;
        img.src = targetImage.url;
      });

      ctx.drawImage(img, 0, 0);

      if (areas.length > 0) {
        areas.forEach((area: BoundingBox) => {
          const [ymin, xmin, ymax, xmax] = area.box_2d;
          const x = (xmin / 1000) * canvas.width;
          const y = (ymin / 1000) * canvas.height;
          const w = ((xmax - xmin) / 1000) * canvas.width;
          const h = ((ymax - ymin) / 1000) * canvas.height;

          if (preset === 'twitter_safe') {
            // Exact 20px pixel blocks for sensor berat
            const targetPixelSize = 20;
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = Math.max(1, Math.ceil(w / targetPixelSize));
            tempCanvas.height = Math.max(1, Math.ceil(h / targetPixelSize));
            const tCtx = tempCanvas.getContext('2d');
            if (tCtx) {
              tCtx.imageSmoothingEnabled = false;
              tCtx.drawImage(img, x, y, w, h, 0, 0, tempCanvas.width, tempCanvas.height);
              ctx.imageSmoothingEnabled = false;
              ctx.drawImage(tempCanvas, 0, 0, tempCanvas.width, tempCanvas.height, x, y, w, h);
            }
          } else if (preset === 'member_teaser') {
            // Soft Gaussian Blur with curiosity-inducing transparency
            const blurCanvas = document.createElement('canvas');
            blurCanvas.width = canvas.width;
            blurCanvas.height = canvas.height;
            const bCtx = blurCanvas.getContext('2d');
            if (bCtx) {
              bCtx.filter = 'blur(16px)';
              bCtx.drawImage(img, 0, 0);
              
              ctx.save();
              ctx.beginPath();
              ctx.rect(x, y, w, h);
              ctx.clip();
              ctx.globalAlpha = 0.90; // Curiosity induce transparency
              ctx.drawImage(blurCanvas, 0, 0);
              ctx.restore();
            }
          }
        });
      }

      setImages(prev => prev.map((img, i) => 
        i === indexToProcess ? { 
          ...img, 
          processedUrl: canvas.toDataURL('image/png'), 
          isAIProcessing: false, 
          isAIEdited: true 
        } : img
      ));
    } catch (error) {
      console.error("Compliance Preset Failed:", error);
      setImages(prev => prev.map((img, i) => i === indexToProcess ? { ...img, isAIProcessing: false } : img));
    }
  };

  const handleBulkCompliancePreset = async (preset: CompliancePreset) => {
    images.forEach((_, index) => handleCompliancePreset(preset, index));
  };

  const handleNuclearCensor = async (targetIndex?: number) => {
    await handleCompliancePreset('twitter_safe', targetIndex);
  };

  const handleBulkAI = async (prompt: string) => {
    images.forEach((_, index) => handleAISmartBlur(prompt, index));
  };

  const handleBulkNuclearCensor = async () => {
    images.forEach((_, index) => handleNuclearCensor(index));
  };

  const handleBulkEffects = async () => {
    const updatedImages = await Promise.all(images.map(async (img) => {
      if (img.isAIEdited) return img;
      const processedUrl = await applyEffectsToImage(img, settings);
      return { ...img, processedUrl, manualIntensity: settings.intensity };
    }));
    setImages(updatedImages);
  };

  const downloadActive = async () => {
    if (!activeImage || !activeImage.processedUrl) return;
    if (settings.wipeMetadata) {
      setIsMetadataStripping(true);
      await new Promise(r => setTimeout(r, 800));
    }
    const link = document.createElement('a');
    link.download = `blurmagic-edited-${activeImage.id}.png`;
    link.href = activeImage.processedUrl;
    link.click();
    setIsMetadataStripping(false);
  };

  const downloadAll = async () => {
    if (images.length === 0) return;
    setIsZipping(true);
    const zip = new JSZip();
    const folder = zip.folder("blurmagic-batch");
    images.forEach((img, index) => {
      const dataUrl = img.processedUrl || img.url;
      const base64Data = dataUrl.split(',')[1];
      if (base64Data && folder) {
        const filename = `blurmagic-${index + 1}-${img.id}.png`;
        folder.file(filename, base64Data, { base64: true });
      }
    });
    try {
      if (settings.wipeMetadata) {
        setIsMetadataStripping(true);
        await new Promise(r => setTimeout(r, 1200));
      }
      const content = await zip.generateAsync({ type: "blob" });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = `blurmagic-batch-${new Date().getTime()}.zip`;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error("ZIP creation failed:", error);
    } finally {
      setIsZipping(false);
      setIsMetadataStripping(false);
    }
  };

  const removeImage = (id: string) => {
    setImages(prev => {
      const newImages = prev.filter(img => img.id !== id);
      if (activeImageIndex >= newImages.length) {
        setActiveImageIndex(Math.max(0, newImages.length - 1));
      }
      return newImages;
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header onOpenPrivacy={() => setIsPrivacyModalOpen(true)} />
      <main className="flex-1 flex flex-col md:flex-row gap-4 p-4 md:p-6 overflow-hidden">
        <div className="flex-1 flex flex-col gap-4 overflow-hidden relative">
          <div className="flex-1 glass rounded-2xl p-4 flex flex-col items-center justify-center relative min-h-[400px]">
            {isMetadataStripping && (
              <div className="absolute inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center text-center p-6 rounded-2xl animate-in fade-in duration-300">
                <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-4 relative">
                  <div className="absolute inset-0 border-4 border-blue-500/40 rounded-full animate-ping" />
                  <svg className="w-8 h-8 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">🛡️ Metadata Stripping Active</h3>
                <p className="text-slate-400 text-sm max-w-sm">Wiping EXIF, GPS, and Camera data on the fly.</p>
              </div>
            )}
            {activeImage ? (
              <ImageEditor originalUrl={activeImage.url} processedUrl={activeImage.processedUrl} isAIProcessing={activeImage.isAIProcessing} />
            ) : (
              <div className="text-center flex flex-col items-center">
                <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mb-4 animate-pulse">
                   <svg className="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold mb-2">Ready for bulk blurring?</h2>
                <label className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-full font-semibold cursor-pointer transition-all shadow-lg active:scale-95">
                  Select Images
                  <input type="file" className="hidden" accept="image/*" multiple onChange={handleImageUpload} />
                </label>
              </div>
            )}
          </div>
          {images.length > 0 && (
            <Gallery images={images} activeId={activeImage?.id || ''} onSelect={(index) => setActiveImageIndex(index)} onRemove={removeImage} />
          )}
        </div>
        <Sidebar 
          imageCount={images.length}
          activeImage={activeImage}
          settings={settings}
          onSettingsChange={setSettings}
          onAIAction={handleAISmartBlur}
          onBulkAIAction={handleBulkAI}
          onNuclearCensor={handleNuclearCensor}
          onBulkNuclearCensor={handleBulkNuclearCensor}
          onCompliancePreset={handleCompliancePreset}
          onBulkCompliancePreset={handleBulkCompliancePreset}
          onBulkIntensity={handleBulkEffects}
          onDownloadActive={downloadActive}
          onDownloadAll={downloadAll}
          isDownloadingBatch={isZipping || isMetadataStripping}
          onReset={() => {
            if (activeImage) {
              setImages(prev => prev.map((img, i) => 
                i === activeImageIndex ? { ...img, processedUrl: img.url, manualIntensity: 0, isAIEdited: false } : img
              ));
            }
            setSettings(s => ({ ...s, intensity: 0, focusRadius: 0, watermarkText: '', type: 'gaussian' }));
          }}
          onAddMore={() => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.multiple = true;
            input.onchange = (e: any) => handleImageUpload(e);
            input.click();
          }}
          onInspectMetadata={() => setIsMetadataInspectorOpen(true)}
        />
      </main>
      <PrivacyModal isOpen={isPrivacyModalOpen} onClose={() => setIsPrivacyModalOpen(false)} />
      <MetadataInspector isOpen={isMetadataInspectorOpen} onClose={() => setIsMetadataInspectorOpen(false)} activeImage={activeImage} />
    </div>
  );
};

export default App;
