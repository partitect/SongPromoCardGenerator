import { FONT_OPTIONS } from './constants';

export type AspectRatio = '1:1' | '9:16' | '16:9';

export type Language = 'en' | 'es' | 'de' | 'tr';

// Create a union type of all possible font IDs from our constants file
export type Font = typeof FONT_OPTIONS[number]['id'];

export type ImageShadow = 'none' | 'sm' | 'md' | 'lg' | 'xl';

export interface AspectRatioInfo {
  name: string;
  ratio: AspectRatio;
  className: string;
}

export interface FontInfo {
  id: string;
  name: string;
  family: string;
}
