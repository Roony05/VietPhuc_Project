import React from "react";
import { Accessory, RuleLevel } from "../types";
import { ImageWithFallback } from "./ImageWithFallback";
import { Check, AlertTriangle } from "lucide-react";

interface AccessoryChipProps {
  accessory: Accessory;
  level: RuleLevel;
  reason: string;
  selected: boolean;
  onToggle: (id: string) => void;
}

export const AccessoryChip: React.FC<AccessoryChipProps> = ({
  accessory,
  level,
  reason,
  selected,
  onToggle,
}) => {
  // Cấu hình huy hiệu màu theo RuleLevel:
  // hop_truyen_thong = xanh lá "Hợp truyền thống"
  // remix_duoc = tím "Remix được"
  // nen_tranh = cam "Nên tránh"
  // chua_co_du_lieu = xám "Chưa có dữ liệu"
  const getBadgeConfig = () => {
    switch (level) {
      case "hop_truyen_thong":
        return {
          text: "Hợp truyền thống",
          badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-200",
          ringColor: "ring-emerald-400",
        };
      case "remix_duoc":
        return {
          text: "Remix được",
          badgeClass: "bg-purple-100 text-purple-800 border-purple-200",
          ringColor: "ring-purple-400",
        };
      case "nen_tranh":
        return {
          text: "Nên tránh",
          badgeClass: "bg-amber-100 text-amber-900 border-amber-300 font-semibold",
          ringColor: "ring-amber-500",
        };
      case "chua_co_du_lieu":
      default:
        return {
          text: "Chưa có dữ liệu",
          badgeClass: "bg-stone-100 text-stone-600 border-stone-200",
          ringColor: "ring-stone-400",
        };
    }
  };

  const badgeConfig = getBadgeConfig();
  const isNenTranh = level === "nen_tranh";

  return (
    <div className="flex flex-col">
      <button
        type="button"
        onClick={() => onToggle(accessory.id)}
        className={`flex items-center gap-3 p-3 rounded-2xl border text-left transition-all cursor-pointer relative bg-white ${
          selected
            ? isNenTranh
              ? "border-amber-500 bg-amber-50/40 ring-2 ring-amber-300 shadow-xs"
              : "border-[#991B1B] bg-red-50/40 ring-2 ring-red-200 shadow-xs"
            : "border-stone-200 hover:border-stone-300 hover:bg-stone-50/80"
        }`}
      >
        {/* Ảnh nhỏ phụ kiện */}
        <div className="w-14 h-14 rounded-xl overflow-hidden bg-stone-100 shrink-0 border border-stone-100 p-1 flex items-center justify-center">
          <ImageWithFallback
            src={accessory.image}
            alt={accessory.name}
            fallbackTitle={accessory.name}
            className="w-full h-full object-contain"
          />
        </div>

        {/* Thông tin tên và huy hiệu */}
        <div className="flex-1 min-w-0 pr-1">
          <div className="flex items-center justify-between gap-1 mb-1.5">
            <span className="text-xs sm:text-sm font-bold text-stone-900 truncate">
              {accessory.name}
            </span>
            <div
              className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 transition-colors ${
                selected
                  ? isNenTranh
                    ? "bg-amber-600 border-amber-600 text-white"
                    : "bg-[#991B1B] border-[#991B1B] text-white"
                  : "border-stone-300 bg-white"
              }`}
            >
              {selected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            </div>
          </div>

          <span
            className={`inline-block text-[11px] font-medium px-2 py-0.5 rounded-full border ${badgeConfig.badgeClass}`}
          >
            {badgeConfig.text}
          </span>
        </div>
      </button>

      {/* Cảnh báo khi phụ kiện "nên tránh" được chọn */}
      {selected && isNenTranh && (
        <div className="mt-1.5 px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2 text-xs text-amber-900 animate-fadeIn">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
          <div className="flex-1 leading-snug">
            <span className="font-semibold">Lưu ý văn hóa: </span>
            <span>{reason || "Dịp này nên hạn chế phối cùng phụ kiện này."}</span>
          </div>
        </div>
      )}
    </div>
  );
};
