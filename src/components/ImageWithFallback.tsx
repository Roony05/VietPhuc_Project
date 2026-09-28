import React, { useState } from "react";
import { Image as ImageIcon } from "lucide-react";

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackTitle?: string;
  badge?: string;
}

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt = "Hình ảnh",
  className = "",
  fallbackTitle,
  badge,
  ...props
}) => {
  const [hasError, setHasError] = useState(false);
  const displayName = fallbackTitle || alt || "Món đồ";

  if (hasError || !src) {
    return (
      <div
        className={`relative flex flex-col items-center justify-center p-3 text-center bg-[#FDFBF7] border-2 border-dashed border-[#E2D9C8] rounded-xl text-stone-600 ${className}`}
        style={{ minHeight: "140px" }}
      >
        {badge && (
          <span className="absolute top-2 right-2 text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
            {badge}
          </span>
        )}
        <div className="w-10 h-10 rounded-full bg-[#F3ECE1] flex items-center justify-center text-[#9E896A] mb-2 shadow-inner">
          <ImageIcon className="w-5 h-5" />
        </div>
        <span className="text-xs font-semibold text-stone-700 leading-snug px-1 line-clamp-2">
          {displayName}
        </span>
        <span className="text-[10px] text-stone-400 mt-1">Ảnh minh họa đang cập nhật</span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-xl ${className}`}>
      {badge && (
        <span className="absolute top-2 right-2 z-10 text-[10px] font-medium px-2 py-0.5 rounded-full bg-black/60 text-white backdrop-blur-xs">
          {badge}
        </span>
      )}
      <img
        src={src}
        alt={alt}
        onError={() => setHasError(true)}
        className="w-full h-full object-cover"
        loading="lazy"
        {...props}
      />
    </div>
  );
};
