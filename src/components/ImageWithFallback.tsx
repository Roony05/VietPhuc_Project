import React, { useState } from "react";
import { ImageOff } from "lucide-react";

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackTitle?: string;
}

/** Ảnh có khung dự phòng khi file ảnh chưa có hoặc lỗi */
export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt = "Hình ảnh",
  className = "",
  fallbackTitle,
  ...props
}) => {
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    return (
      <div
        className={`flex flex-col items-center justify-center gap-2 p-3 text-center bg-kem border-2 border-dashed border-vien text-muc-nhat ${className}`}
      >
        <ImageOff className="w-5 h-5" />
        <span className="text-xs font-medium line-clamp-2">{fallbackTitle || alt}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setHasError(true)}
      loading="lazy"
      className={`object-contain ${className}`}
      {...props}
    />
  );
};
