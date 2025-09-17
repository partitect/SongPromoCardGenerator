import React, { forwardRef } from 'react';
import type { AspectRatio, Font, ImageShadow } from '../types';
import { FONT_OPTIONS } from '../constants';
import {
  SpotifyIcon,
  AppleMusicIcon,
  YouTubeMusicIcon,
  AmazonMusicIcon,
} from './icons';


interface PreviewCardProps {
  aspectRatio: AspectRatio;
  aspectRatioClass: string;
  imageUrl: string;
  backgroundColor: string;
  songTitle: string;
  artistName: string;
  textColor: string;
  font: Font;
  titleFontSize: number;
  artistFontSize: number;
  titleFontWeight: number;
  artistFontWeight: number;
  titleLetterSpacing: number;
  artistLetterSpacing: number;
  imageShadow: ImageShadow;
  listenOn: string;
}

const shadowStyles: Record<ImageShadow, React.CSSProperties> = {
  none: { filter: 'none' },
  sm: { filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' },
  md: { filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.4))' },
  lg: { filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.5))' },
  xl: { filter: 'drop-shadow(0 20px 25px rgba(0,0,0,0.6))' },
};


const ListenOnSection: React.FC<{ text: string, iconSizeClass: string }> = ({ text, iconSizeClass }) => (
    <div className="mt-3 text-center">
        <p className="text-xs opacity-70 mb-2">{text}</p>
        <div className="flex items-center justify-center space-x-3">
            <SpotifyIcon className={iconSizeClass} />
            <AppleMusicIcon className={iconSizeClass} />
            <YouTubeMusicIcon className={iconSizeClass} />
            <AmazonMusicIcon className={iconSizeClass} />
        </div>
    </div>
);


const PreviewCard = forwardRef<HTMLDivElement, PreviewCardProps>(
  ({ 
    aspectRatio, 
    aspectRatioClass, 
    imageUrl, 
    backgroundColor, 
    songTitle, 
    artistName, 
    textColor, 
    font, 
    titleFontSize, 
    artistFontSize, 
    titleFontWeight, 
    artistFontWeight, 
    titleLetterSpacing, 
    artistLetterSpacing,
    imageShadow,
    listenOn
  }, ref) => {
    
    const selectedFont = FONT_OPTIONS.find(f => f.id === font) || FONT_OPTIONS[0];
    const fontFamily = selectedFont.family;

    if (aspectRatio === '16:9') {
      return (
        <div ref={ref} className={`w-full overflow-hidden rounded-lg ${aspectRatioClass}`} style={{ backgroundColor }}>
          <div className="relative flex flex-row items-center h-full p-8 text-left" style={{ color: textColor }}>
            
            <div className="w-2/5 aspect-square flex-shrink-0">
               <img src={imageUrl} alt="Album Art" className="w-full h-full object-cover rounded-xl" style={shadowStyles[imageShadow]} />
            </div>

            <div className="flex-grow flex flex-col justify-center pl-8">
                <h2 style={{ fontFamily, fontSize: `${titleFontSize}px`, fontWeight: titleFontWeight, lineHeight: 1.2, textAlign: 'center', letterSpacing: `${titleLetterSpacing}px`, overflowWrap: 'break-word' }}>{songTitle}</h2>
                <h3 className={`mt-3 opacity-90`} style={{ fontFamily, fontSize: `${artistFontSize}px`, fontWeight: artistFontWeight, textAlign: 'center', letterSpacing: `${artistLetterSpacing}px` }}>{artistName}</h3>
                <div className="w-full flex justify-center">
                    <ListenOnSection text={listenOn} iconSizeClass="h-6 w-6" />
                </div>
            </div>
            
          </div>
        </div>
      );
    }

    const layoutConfig = {
      '1:1': {
        padding: 'p-[8%]',
        imageWidth: 'w-[60%]',
        titleSizeMultiplier: 1,
        iconSizeClass: 'h-6 w-6'
      },
      '9:16': {
        padding: 'p-[10%]',
        imageWidth: 'w-[80%]',
        titleSizeMultiplier: 1.2,
        iconSizeClass: 'h-7 w-7'
      },
    };
    
    const currentConfig = layoutConfig[aspectRatio];
    const titleSize = titleFontSize * currentConfig.titleSizeMultiplier;

    return (
      <div ref={ref} className={`w-full overflow-hidden rounded-lg ${aspectRatioClass}`} style={{ backgroundColor }}>
        <div className={`relative flex flex-col items-center justify-around h-full ${currentConfig.padding} text-center`} style={{ color: textColor }}>
          
          <div className="w-full">
            <h2 style={{ fontFamily, fontSize: `${titleSize}px`, fontWeight: titleFontWeight, lineHeight: 1.2, letterSpacing: `${titleLetterSpacing}px`, overflowWrap: 'break-word' }}>{songTitle}</h2>
          </div>

          <div className={`w-full flex items-center justify-center min-h-0 my-4`}>
            <div className={`${currentConfig.imageWidth} aspect-square`}>
                <img 
                src={imageUrl} 
                alt="Album Art" 
                className="w-full h-full object-cover rounded-2xl"
                style={shadowStyles[imageShadow]}
                />
            </div>
          </div>

          <div className="w-full">
             <h3 className={`opacity-80`} style={{ fontFamily, fontSize: `${artistFontSize}px`, fontWeight: artistFontWeight, letterSpacing: `${artistLetterSpacing}px` }}>{artistName}</h3>
             <ListenOnSection text={listenOn} iconSizeClass={currentConfig.iconSizeClass}/>
          </div>

        </div>
      </div>
    );
  }
);

export default PreviewCard;