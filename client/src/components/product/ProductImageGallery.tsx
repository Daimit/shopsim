import React, { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';

interface ProductImageGalleryProps {
  mainImage: string;
  images: string[];
  productName: string;
}

export const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({
  mainImage,
  images,
  productName,
}) => {
  // Build gallery list: main image first, then additional gallery images (deduplicated)
  const allImages = [mainImage, ...images.filter((img) => img !== mainImage)];
  const uniqueImages = [...new Set(allImages)];

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const mainImageRef = useRef<HTMLDivElement>(null);

  const selectedImage = uniqueImages[selectedIndex] || mainImage;

  const handlePrev = () => {
    setSelectedIndex((prev) => (prev > 0 ? prev - 1 : uniqueImages.length - 1));
  };

  const handleNext = () => {
    setSelectedIndex((prev) => (prev < uniqueImages.length - 1 ? prev + 1 : 0));
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!mainImageRef.current) return;
    const rect = mainImageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') handlePrev();
    if (e.key === 'ArrowRight') handleNext();
    if (e.key === 'Escape') setIsZoomed(false);
  };

  return (
    <div className="flex flex-col gap-3" onKeyDown={handleKeyDown} tabIndex={0}>
      {/* Main Image Display */}
      <div
        ref={mainImageRef}
        className="relative bg-white rounded-3xl border border-slate-200/90 p-3 sm:p-4 shadow-xs overflow-hidden group cursor-crosshair"
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
        onMouseMove={handleMouseMove}
      >
        {/* Main product image */}
        <div className="aspect-square w-full rounded-2xl overflow-hidden bg-slate-50 relative">
          <img
            src={selectedImage}
            alt={`${productName} - View ${selectedIndex + 1}`}
            className="w-full h-full object-cover object-center transition-transform duration-300"
            loading="eager"
            style={
              isZoomed
                ? {
                    transform: 'scale(2)',
                    transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                  }
                : undefined
            }
          />
        </div>

        {/* Zoom indicator badge */}
        <div className="absolute top-5 right-5 z-10 px-2.5 py-1 bg-white/90 backdrop-blur-sm rounded-full border border-slate-200/80 text-[10px] font-bold text-slate-500 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <ZoomIn className="w-3 h-3" />
          <span>Hover to zoom</span>
        </div>

        {/* Image counter badge */}
        <div className="absolute bottom-5 right-5 z-10 px-2.5 py-1 bg-black/60 backdrop-blur-sm rounded-full text-[10px] font-bold text-white">
          {selectedIndex + 1} / {uniqueImages.length}
        </div>

        {/* Previous/Next navigation arrows */}
        {uniqueImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); handlePrev(); }}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm border border-slate-200/80 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-white shadow-sm opacity-0 group-hover:opacity-100 transition-all"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); handleNext(); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm border border-slate-200/80 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-white shadow-sm opacity-0 group-hover:opacity-100 transition-all"
              aria-label="Next image"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnail Strip (like Amazon/Flipkart) */}
      {uniqueImages.length > 1 && (
        <div className="flex items-center gap-2 px-1">
          {uniqueImages.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setSelectedIndex(idx)}
              onMouseEnter={() => setSelectedIndex(idx)}
              className={`shrink-0 w-16 h-16 sm:w-18 sm:h-18 rounded-xl overflow-hidden border-2 transition-all ${
                idx === selectedIndex
                  ? 'border-blue-600 ring-2 ring-blue-100 shadow-sm'
                  : 'border-slate-200/80 hover:border-slate-300 opacity-70 hover:opacity-100'
              }`}
              aria-label={`View image ${idx + 1}`}
            >
              <img
                src={img}
                alt={`${productName} thumbnail ${idx + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
