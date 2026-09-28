import React, { useState } from "react";
import { Outfit } from "../types";
import { colorLabels, garmentTypeLabels } from "../data/labels";
import { ImageWithFallback } from "./ImageWithFallback";
import { Tag } from "./ui";
import { ArrowRight, Check } from "lucide-react";

interface OutfitCardProps {
  outfit: Outfit;
  variants?: Outfit[];
  rank?: number;
  reasons?: string[];
  onSelect: (outfit: Outfit) => void;
}

export const OutfitCard: React.FC<OutfitCardProps> = ({ outfit, variants, rank, reasons, onSelect }) => {
  const available = variants?.length ? variants : [outfit];
  const [selectedId, setSelectedId] = useState(outfit.id);
  const selected = available.find((item) => item.id === selectedId) || outfit;

  return (
    <div className="group text-left flex flex-col glass border border-white/8 rounded-3xl overflow-hidden transition-all duration-500 hover:-translate-y-1.5 hover:border-nghe/40 hover:shadow-2xl hover:shadow-nghe/10">
      <button type="button" onClick={() => onSelect(selected)} className="relative aspect-3/4 overflow-hidden spotlight cursor-pointer">
        <ImageWithFallback
          src={selected.image}
          alt={selected.name}
          className="w-full h-full object-contain p-2 group-hover:scale-[1.03] transition-transform duration-300"
        />
        <div className="absolute top-3 left-3 right-3 flex justify-between gap-2">
          {rank ? (
            <span className="w-9 h-9 rounded-full bg-gradient-to-br from-[#fff1c7] to-nghe text-[#1a120c] font-display font-bold flex items-center justify-center shadow-lg shadow-black/40">{rank}</span>
          ) : <span />}
          {selected.imageLabel === "minh_hoa_AI" && <Tag>Minh họa AI</Tag>}
        </div>
      </button>

      <div className="flex flex-col flex-1 p-4 gap-3">
        <div>
          <p className="text-[11px] font-semibold text-nghe uppercase tracking-[0.2em]">{garmentTypeLabels[selected.garmentType]}</p>
          <h3 className="text-lg font-bold text-muc mt-0.5">{selected.name}</h3>
        </div>

        <div className="flex flex-wrap gap-1.5" aria-label="Chọn màu">
          {available.map((item) => {
            const color = item.colors[0];
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedId(item.id)}
                title={colorLabels[color].label}
                aria-label={`Chọn màu ${colorLabels[color].label}`}
                aria-pressed={selected.id === item.id}
                className={`w-6 h-6 rounded-full border-2 cursor-pointer ${selected.id === item.id ? "border-son ring-2 ring-son/30" : "border-vien"}`}
                style={{ backgroundColor: colorLabels[color].hex }}
              />
            );
          })}
        </div>

        {reasons && reasons.length > 0 && (
          <ul className="space-y-1">
            {reasons.map((reason) => (
              <li key={reason} className="flex items-center gap-1.5 text-sm text-muc-nhat">
                <Check className="w-3.5 h-3.5 text-ngoc shrink-0" />{reason}
              </li>
            ))}
          </ul>
        )}

        <button type="button" onClick={() => onSelect(selected)} className="mt-auto inline-flex items-center gap-1.5 text-sm font-semibold text-son hover:gap-2.5 transition-all cursor-pointer">
          Thử mẫu này <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
