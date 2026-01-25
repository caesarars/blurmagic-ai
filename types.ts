
export interface ImageMetadata {
  Make?: string;
  Model?: string;
  DateTimeOriginal?: Date | string;
  latitude?: number;
  longitude?: number;
  Software?: string;
  ExifImageWidth?: number;
  ExifImageHeight?: number;
  [key: string]: any;
}

export interface BoundingBox {
  box_2d: [number, number, number, number]; // [ymin, xmin, ymax, xmax]
  label: string;
}

export interface ImageState {
  id: string;
  file: File;
  url: string;
  width: number;
  height: number;
  originalAspectRatio: number;
  processedUrl: string | null;
  isAIProcessing: boolean;
  isAIEdited: boolean;
  manualIntensity: number;
  metadata?: ImageMetadata | null;
}

export type WatermarkPosition = 'tl' | 'tr' | 'bl' | 'br' | 'center';

export interface BlurSettings {
  intensity: number;
  focusRadius: number;
  type: 'box' | 'gaussian' | 'pixelate';
  isAIProcessing: boolean;
  wipeMetadata: boolean;
  history: string[];
  watermarkText: string;
  watermarkPosition: WatermarkPosition;
}

export type AISmartAction = 'faces' | 'background' | 'text' | 'sensitive' | 'nuclear_censor';

export type CompliancePreset = 'twitter_safe' | 'member_teaser' | 'clean';
