'use client';

import React, { useState } from 'react';
import { Package } from 'lucide-react';

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  className?: string;
  fallbackText?: string;
}

export default function ImageWithFallback({ 
  src, 
  alt, 
  className = '', 
  fallbackText = 'No Image' 
}: ImageWithFallbackProps) {
  const [imageError, setImageError] = useState(false);
  const [useProxy, setUseProxy] = useState(false);
  const [useAlternative, setUseAlternative] = useState(false);

  const handleImageError = () => {
    if (!useProxy && src && src.includes('loremflickr.com')) {
      // Try using the proxy first
      setUseProxy(true);
    } else if (!useAlternative && src) {
      // Try alternative image service
      setUseAlternative(true);
    } else {
      // If everything fails, show fallback
      setImageError(true);
    }
  };

  const getImageSrc = () => {
    if (!src) return '';
    
    if (useAlternative && src.includes('loremflickr.com')) {
      // Extract the category from the LoremFlickr URL
      const match = src.match(/loremflickr\.com\/\d+\/\d+\/(.+)$/);
      const category = match ? match[1] : 'product';
      // Use Picsum with a seed based on the category for consistency
      const seed = (category || 'product').split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & 0x7fffffff;
      }, 0);
      return `https://picsum.photos/seed/${Math.abs(seed)}/640/480`;
    }
    
    if (useProxy) {
      return `/api/image-proxy?url=${encodeURIComponent(src)}`;
    }
    
    return src;
  };

  if (imageError || !src) {
    return (
      <div className={`bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center ${className}`}>
        <div className="text-center text-gray-500">
          <Package className="h-12 w-12 mx-auto mb-2 text-gray-400" />
          <p className="text-sm font-medium">{fallbackText}</p>
        </div>
      </div>
    );
  }

  return (
    <img
      src={getImageSrc()}
      alt={alt}
      className={className}
      onError={handleImageError}
      loading="lazy"
    />
  );
}