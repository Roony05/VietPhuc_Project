import React from "react";
import { Outfit } from "../types";
import { garmentTypeLabels, genderLabels } from "../data/labels";
import { ImageWithFallback } from "./ImageWithFallback";
import { ArrowRight, Check } from "lucide-react";

interface OutfitCardProps {
  outfit: Outfit;
  isSelected?: boolean;
  score?: number;
  matchReasons?: string[];
  showReasons?: boolean;
  onSelect?: (outfit: Outfit) => void;
  actionLabel?: string;
}

export const OutfitCard: React.FC<OutfitCardProps> = ({
  outfit,
  isSelected = false,
  score,
  matchReasons,
  showReasons = false,
  onSelect,
  actionLabel = "Chọn bộ này",
}) => {
  return (
    <div
      className={`group flex flex-col bg-[#FFFDF9] border rounded-2xl overflow-hidden transition-all duration-200 ${
        isSelected
          ? "border-[#991B1B] ring-2 ring-red-200 shadow-md"
          : "border-[#E7DECD] hover:border-stone-300 hover:shadow-md"
      }`}
    >
      {/* Hình ảnh bộ đồ */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-stone-100">
        <ImageWithFallback
          src={outfit.image}
          alt={outfit.name}
          fallbackTitle={outfit.name}
          badge={outfit.imageLabel === "minh_hoa_AI" ? "Ảnh AI" : undefined}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-102"
        />

        {/* Huy hiệu giới tính và loại trang phục */}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1 z-10">
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-black/60 text-white backdrop-blur-xs">
            {genderLabels[outfit.gender]}
          </span>
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/90 text-stone-800 backdrop-blur-xs border border-stone-200">
            {garmentTypeLabels[outfit.garmentType]}
          </span>
        </div>

        {/* Điểm tương thích nếu có (dùng ở màn recommend) */}
        {typeof score === "number" && (
          <div className="absolute top-2.5 right-2.5 z-10">
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500 text-white shadow-xs">
              {score}% hợp
            </span>
          </div>
        )}
      </div>

      {/* Nội dung thông tin bộ đồ */}
      <div className="flex flex-col flex-1 p-3.5 sm:p-4">
        <h3 className="font-serif font-bold text-sm sm:text-base text-stone-900 line-clamp-1 mb-1">
          {outfit.name}
        </h3>

        {/* Lý do phù hợp (chỉ hiện khi showReasons = true) */}
        {showReasons && matchReasons && matchReasons.length > 0 && (
          <div className="mt-2 mb-3 p-2 rounded-lg bg-red-50/70 border border-red-100 text-[11px] text-red-900 space-y-1">
            {matchReasons.map((reason, idx) => (
              <div key={idx} className="flex items-start gap-1">
                <span className="text-[#991B1B] font-bold">•</span>
                <span>{reason}</span>
              </div>
            ))}
          </div>
        )}

        {/* Nút hành động */}
        <div className="mt-auto pt-3">
          <button
            type="button"
            onClick={() => onSelect?.(outfit)}
            className={`w-full py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              isSelected
                ? "bg-red-800 text-white shadow-xs"
                : "bg-[#991B1B] text-white hover:bg-red-800 active:scale-[0.99] shadow-xs"
            }`}
          >
            {isSelected ? (
              <>
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Đã chọn</span>
              </>
            ) : (
              <>
                <span>{actionLabel}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
