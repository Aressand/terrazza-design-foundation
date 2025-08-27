import { useState } from "react";
import { cn } from "@/lib/utils";

interface MobileOptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  onLoad?: () => void;
  onError?: () => void;
}

const MobileOptimizedImage = ({
  src,
  alt,
  className,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  priority = false,
  onLoad,
  onError
}: MobileOptimizedImageProps) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const handleLoad = () => {
    setLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setError(true);
    onError?.();
  };

  return (
    <div className="relative overflow-hidden">
      {/* Loading skeleton */}
      {!loaded && !error && (
        <div className={cn(
          "absolute inset-0 bg-gradient-to-r from-stone-light via-muted to-stone-light bg-[length:200%_100%] animate-pulse",
          className
        )} />
      )}
      
      <img
        src={src}
        alt={alt}
        className={cn(
          "transition-opacity duration-300",
          loaded ? "opacity-100" : "opacity-0",
          className
        )}
        sizes={sizes}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        onLoad={handleLoad}
        onError={handleError}
        style={{
          // Optimize for mobile performance
          willChange: loaded ? 'auto' : 'opacity',
          transform: 'translateZ(0)', // Force hardware acceleration
        }}
      />
      
      {/* Error fallback */}
      {error && (
        <div className={cn(
          "flex items-center justify-center bg-muted text-muted-foreground",
          className
        )}>
          <span>Image not available</span>
        </div>
      )}
    </div>
  );
};

export default MobileOptimizedImage;