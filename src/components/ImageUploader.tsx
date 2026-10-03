'use client';

import React, { useState, useRef } from 'react';

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  folder?: string;
  maxFiles?: number;
}

export default function ImageUploader({
  images = [],
  onChange,
  folder = 'raw-stitches/products',
  maxFiles = 8,
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    await uploadFiles(Array.from(files));
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function uploadFiles(files: File[]) {
    if (images.length + files.length > maxFiles) {
      setError(`Maximum ${maxFiles} images allowed.`);
      return;
    }

    setUploading(true);
    setError(null);
    setUploadProgress(`Uploading ${files.length} image${files.length > 1 ? 's' : ''} to Cloudinary...`);

    try {
      const formData = new FormData();
      files.forEach(file => formData.append('file', file));
      formData.append('folder', folder);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to upload images');
      }

      let newUrls: string[] = [];
      if (data.images && Array.isArray(data.images)) {
        newUrls = data.images.map((img: { secure_url: string }) => img.secure_url);
      } else if (data.secure_url) {
        newUrls = [data.secure_url];
      }

      onChange([...images, ...newUrls]);
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err?.message || 'Error uploading file to Cloudinary');
    } finally {
      setUploading(false);
      setUploadProgress(null);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    if (uploading) return;
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    if (files.length > 0) {
      uploadFiles(files);
    }
  }

  function handleRemove(index: number) {
    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages);
  }

  function setPrimary(index: number) {
    if (index === 0) return;
    const target = images[index];
    const filtered = images.filter((_, i) => i !== index);
    onChange([target, ...filtered]);
  }

  function handleAddUrl() {
    if (!urlInput.trim()) return;
    onChange([...images, urlInput.trim()]);
    setUrlInput('');
    setShowUrlInput(false);
  }

  return (
    <div className="space-y-4">
      {/* Previews grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {images.map((img, i) => (
          <div
            key={i}
            className="relative group aspect-[3/4] bg-stone-100 rounded-sm overflow-hidden border border-border"
          >
            <img
              src={img}
              alt={`Product preview ${i + 1}`}
              className="w-full h-full object-cover"
            />

            {/* Badges */}
            {i === 0 && (
              <span className="absolute top-1.5 left-1.5 bg-amber-500 text-black text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 shadow-sm rounded-xs">
                Primary
              </span>
            )}

            {/* Hover actions */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
              {i !== 0 && (
                <button
                  type="button"
                  onClick={() => setPrimary(i)}
                  className="text-white text-xs bg-black/70 hover:bg-black px-2.5 py-1 rounded transition-colors"
                >
                  Make Primary
                </button>
              )}
              <button
                type="button"
                onClick={() => handleRemove(i)}
                className="text-red-400 hover:text-red-300 text-xs bg-red-950/60 px-2.5 py-1 rounded transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        ))}

        {/* Dropzone / Upload button */}
        {images.length < maxFiles && (
          <div
            onDragOver={e => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`aspect-[3/4] border-2 border-dashed rounded-sm flex flex-col items-center justify-center p-4 cursor-pointer transition-all ${
              uploading
                ? 'border-amber-400 bg-amber-50/20'
                : 'border-border hover:border-amber-600 hover:bg-stone-50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              disabled={uploading}
            />

            {uploading ? (
              <div className="flex flex-col items-center text-center">
                <div className="w-6 h-6 border-2 border-amber-600 border-t-transparent rounded-full animate-spin mb-2" />
                <span className="text-[11px] font-sans text-stone-600">Uploading...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center text-center">
                <svg
                  className="w-7 h-7 text-stone-400 mb-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 165v-9m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z"
                  />
                </svg>
                <span className="text-xs font-medium text-stone-700 font-sans">
                  Upload Photo
                </span>
                <span className="text-[10px] text-stone-400 mt-0.5 font-sans">
                  Drop files or click
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Upload progress indicator */}
      {uploadProgress && (
        <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 px-3 py-2 rounded">
          <div className="w-3.5 h-3.5 border-2 border-amber-600 border-t-transparent rounded-full animate-spin shrink-0" />
          <span>{uploadProgress}</span>
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded">
          {error}
        </div>
      )}

      {/* Additional URL option */}
      <div className="flex items-center justify-between pt-1">
        <p className="text-xs text-stone-400 font-sans">
          Recommended: 800×1000px (4:5 ratio). Powered by Cloudinary CDN.
        </p>
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="text-xs text-stone-500 hover:text-stone-800 underline font-sans"
        >
          {showUrlInput ? 'Cancel URL' : '+ Add via URL'}
        </button>
      </div>

      {showUrlInput && (
        <div className="flex gap-2">
          <input
            type="url"
            value={urlInput}
            onChange={e => setUrlInput(e.target.value)}
            placeholder="https://..."
            className="flex-1 px-3 py-1.5 border border-border text-xs focus:border-amber-500 focus:outline-none rounded-xs"
          />
          <button
            type="button"
            onClick={handleAddUrl}
            className="px-3 py-1.5 bg-stone-800 text-white text-xs hover:bg-stone-900 rounded-xs"
          >
            Add
          </button>
        </div>
      )}
    </div>
  );
}
