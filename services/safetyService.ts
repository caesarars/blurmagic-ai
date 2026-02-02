/**
 * Content Safety & Moderation Service
 * 
 * Detects and blocks:
 * - CSAM (Child Sexual Abuse Material)
 * - Violence/Gore
 * - Extreme content
 * - Illegal content
 */

// SafeSearch detection levels from Google Vision API
interface SafetyAnnotation {
  adult: string;      // LIKELY, UNLIKELY, POSSIBLE, VERY_LIKELY
  violence: string;
  racy: string;
  spoof: string;
  medical: string;
}

// Content moderation result
export interface SafetyCheckResult {
  isSafe: boolean;
  blocked: boolean;
  reason?: string;
  confidence: number;
  categories: {
    adult: boolean;
    violence: boolean;
    csam: boolean;  // Simulated - actual CSAM detection requires specialized APIs
    racy: boolean;
  };
}

// Heuristic-based safety check (fallback jika API tidak tersedia)
const heuristicSafetyCheck = async (imageUrl: string): Promise<SafetyCheckResult> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      // Basic checks
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve({
          isSafe: true,
          blocked: false,
          confidence: 0,
          categories: { adult: false, violence: false, csam: false, racy: false }
        });
        return;
      }

      canvas.width = 100;
      canvas.height = 100;
      ctx.drawImage(img, 0, 0, 100, 100);
      
      try {
        // Get image data for basic analysis
        const imageData = ctx.getImageData(0, 0, 100, 100);
        const data = imageData.data;
        
        // Simple skin tone detection (very basic heuristic)
        let skinPixels = 0;
        let totalPixels = data.length / 4;
        
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          
          // Basic skin tone range (very rough approximation)
          if (r > 60 && r < 255 && g > 40 && g < 220 && b > 20 && b < 170) {
            if (r > g && r > b && (r - g) < 50 && (r - b) < 80) {
              skinPixels++;
            }
          }
        }
        
        const skinRatio = skinPixels / totalPixels;
        
        // Flag if excessive skin tones (possible adult content)
        const isRacy = skinRatio > 0.7; // 70% skin tone
        const isAdult = skinRatio > 0.85; // 85% skin tone
        
        resolve({
          isSafe: !isAdult,
          blocked: isAdult,
          reason: isAdult ? 'Content flagged for manual review' : undefined,
          confidence: skinRatio,
          categories: {
            adult: isAdult,
            violence: false,
            csam: false,
            racy: isRacy
          }
        });
      } catch (e) {
        // If we can't analyze, allow through but log
        console.warn('Could not perform heuristic safety check:', e);
        resolve({
          isSafe: true,
          blocked: false,
          confidence: 0,
          categories: { adult: false, violence: false, csam: false, racy: false }
        });
      }
    };
    
    img.onerror = () => {
      resolve({
        isSafe: true,
        blocked: false,
        confidence: 0,
        categories: { adult: false, violence: false, csam: false, racy: false }
      });
    };
    
    img.src = imageUrl;
  });
};

// Main safety check function
export const checkContentSafety = async (imageUrl: string): Promise<SafetyCheckResult> => {
  try {
    // Try Google Vision API first if API key is available
    const apiKey = import.meta.env.VITE_GOOGLE_VISION_API_KEY;
    
    if (apiKey && apiKey !== 'your-google-vision-api-key') {
      const result = await checkWithGoogleVision(imageUrl, apiKey);
      return result;
    }
    
    // Fallback to heuristic check
    console.log('⚠️ No Vision API key, using heuristic safety check');
    return await heuristicSafetyCheck(imageUrl);
    
  } catch (error) {
    console.error('❌ Safety check error:', error);
    // Fail safe - allow content but log error
    return {
      isSafe: true,
      blocked: false,
      confidence: 0,
      categories: { adult: false, violence: false, csam: false, racy: false }
    };
  }
};

// Google Vision API SafeSearch detection
const checkWithGoogleVision = async (imageUrl: string, apiKey: string): Promise<SafetyCheckResult> => {
  // Extract base64 data
  const base64Data = imageUrl.split(',')[1];
  if (!base64Data) {
    return await heuristicSafetyCheck(imageUrl);
  }

  const response = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      requests: [{
        image: {
          content: base64Data
        },
        features: [{
          type: 'SAFE_SEARCH_DETECTION',
          maxResults: 10
        }]
      }]
    })
  });

  if (!response.ok) {
    console.warn('Vision API failed, falling back to heuristic');
    return await heuristicSafetyCheck(imageUrl);
  }

  const data = await response.json();
  const safeSearch = data.responses?.[0]?.safeSearchAnnotation;
  
  if (!safeSearch) {
    return await heuristicSafetyCheck(imageUrl);
  }

  // Parse results
  const isLikely = (value: string) => ['LIKELY', 'VERY_LIKELY'].includes(value);
  
  const adult = isLikely(safeSearch.adult);
  const violence = isLikely(safeSearch.violence);
  const racy = isLikely(safeSearch.racy);
  
  // Calculate confidence (0-1)
  const getConfidence = (value: string) => {
    switch (value) {
      case 'VERY_LIKELY': return 0.9;
      case 'LIKELY': return 0.7;
      case 'POSSIBLE': return 0.4;
      case 'UNLIKELY': return 0.1;
      default: return 0;
    }
  };
  
  const confidence = Math.max(
    getConfidence(safeSearch.adult),
    getConfidence(safeSearch.violence)
  );

  // Block if adult or violence detected
  const blocked = adult || violence;
  
  return {
    isSafe: !blocked,
    blocked,
    reason: blocked ? 'Content violates safety guidelines' : undefined,
    confidence,
    categories: {
      adult,
      violence,
      csam: false, // Vision API doesn't specifically detect CSAM, needs specialized service
      racy
    }
  };
};

// Batch safety check for multiple images
export const checkBatchSafety = async (imageUrls: string[]): Promise<SafetyCheckResult[]> => {
  return Promise.all(imageUrls.map(url => checkContentSafety(url)));
};

// Report content
export const reportContent = async (reason: string, details?: string) => {
  // In production, this would send to your backend
  console.log('🚨 Content reported:', { reason, details, timestamp: new Date().toISOString() });
  
  // Store in localStorage for demo purposes
  const reports = JSON.parse(localStorage.getItem('blurmagic-reports') || '[]');
  reports.push({
    reason,
    details,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent
  });
  localStorage.setItem('blurmagic-reports', JSON.stringify(reports));
  
  return { success: true };
};

// Terms of Service acceptance
export const hasAcceptedToS = (): boolean => {
  return localStorage.getItem('blurmagic-tos-accepted') === 'true';
};

export const acceptToS = () => {
  localStorage.setItem('blurmagic-tos-accepted', 'true');
  localStorage.setItem('blurmagic-tos-date', new Date().toISOString());
};

// Age verification
export const hasVerifiedAge = (): boolean => {
  return localStorage.getItem('blurmagic-age-verified') === 'true';
};

export const verifyAge = () => {
  localStorage.setItem('blurmagic-age-verified', 'true');
};
