import React, { useState, useEffect, useRef } from 'react';
import { ImagePlus, Loader2 } from 'lucide-react';

export function EditableText({ 
  value, 
  onChange, 
  tag: Tag = 'span', 
  className = '',
  placeholder = 'Type here...',
  multiline = false
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(value);
  const inputRef = useRef(null);

  useEffect(() => {
    setCurrentValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      if (!multiline) {
        inputRef.current.select();
      }
    }
  }, [isEditing, multiline]);

  const handleBlur = () => {
    setIsEditing(false);
    if (currentValue !== value) {
      onChange(currentValue);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !multiline) {
      handleBlur();
    }
    if (e.key === 'Escape') {
      setCurrentValue(value);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    if (multiline) {
      return (
        <textarea
          ref={inputRef}
          value={currentValue || ''}
          onChange={(e) => setCurrentValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className={`bg-white/90 dark:bg-slate-900/90 border-2 border-teal-500 rounded-lg outline-none px-2 py-1 shadow-lg w-full resize-y text-slate-900 dark:text-white ${className}`}
          placeholder={placeholder}
          rows={3}
        />
      );
    }
    return (
      <input
        ref={inputRef}
        type="text"
        value={currentValue || ''}
        onChange={(e) => setCurrentValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={`bg-white/90 dark:bg-slate-900/90 border-2 border-teal-500 rounded-lg outline-none px-2 py-1 shadow-lg w-full text-slate-900 dark:text-white ${className}`}
        placeholder={placeholder}
      />
    );
  }

  return (
    <Tag 
      className={`hover:outline hover:outline-2 hover:outline-dashed hover:outline-teal-400/50 hover:bg-teal-400/10 cursor-text transition-all rounded px-1 -mx-1 min-h-[1.5em] inline-block ${!value ? 'text-slate-400 italic' : ''} ${className}`}
      onClick={() => setIsEditing(true)}
      title="Click to edit"
    >
      {value || placeholder}
    </Tag>
  );
}

export function EditableImage({ 
  src, 
  onUpload, 
  className = '', 
  fallbackIcon: FallbackIcon = ImagePlus,
  isUploading = false
}) {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file);
    }
    e.target.value = null; // Reset
  };

  return (
    <div 
      className={`group relative overflow-hidden bg-slate-100 dark:bg-slate-800 rounded-3xl flex items-center justify-center cursor-pointer ${className}`}
      onClick={() => !isUploading && fileInputRef.current?.click()}
    >
      <input 
        type="file" 
        accept="image/*" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
      />
      
      {src ? (
        <img src={src} alt="Editable content" className="w-full h-full object-cover transition-opacity group-hover:opacity-50" />
      ) : (
        <FallbackIcon className="w-16 h-16 text-slate-400 transition-transform group-hover:scale-110" />
      )}
      
      <div className={`absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity ${isUploading ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
        {isUploading ? (
          <div className="flex flex-col items-center text-white">
            <Loader2 className="w-8 h-8 animate-spin mb-2" />
            <span className="text-sm font-bold tracking-wider">UPLOADING...</span>
          </div>
        ) : (
          <div className="flex flex-col items-center text-white">
            <ImagePlus className="w-8 h-8 mb-2" />
            <span className="text-sm font-bold tracking-wider">CLICK TO REPLACE</span>
          </div>
        )}
      </div>
    </div>
  );
}
