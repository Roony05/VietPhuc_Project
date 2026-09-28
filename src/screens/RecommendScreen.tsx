import React from "react";
import { useApp } from "../state/AppContext";
import { outfits } from "../data/outfits";
import { colorLabels, eventLabels, garmentTypeLabels, genderLabels, styleLabels } from "../data/labels";
import { recommendOutfits } from "../logic/recommend";
import { OutfitCard } from "../components/OutfitCard";
import { Sparkles, ArrowLeft, SearchX, LayoutGrid, Info } from "lucide-react";

export const RecommendScreen: React.FC = () => {
  const { goTo, filters, setSelectedOutfitId } = useApp();

  const results = recommendOutfits(filters, outfits);

  const filterChips: string[] = [
    filters.gender ? genderLabels[filters.gender] : null,
    filters.event ? eventLabels[filters.event] : null,
    filters.garmentType ? garmentTypeLabels[filters.garmentType] : null,
    ...filters.styles.map((s) => styleLabels[s]),
    ...filters.colors.map((c) => colorLabels[c].label),
  ].filter((x): x is string => Boolean(x));

  const handleSelect = (outfitId: string) => {
    setSelectedOutfitId(outfitId);
    goTo("studio");
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-8">
        <button
          onClick={() => goTo("filter")}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-800 mb-3 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Sửa bộ lọc</span>
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-stone-900 font-serif">
              {results.length > 0 ? `${results.length} bộ hợp với bạn nhất` : "Gợi ý cho bạn"}
            </h1>
            <p className="text-xs text-stone-500">
              Chấm điểm theo sự kiện, phong cách và màu bạn đã chọn
            </p>
          </div>
        </div>

        {filterChips.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-4">
            {filterChips.map((chip) => (
              <span
                key={chip}
                className="px-2.5 py-1 rounded-full bg-white border border-[#E7DECD] text-stone-700 text-xs font-medium"
              >
                {chip}
              </span>
            ))}
          </div>
        )}
      </div>

      {results.length === 0 ? (
        <div className="bg-[#FFFDF9] border border-[#E7DECD] rounded-2xl p-8 text-center space-y-5">
          <div className="w-14 h-14 rounded-full bg-stone-100 text-stone-500 flex items-center justify-center mx-auto">
            <SearchX className="w-7 h-7" />
          </div>
          <p className="text-sm text-stone-700">
            Chưa có mẫu phù hợp trong thư viện. Thử bỏ bớt bộ lọc nhé.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => goTo("filter")}
              className="px-5 py-2.5 rounded-xl border border-stone-300 text-stone-700 text-sm font-medium hover:bg-stone-50 cursor-pointer"
            >
              Sửa bộ lọc
            </button>
            <button
              onClick={() => goTo("gallery")}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#991B1B] text-white text-sm font-semibold hover:bg-red-800 cursor-pointer"
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Xem toàn bộ thư viện</span>
            </button>
          </div>
        </div>
      ) : (
        <>
          {results.length < 3 && (
            <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
              <Info className="w-4 h-4 shrink-0" />
              <span>Thư viện hiện có ít mẫu phù hợp.</span>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((r) => (
              <OutfitCard
                key={r.outfit.id}
                outfit={r.outfit}
                matchReasons={r.reasons}
                showReasons
                onSelect={(o) => handleSelect(o.id)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};
