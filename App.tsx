
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import JSZip from 'jszip';
import Header from './components/Header';
import ImageEditor from './components/ImageEditor';
import Sidebar from './components/Sidebar';
import Gallery from './components/Gallery';
import PrivacyModal from './components/PrivacyModal';
import MetadataInspector from './components/MetadataInspector';
import AuthModal from './components/AuthModal';
import SafetyModal from './components/SafetyModal';
import ReportModal from './components/ReportModal';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import LandingPage from './components/LandingPage';
import AuthDebug from './components/AuthDebug';
import { useToast } from './contexts/ToastContext';
import { useAuth } from './contexts/AuthContext';
import { useImageProcessor } from './hooks/useImageProcessor';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import type { BlurSettings, CompliancePreset } from './types';
import { aiProcessImage, aiDetectAreas } from './services/geminiService';
import { checkContentSafety, hasAcceptedToS, hasVerifiedAge } from './services/safetyService';

const DEFAULT_SETTINGS: BlurSettings = {
  intensity: 10,
  focusRadius: 0,
  type: 'gaussian',
  isAIProcessing: false,
  wipeMetadata: true,
  history: [],
  watermarkText: '',
  watermarkPosition: 'br'
};

const App: React.FC = () => {
  const [showLanding, setShowLanding] = useState(() => {
    return !localStorage.getItem('blurmagic-visited');
  });
  
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { addToast } = useToast();
  const { user, usage, trackUsage, refreshUsage } = useAuth();
  
  const {
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
  } = useImageProcessor();

  const [settings, setSettings] = useState<BlurSettings>(DEFAULT_SETTINGS);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isMetadataInspectorOpen, setIsMetadataInspectorOpen] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [isMetadataStripping, setIsMetadataStripping] = useState(false);
  
  // Safety & Moderation
  const [showSafetyModal, setShowSafetyModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [safetyChecked, setSafetyChecked] = useState(hasAcceptedToS() && hasVerifiedAge());

  const handleEnterApp = () => {
    localStorage.setItem('blurmagic-visited', 'true');
    setShowLanding(false);
    window.scrollTo(0, 0);
  };

  // Keyboard shortcuts
  useKeyboardShortcuts([
    { key: 'o', ctrl: true, handler: () => document.getElementById('file-upload')?.click(), description: 'Open files' },
    { key: 's', ctrl: true, handler: downloadActive, description: 'Save image' },
    { key: 'ArrowLeft', handler: () => navigateImage(-1), description: 'Previous image' },
    { key: 'ArrowRight', handler: () => navigateImage(1), description: 'Next image' },
    { key: 'Delete', handler: () => activeImage && removeImage(activeImage.id), description: 'Remove image' },
  ]);

  function navigateImage(direction: number) {
    const newIndex = activeImageIndex + direction;
    if (newIndex >= 0 && newIndex < images.length) {
      setActiveImageIndex(newIndex);
    }
  }

  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList) return;

    const files = Array.from(fileList).filter(f => f.type.startsWith('image/'));
    if (files.length === 0) {
      addToast('Please select valid image files', 'warning');
      return;
    }

    // Check safety agreement first
    if (!safetyChecked) {
      setShowSafetyModal(true);
      e.target.value = '';
      return;
    }

    setIsProcessing(true);
    let blockedCount = 0;
    let allowedFiles: File[] = [];

    try {
      // Safety check for each image
      for (const file of files) {
        const reader = new FileReader();
        const imageUrl = await new Promise<string>((resolve) => {
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(file);
        });

        const safetyResult = await checkContentSafety(imageUrl);
        
        if (safetyResult.blocked) {
          blockedCount++;
          console.warn('🚫 Blocked content:', file.name, safetyResult.reason);
          addToast(`"${file.name}" was blocked: ${safetyResult.reason}`, 'error');
        } else {
          allowedFiles.push(file);
        }
      }

      if (allowedFiles.length > 0) {
        await addImages(allowedFiles);
        // Track usage for each allowed image
        if (user) {
          await trackUsage(allowedFiles.length);
          await refreshUsage();
        }
        
        if (blockedCount > 0) {
          addToast(`Added ${allowedFiles.length} image(s). ${blockedCount} blocked for safety.`, 'warning');
        } else {
          addToast(`Successfully added ${allowedFiles.length} image${allowedFiles.length > 1 ? 's' : ''}`, 'success');
        }
      } else if (blockedCount > 0) {
        addToast('All selected images were blocked for safety violations.', 'error');
      }
    } catch (error) {
      console.error('Upload error:', error);
      addToast('Failed to process some images', 'error');
    } finally {
      setIsProcessing(false);
      e.target.value = '';
    }
  }, [addImages, addToast, user, trackUsage, refreshUsage, safetyChecked]);

  const handleRemoveImage = useCallback((id: string) => {
    removeImage(id);
    addToast('Image removed', 'info');
  }, [removeImage, addToast]);

  // Apply manual effects when settings change
  useEffect(() => {
    if (!activeImage || activeImage.isAIProcessing || activeImage.isAIEdited) return;

    let isMounted = true;
    
    processImage(activeImage, settings).then(url => {
      if (isMounted) {
        updateImage(activeImage.id, { processedUrl: url, manualIntensity: settings.intensity });
      }
    }).catch(error => {
      console.error('Effect application failed:', error);
      addToast('Failed to apply effects', 'error');
    });

    return () => { isMounted = false; };
  }, [settings.intensity, settings.focusRadius, settings.type, settings.watermarkText, 
      settings.watermarkPosition, activeImage?.id, activeImage?.url, activeImage?.isAIEdited,
      processImage, updateImage, addToast]);

  const handleAISmartBlur = useCallback(async (prompt: string, targetIndex?: number) => {
    const indexToProcess = targetIndex !== undefined ? targetIndex : activeImageIndex;
    const targetImage = images[indexToProcess];
    if (!targetImage) return;

    updateImage(targetImage.id, { isAIProcessing: true });

    try {
      const result = await aiProcessImage(targetImage.url, prompt);
      if (result) {
        updateImage(targetImage.id, { processedUrl: result, isAIProcessing: false, isAIEdited: true });
        if (user) {
          await trackUsage();
          await refreshUsage();
        }
        addToast('AI processing completed', 'success');
      }
    } catch (error: any) {
      console.error('AI processing failed:', error);
      updateImage(targetImage.id, { isAIProcessing: false });
      addToast(error.message || 'AI processing failed', 'error');
    }
  }, [activeImageIndex, images, updateImage, addToast, user, trackUsage, refreshUsage]);

  const handleCompliancePreset = useCallback(async (preset: CompliancePreset, targetIndex?: number) => {
    const indexToProcess = targetIndex !== undefined ? targetIndex : activeImageIndex;
    const targetImage = images[indexToProcess];
    if (!targetImage) return;

    if (preset === 'clean') {
      updateImage(targetImage.id, { processedUrl: targetImage.url, isAIEdited: false, manualIntensity: 0 });
      addToast('Image restored to original', 'success');
      return;
    }

    updateImage(targetImage.id, { isAIProcessing: true });

    try {
      const prompt = "Identify the bounding boxes for exposed skin areas specifically: chest, groin, and buttocks suitable for censoring compliance.";
      const areas = await aiDetectAreas(targetImage.url, prompt);
      
      const canvas = document.createElement('canvas');
      canvas.width = targetImage.width;
      canvas.height = targetImage.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error("Canvas init failed");

      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = targetImage.url;
      });

      ctx.drawImage(img, 0, 0);

      if (areas.length > 0) {
        areas.forEach((area: { box_2d: [number, number, number, number] }) => {
          const [ymin, xmin, ymax, xmax] = area.box_2d;
          const x = (xmin / 1000) * canvas.width;
          const y = (ymin / 1000) * canvas.height;
          const w = ((xmax - xmin) / 1000) * canvas.width;
          const h = ((ymax - ymin) / 1000) * canvas.height;

          if (preset === 'twitter_safe') {
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
              ctx.globalAlpha = 0.90;
              ctx.drawImage(blurCanvas, 0, 0);
              ctx.restore();
            }
          }
        });
      }

      updateImage(targetImage.id, { 
        processedUrl: canvas.toDataURL('image/png'), 
        isAIProcessing: false, 
        isAIEdited: true 
      });
      
      if (user) {
        await trackUsage();
        await refreshUsage();
      }
      
      addToast(`${preset === 'twitter_safe' ? 'Social Compliance' : 'Member Teaser'} preset applied`, 'success');
    } catch (error: any) {
      console.error('Compliance Preset Failed:', error);
      updateImage(targetImage.id, { isAIProcessing: false });
      addToast(error.message || 'Failed to apply preset', 'error');
    }
  }, [activeImageIndex, images, updateImage, addToast, user, trackUsage, refreshUsage]);

  const handleBulkCompliancePreset = useCallback(async (preset: CompliancePreset) => {
    if (images.length === 0) return;
    
    // Check if user has enough quota
    if (user) {
      const required = images.length;
      if (usage.remaining < required) {
        addToast(`Need ${required} images quota but only ${usage.remaining} remaining. Upgrade to Pro!`, 'error');
        return;
      }
    }
    
    addToast(`Applying ${preset} preset to ${images.length} images...`, 'info');
    
    // Process all images
    for (let i = 0; i < images.length; i++) {
      await handleCompliancePreset(preset, i);
    }
    
    addToast(`Batch processing completed! ${images.length} images processed.`, 'success');
  }, [images, handleCompliancePreset, addToast, user, usage.remaining]);

  const handleBulkAI = useCallback(async (prompt: string) => {
    if (images.length === 0) return;
    addToast('Processing all images with AI...', 'info');
    
    await Promise.all(images.map((_, index) => handleAISmartBlur(prompt, index)));
    addToast('AI batch processing completed', 'success');
  }, [images, handleAISmartBlur, addToast]);

  const handleBulkEffects = useCallback(async () => {
    if (images.length === 0) return;
    
    try {
      const updatedImages = await Promise.all(images.map(async (img) => {
        if (img.isAIEdited) return img;
        const processedUrl = await processImage(img, settings);
        return { ...img, processedUrl, manualIntensity: settings.intensity };
      }));
      setImages(updatedImages);
      addToast('Effects applied to all images', 'success');
    } catch (error) {
      console.error('Bulk effects failed:', error);
      addToast('Failed to apply effects to some images', 'error');
    }
  }, [images, settings, processImage, setImages, addToast]);

  async function downloadActive() {
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
    addToast('Image downloaded successfully', 'success');
  }

  const downloadAll = useCallback(async () => {
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
      
      addToast(`Downloaded ${images.length} images as ZIP`, 'success');
    } catch (error) {
      console.error("ZIP creation failed:", error);
      addToast('Failed to create ZIP file', 'error');
    } finally {
      setIsZipping(false);
      setIsMetadataStripping(false);
    }
  }, [images, settings.wipeMetadata, addToast]);

  const handleReset = useCallback(() => {
    if (activeImage) {
      updateImage(activeImage.id, { processedUrl: activeImage.url, manualIntensity: 0, isAIEdited: false });
    }
    setSettings(s => ({ ...s, intensity: 0, focusRadius: 0, watermarkText: '', type: 'gaussian' }));
    addToast('Settings reset', 'info');
  }, [activeImage, updateImage, addToast]);

  const handleAddMore = useCallback(() => {
    document.getElementById('file-upload')?.click();
  }, []);

  const sidebarProps = useMemo(() => ({
    imageCount: images.length,
    activeImage,
    settings,
    onSettingsChange: setSettings,
    onAIAction: handleAISmartBlur,
    onBulkAIAction: handleBulkAI,
    onCompliancePreset: handleCompliancePreset,
    onBulkCompliancePreset: handleBulkCompliancePreset,
    onBulkIntensity: handleBulkEffects,
    onDownloadActive: downloadActive,
    onDownloadAll: downloadAll,
    isDownloadingBatch: isZipping || isMetadataStripping,
    onReset: handleReset,
    onAddMore: handleAddMore,
    onInspectMetadata: () => setIsMetadataInspectorOpen(true),
  }), [images.length, activeImage, settings, handleAISmartBlur, handleBulkAI, 
       handleCompliancePreset, handleBulkCompliancePreset, handleBulkEffects, 
       downloadAll, isZipping, isMetadataStripping, handleReset, handleAddMore]);

  if (showLanding) {
    return <LandingPage onEnterApp={handleEnterApp} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-950">
      <div className="fixed top-4 left-4 z-50">
        <button
          onClick={() => setShowLanding(true)}
          className="bg-slate-800/80 hover:bg-slate-700 text-white px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 border border-white/10"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Home
        </button>
      </div>

      <Header 
        onOpenPrivacy={() => setIsPrivacyModalOpen(true)} 
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />
      
      <main className="flex-1 flex flex-col md:flex-row gap-4 p-4 md:p-6 overflow-hidden">
        <ProtectedRoute onRequireAuth={() => setIsAuthModalOpen(true)}>
          <div className="flex-1 flex flex-col gap-4 overflow-hidden relative">
            <div className="flex-1 glass rounded-2xl p-4 flex flex-col items-center justify-center relative min-h-[400px]">
              {isMetadataStripping && (
                <div 
                  className="absolute inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center text-center p-6 rounded-2xl animate-fade-in"
                  role="status"
                  aria-live="polite"
                >
                  <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-4 relative">
                    <div className="absolute inset-0 border-4 border-blue-500/40 rounded-full animate-ping" />
                    <svg className="w-8 h-8 text-blue-400" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">🛡️ Metadata Stripping Active</h3>
                  <p className="text-slate-400 text-sm max-w-sm">Wiping EXIF, GPS, and Camera data on the fly.</p>
                </div>
              )}
              
              {activeImage ? (
                <ImageEditor 
                  originalUrl={activeImage.url} 
                  processedUrl={activeImage.processedUrl} 
                  isAIProcessing={activeImage.isAIProcessing} 
                />
              ) : (
                <div className="text-center flex flex-col items-center">
                  <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mb-4 animate-pulse">
                    <svg className="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Ready for bulk blurring?</h2>
                  <label 
                    className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-full font-semibold cursor-pointer transition-all shadow-lg active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-950"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && document.getElementById('file-upload')?.click()}
                  >
                    Select Images
                    <input 
                      id="file-upload"
                      type="file" 
                      className="hidden" 
                      accept="image/*" 
                      multiple 
                      onChange={handleImageUpload}
                      aria-label="Select images to upload"
                    />
                  </label>
                </div>
              )}
            </div>
            
            {images.length > 0 && (
              <Gallery 
                images={images} 
                activeId={activeImage?.id || ''} 
                onSelect={(index) => setActiveImageIndex(index)} 
                onRemove={handleRemoveImage}
              />
            )}
          </div>
          
          <Sidebar {...sidebarProps} />
        </ProtectedRoute>
      </main>
      
      <PrivacyModal isOpen={isPrivacyModalOpen} onClose={() => setIsPrivacyModalOpen(false)} />
      <MetadataInspector 
        isOpen={isMetadataInspectorOpen} 
        onClose={() => setIsMetadataInspectorOpen(false)} 
        activeImage={activeImage} 
      />
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
      <SafetyModal 
        isOpen={showSafetyModal}
        onAccept={() => {
          setSafetyChecked(true);
          setShowSafetyModal(false);
        }}
      />
      <ReportModal 
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
      />
      
      {/* Report Button - Fixed position */}
      <button
        onClick={() => setShowReportModal(true)}
        className="fixed bottom-4 right-4 z-50 bg-red-500/10 hover:bg-red-500/20 text-red-400 px-4 py-2 rounded-full text-xs font-medium transition-all border border-red-500/30"
      >
        🚫 Report Content
      </button>
      
      <div id="sr-announcer" className="sr-only" aria-live="polite" aria-atomic="true" />
      
      {/* Debug Panel - Remove in production */}
      <AuthDebug />
    </div>
  );
};

export default App;
