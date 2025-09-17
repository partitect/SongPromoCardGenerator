import React, { useRef, useState } from 'react';

interface ImageUploaderProps {
  onImageUpload: (file: File) => void;
  currentImage: string | null;
  label: string;
  uploadPrompt: string;
  fileTypes: string;
  changeImagePrompt: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ 
  onImageUpload, 
  currentImage,
  label,
  uploadPrompt,
  fileTypes,
  changeImagePrompt 
}) => {

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImageUpload(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onImageUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>
      <div
        className={`relative mt-1 flex flex-col justify-center items-center border-2 border-dashed rounded-xl cursor-pointer transition-colors duration-200 bg-gradient-to-br from-gray-800 to-gray-700 shadow-lg ${dragActive ? 'border-indigo-400 bg-indigo-950/30' : 'border-gray-600 hover:border-indigo-400'}`}
        style={{ minHeight: 200 }}
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        tabIndex={0}
      >
        {currentImage ? (
          <div className="relative group w-full flex flex-col items-center justify-center">
            <img src={currentImage} alt="Preview" className="max-h-56 max-w-xs rounded-lg shadow-md object-cover transition-transform duration-200 group-hover:scale-105" />
            <button
              type="button"
              className="absolute bottom-3 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-indigo-600 text-white font-semibold text-xs shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-indigo-700 focus:outline-none"
              onClick={handleClick}
              tabIndex={-1}
            >
              {changeImagePrompt}
            </button>
            <div className="absolute inset-0 rounded-lg bg-black bg-opacity-30 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 w-full">
            <svg
              className="mx-auto h-16 w-16 text-indigo-400 mb-3 drop-shadow-lg"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-base font-medium text-gray-200 mb-1">{uploadPrompt}</span>
            <span className="text-xs text-gray-400 mb-2">{fileTypes}</span>
            <span className="text-xs text-gray-500">Sürükleyip bırak veya tıkla</span>
          </div>
        )}
        {dragActive && (
          <div className="absolute inset-0 z-10 rounded-xl border-4 border-indigo-400 bg-indigo-900/20 pointer-events-none animate-pulse" />
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept="image/*"
        onChange={handleFileChange}
      />
    </div>
  );
};

export default ImageUploader;
