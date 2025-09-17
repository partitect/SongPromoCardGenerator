import { useState, useEffect } from 'react';

// Helper functions for color conversion and contrast calculation
export const rgbToHex = (r: number, g: number, b: number): string => {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
};

export const hexToRgb = (hex: string): { r: number, g: number, b: number } | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
};

export const getLuminance = (r: number, g: number, b: number): number => {
    const a = [r, g, b].map((v) => {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
};

export const getContrastRatio = (color1: string, color2: string): number => {
    const rgb1 = hexToRgb(color1);
    const rgb2 = hexToRgb(color2);
    if (!rgb1 || !rgb2) return 1;

    const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
    const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);

    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);

    return (brightest + 0.05) / (darkest + 0.05);
};


interface ColorTheme {
    background: string;
    text: string;
}

const defaultTheme: ColorTheme = {
    background: '#1a1a1a',
    text: '#ffffff',
};

export const useDominantColor = (imageUrl: string | null): { theme: ColorTheme, palette: string[] } => {
  const [colors, setColors] = useState({ 
    theme: defaultTheme,
    palette: [] as string[]
  });

  useEffect(() => {
    if (!imageUrl) {
        setColors({ theme: defaultTheme, palette: [] });
        return;
    }

    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = imageUrl;

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      try {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const colorCounts: { [key: string]: number } = {};
        
        const step = 5 * 4; 

        for (let i = 0; i < data.length; i += step) {
          if (data[i + 3] < 128) continue;

          const r = Math.round(data[i] / 32) * 32;
          const g = Math.round(data[i + 1] / 32) * 32;
          const b = Math.round(data[i + 2] / 32) * 32;
          const key = `${r},${g},${b}`;
          colorCounts[key] = (colorCounts[key] || 0) + 1;
        }

        if (Object.keys(colorCounts).length === 0) {
          throw new Error("Image is transparent or has no analyzable pixels.");
        }

        const sortedColors = Object.keys(colorCounts).sort((a, b) => colorCounts[b] - colorCounts[a]);
        
        const imagePalette = sortedColors.slice(0, 10).map(rgbString => {
            const [r, g, b] = rgbString.split(',').map(Number);
            return rgbToHex(r, g, b);
        });

        const backgroundHex = imagePalette[0];
        let bestTextColor = '#ffffff';
        let maxContrast = 0;

        imagePalette.forEach(color => {
            if(color === backgroundHex) return;
            const contrast = getContrastRatio(backgroundHex, color);
            if (contrast > maxContrast) {
                maxContrast = contrast;
                bestTextColor = color;
            }
        });
        
        // Fallback for low-contrast palettes
        if (maxContrast < 3) {
             const bgRgb = hexToRgb(backgroundHex);
             if (bgRgb) {
                const luminance = getLuminance(bgRgb.r, bgRgb.g, bgRgb.b);
                bestTextColor = luminance > 0.5 ? '#000000' : '#ffffff';
             }
        }

        setColors({
          theme: {
            background: backgroundHex,
            text: bestTextColor,
          },
          palette: imagePalette
        });

      } catch (e) {
        console.error('Could not get image data for color analysis.', e);
        setColors({ theme: defaultTheme, palette: [] });
      }
    };

    img.onerror = (e) => {
      console.error('Failed to load image for color analysis.', e);
      setColors({ theme: defaultTheme, palette: [] });
    };

  }, [imageUrl]);

  return colors;
};