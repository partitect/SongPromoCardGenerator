import React, { useState, useRef, useCallback, useEffect } from 'react';
import { toPng } from 'html-to-image';

// Component Imports
import ImageUploader from './components/ImageUploader';
import TextInput from './components/TextInput';
import PreviewCard from './components/PreviewCard';

// Type and Constant Imports
import type { AspectRatio, Font, ImageShadow } from './types';
import { ASPECT_RATIOS, FONT_OPTIONS, IMAGE_SHADOW_OPTIONS } from './constants';

// Hook and Utility Imports
import { useDominantColor, hexToRgb, getLuminance, getContrastRatio } from './hooks/useDominantColor';

// A simple placeholder image to be used as a default.
const placeholderImage = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Crect width='512' height='512' fill='%232d3748'/%3E%3Cpath d='M256 128a64 64 0 100 128 64 64 0 000-128zm0 160c-88.36 0-160 53.33-160 119.2V448h320v-40.8c0-65.87-71.64-119.2-160-119.2z' fill='%234a5568'/%3E%3C/svg%3E";


const embedFontResources = async (cssText: string): Promise<string> => {
  const fontUrlRegex = /url\((['"]?)(.*?)\1\)/g;
  const fontUrls = new Set(
    Array.from(cssText.matchAll(fontUrlRegex), (match) => match[2])
  );

  const urlToDataUrlMap = new Map<string, string>();

  await Promise.all(
    Array.from(fontUrls).map(async (url) => {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to fetch font: ${response.statusText}`);
        }
        const blob = await response.blob();
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
        urlToDataUrlMap.set(url, dataUrl);
      } catch (e) {
        console.error(`Failed to fetch and embed font ${url}:`, e);
      }
    })
  );

  return cssText.replace(fontUrlRegex, (match, quote, url) => {
    const dataUrl = urlToDataUrlMap.get(url);
    return dataUrl ? `url(${quote}${dataUrl}${quote})` : match;
  });
};

const SliderControl: React.FC<{
  label: string;
  value: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  min: number;
  max: number;
  step: number;
}> = ({ label, value, onChange, min, max, step }) => (
  <div>
    <label className="block text-sm font-medium text-gray-400">{label}: {value}</label>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={onChange}
      className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
    />
  </div>
);

type Tab = 'general' | 'color' | 'text' | 'effects';

const App: React.FC = () => {


  const [imageUrl, setImageUrl] = useState<string>(placeholderImage);
  const [songTitle, setSongTitle] = useState('Your Song Title');
  const [artistName, setArtistName] = useState('Artist Name');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('9:16');
  const [activeTab, setActiveTab] = useState<Tab>('general');

  const { palette } = useDominantColor(imageUrl);
  const [backgroundColor, setBackgroundColor] = useState('#1a1a1a');
  const [textColor, setTextColor] = useState('#ffffff');
  const [autoColor, setAutoColor] = useState(true);
  const [paletteIndex, setPaletteIndex] = useState(0);

  const [font, setFont] = useState<Font>('montserrat');
  const [titleFontSize, setTitleFontSize] = useState(48);
  const [artistFontSize, setArtistFontSize] = useState(24);
  const [titleFontWeight, setTitleFontWeight] = useState(700);
  const [artistFontWeight, setArtistFontWeight] = useState(400);
  const [titleLetterSpacing, setTitleLetterSpacing] = useState(0);
  const [artistLetterSpacing, setArtistLetterSpacing] = useState(0);
  
  const [imageShadow, setImageShadow] = useState<ImageShadow>('md');
  const [fontsLoaded, setFontsLoaded] = useState(false);

  const previewCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const preloadFonts = async () => {
      const fontLink = document.getElementById('google-fonts') as HTMLLinkElement;
      try {
        if (!fontLink?.href) {
          console.error("Could not find Google Fonts stylesheet link.");
          setFontsLoaded(true);
          return;
        }

        const fontCssResponse = await fetch(fontLink.href);
        if (!fontCssResponse.ok) throw new Error(`Failed to fetch font CSS: ${fontCssResponse.statusText}`);
        
        const fontCssText = await fontCssResponse.text();
        const embeddedFontCss = await embedFontResources(fontCssText);

        const style = document.createElement('style');
        style.textContent = embeddedFontCss;
        document.head.appendChild(style);

        fontLink.remove();
        setFontsLoaded(true);
      } catch (error) {
        console.error("Failed to pre-load and embed fonts:", error);
        if (fontLink) fontLink.remove();
        setFontsLoaded(true);
      }
    };
    preloadFonts();
  }, []);

  useEffect(() => {
    if (autoColor && palette.length > 0) {
      const currentBackgroundColor = palette[paletteIndex % palette.length];
      let bestTextColor = '#ffffff';
      let maxContrast = 0;

      palette.forEach(color => {
        if (color === currentBackgroundColor) return;
        const contrast = getContrastRatio(currentBackgroundColor, color);
        if (contrast > maxContrast) {
          maxContrast = contrast;
          bestTextColor = color;
        }
      });
      
      if (maxContrast < 3) {
           const bgRgb = hexToRgb(currentBackgroundColor);
           if (bgRgb) {
              const luminance = getLuminance(bgRgb.r, bgRgb.g, bgRgb.b);
              bestTextColor = luminance > 0.5 ? '#000000' : '#ffffff';
           }
      }

      setBackgroundColor(currentBackgroundColor);
      setTextColor(bestTextColor);
    } else if (!autoColor) {
      // Manual color mode, do nothing.
    } else {
      setBackgroundColor('#1a1a1a');
      setTextColor('#ffffff');
    }
  }, [palette, paletteIndex, autoColor, imageUrl]);

  
  const handleImageUpload = (file: File) => {
    setPaletteIndex(0);
    const reader = new FileReader();
    reader.onloadend = () => {
      if (reader.result && typeof reader.result === 'string') {
        setImageUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };
  
  const handleDownload = useCallback(async () => {
    if (previewCardRef.current === null) return;

    try {
      const dataUrl = await toPng(previewCardRef.current, { cacheBust: true, pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `${artistName.toLowerCase().replace(/\s+/g, '-')}-${songTitle.toLowerCase().replace(/\s+/g, '-')}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('oops, something went wrong!', err);
      alert("Could not download image. A network issue or browser extension might be interfering.\n\nPlease check your browser's console for more details.");
    }
  }, [previewCardRef, songTitle, artistName]);

  const handleAutoColorToggle = () => {
    const newAutoColor = !autoColor;
    setAutoColor(newAutoColor);
    if(newAutoColor) setPaletteIndex(0);
  }

  const handleRegenerateColors = useCallback(() => {
    if (palette.length > 0) {
      if (!autoColor) setAutoColor(true);
      setPaletteIndex(prevIndex => (prevIndex + 1));
    }
  }, [palette, autoColor]);

  const TABS: { id: Tab; label: string }[] = [
    { id: 'general', label: 'General' },
    { id: 'color', label: 'Colors' },
    { id: 'text', label: 'Typography' },
    { id: 'effects', label: 'Effects' },
  ];

  const selectedAspectRatio = ASPECT_RATIOS.find(ar => ar.ratio === aspectRatio) || ASPECT_RATIOS[0];

  return (
    <div className="bg-gray-900 text-white min-h-screen font-sans flex flex-col">
      <main className="container mx-auto p-4 lg:p-6 flex flex-col">
        <header className="text-center mb-6">
          <h1 className="text-3xl lg:text-4xl font-bold">AI Music Card Generator</h1>
          <p className="text-gray-400 mt-1 text-sm">Create beautiful music promo cards in seconds.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <aside className="lg:col-span-1 bg-gray-800 p-4 rounded-lg flex flex-col space-y-4">
            <div className="flex-shrink-0">
              <ImageUploader 
                onImageUpload={handleImageUpload} 
                currentImage={imageUrl}
                label={'Album Art'}
                uploadPrompt={'Upload a file or drag & drop'}
                fileTypes={'.jpg, .jpeg, .png, .webp'}
                changeImagePrompt={'Change Image'}
              />
              <div className="grid grid-cols-2 gap-4 mt-4">
                <TextInput 
                  label={'Song Title'} 
                  value={songTitle} 
                  onChange={(e) => setSongTitle(e.target.value)}
                  placeholder={'Enter song title...'}
                />
                <TextInput 
                  label={'Artist Name'} 
                  value={artistName} 
                  onChange={(e) => setArtistName(e.target.value)}
                  placeholder={'Enter artist name...'}
                />
              </div>
            </div>

            <div className="flex flex-col">
              <div className="border-b border-gray-700 flex-shrink-0">
                <nav className="-mb-px flex space-x-4" aria-label="Tabs">
                  {TABS.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`${
                        activeTab === tab.id
                          ? 'border-indigo-500 text-indigo-400'
                          : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'
                      } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>
              <div className="space-y-6 p-4 -mx-4">
                {activeTab === 'general' && (
                  <div className="space-y-4">
                     <h3 className="text-lg font-semibold">Layout</h3>
                     <label className="block text-sm font-medium text-gray-300">Aspect Ratio</label>
                      <div className="flex space-x-2">
                        {ASPECT_RATIOS.map(({ name, ratio }) => (
                          <button 
                            key={ratio}
                            onClick={() => setAspectRatio(ratio)}
                            className={`flex-1 py-2 px-3 text-sm rounded-md transition ${aspectRatio === ratio ? 'bg-indigo-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}
                          >
                            {name}
                          </button>
                        ))}
                      </div>

                  </div>
                )}
                {activeTab === 'color' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Colors</h3>
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-300">Auto Color</label>
                      <button onClick={handleAutoColorToggle} className={`px-3 py-1 text-sm rounded-md transition ${autoColor ? 'bg-green-600' : 'bg-gray-600'}`}>
                          {autoColor ? 'ON' : 'OFF'}
                      </button>
                    </div>
                    <button 
                      onClick={handleRegenerateColors} 
                      className="w-full text-sm bg-gray-700 hover:bg-gray-600 disabled:bg-gray-700/50 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                      disabled={palette.length === 0}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7 1 1 0 015 8V5a1 1 0 011-1 1 1 0 100-2H5a1 1 0 01-1-1zm10.293 9.293a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /><path fillRule="evenodd" d="M10 18a7.002 7.002 0 006.337-4.125 1 1 0 10-1.742-.944A5.002 5.002 0 0110 16a5 5 0 110-10 1 1 0 100-2 7 7 0 100 14z" clipRule="evenodd" /></svg>
                      <span>Shuffle Palette</span>
                    </button>
                    <div className="flex items-center space-x-4 pt-1">
                      <div className="flex-1">
                        <label htmlFor="backgroundColor" className="block text-sm font-medium text-gray-300 mb-1">Background</label>
                        <input type="color" id="backgroundColor" value={backgroundColor} onChange={e => { setBackgroundColor(e.target.value); setAutoColor(false); }} className="w-full h-10 rounded-md border-gray-600 bg-gray-700" />
                      </div>
                      <div className="flex-1">
                        <label htmlFor="textColor" className="block text-sm font-medium text-gray-300 mb-1">Text</label>
                        <input type="color" id="textColor" value={textColor} onChange={e => { setTextColor(e.target.value); setAutoColor(false); }} className="w-full h-10 rounded-md border-gray-600 bg-gray-700" />
                      </div>
                    </div>
                  </div>
                )}
                {activeTab === 'text' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Typography</h3>
                    <div>
                      <label htmlFor="font" className="block text-sm font-medium text-gray-300 mb-2">Font Family</label>
                      <select id="font" value={font} onChange={e => setFont(e.target.value as Font)} className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                          {FONT_OPTIONS.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                      </select>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3 p-3 bg-gray-700/50 rounded-md">
                            <h4 className="font-semibold text-center text-gray-300">Title</h4>
                            <SliderControl label={'Font Size'} value={titleFontSize} onChange={e => setTitleFontSize(Number(e.target.value))} min={16} max={128} step={1} />
                            <SliderControl label={'Font Weight'} value={titleFontWeight} onChange={e => setTitleFontWeight(Number(e.target.value))} min={100} max={900} step={100} />
                            <SliderControl label={'Letter Spacing'} value={titleLetterSpacing} onChange={e => setTitleLetterSpacing(Number(e.target.value))} min={-5} max={20} step={0.1} />
                        </div>
                        <div className="space-y-3 p-3 bg-gray-700/50 rounded-md">
                            <h4 className="font-semibold text-center text-gray-300">Artist</h4>
                            <SliderControl label={'Font Size'} value={artistFontSize} onChange={e => setArtistFontSize(Number(e.target.value))} min={10} max={64} step={1} />
                            <SliderControl label={'Font Weight'} value={artistFontWeight} onChange={e => setArtistFontWeight(Number(e.target.value))} min={100} max={900} step={100} />
                            <SliderControl label={'Letter Spacing'} value={artistLetterSpacing} onChange={e => setArtistLetterSpacing(Number(e.target.value))} min={-5} max={20} step={0.1} />
                        </div>
                    </div>
                  </div>
                )}
                {activeTab === 'effects' && (
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold">Effects</h3>
                    <label htmlFor="image-shadow" className="block text-sm font-medium text-gray-300 mb-2">Image Shadow</label>
                    <select id="image-shadow" value={imageShadow} onChange={e => setImageShadow(e.target.value as ImageShadow)} className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                        {IMAGE_SHADOW_OPTIONS.map(s => <option key={s.id} value={s.id}>{s.nameKey.replace('shadow', 'Shadow').replace('None','None').replace('Sm','Small').replace('Md','Medium').replace('Lg','Large').replace('Xl','Extra Large')}</option>)}
                    </select>
                  </div>
                )}
              </div>
            </div>

            <div className="flex-shrink-0 mt-auto pt-4">
              <button 
                  onClick={handleDownload} 
                  disabled={!fontsLoaded}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-wait text-white font-bold py-3 px-4 rounded-lg transition-colors"
              >
                {fontsLoaded ? 'Download' : 'Loading Fonts...'}
              </button>
            </div>
          </aside>

          <div className="lg:col-span-1 flex items-center justify-center">
            <div className={`w-full max-w-lg mx-auto`}>
                 <PreviewCard
                    ref={previewCardRef}
                    aspectRatio={aspectRatio}
                    aspectRatioClass={selectedAspectRatio.className}
                    imageUrl={imageUrl}
                    backgroundColor={backgroundColor}
                    songTitle={songTitle}
                    artistName={artistName}
                    textColor={textColor}
                    font={font}
                    titleFontSize={titleFontSize}
                    artistFontSize={artistFontSize}
                    titleFontWeight={titleFontWeight}
                    artistFontWeight={artistFontWeight}
                    titleLetterSpacing={titleLetterSpacing}
                    artistLetterSpacing={artistLetterSpacing}
                    imageShadow={imageShadow}
                    listenOn={'Listen On'}
                />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;