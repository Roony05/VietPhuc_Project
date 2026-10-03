import React from "react";
import { useApp } from "../state/AppContext";
import { outfits } from "../data/outfits";
import { filterSummary } from "../data/labels";
import { recommendOutfits } from "../logic/recommend";
import { OutfitCard } from "../components/OutfitCard";
import { FlowHeader } from "../components/Flow";
import { Button, Card, PageTitle } from "../components/ui";
import { ArrowLeft, CloudSun, LayoutGrid, SearchX } from "lucide-react";
import { weatherAdvice } from "../logic/weather";
import { Outfit } from "../types";

export const RecommendScreen: React.FC = () => {
  const { goTo, filters, setSelectedOutfitId } = useApp();
  const results = recommendOutfits(filters, outfits);

  const chips = filterSummary(filters);
  const advice = filters.weather ? weatherAdvice(filters.weather) : null;

  const choose = (o: Outfit) => {
    setSelectedOutfitId(o.id);
    goTo("studio");
  };

  return (
    <>
      <FlowHeader current={1} back={() => goTo("filter")} />
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-10">
      <PageTitle
        title={results.length > 0 ? `${results.length} bộ hợp với bạn nhất` : "Chưa tìm thấy bộ phù hợp"}
        description="Xếp theo mức hợp với dịp mặc, phong cách và màu bạn chọn. Bấm vào một bộ để thử."
        action={
          <Button variant="secondary" onClick={() => goTo("filter")}>
            <ArrowLeft className="w-4 h-4" /> Sửa lựa chọn
          </Button>
        }
      />

      {chips.length > 0 && (
        <div className="flex flex-wrap gap-1.5 -mt-4 mb-8">
          {chips.map((c) => (
            <span key={c} className="px-3 py-1 rounded-full bg-giay border border-vien text-sm text-muc">
              {c}
            </span>
          ))}
        </div>
      )}

      {advice && (
        <Card className="p-5 mb-8 flex gap-4 items-start">
          <span className="w-11 h-11 rounded-2xl bg-nghe-nhat text-nghe flex items-center justify-center shrink-0">
            <CloudSun className="w-5 h-5" />
          </span>
          <div className="min-w-0">
            <p className="font-semibold text-muc">
              {advice.headline}
              <span className="ml-2 text-[11px] font-normal text-muc-nhat">
                {filters.weather?.source === "forecast" ? "Dự báo" : "Ước tính theo mùa"}
              </span>
            </p>
            <ul className="mt-1.5 space-y-1 text-sm text-muc-nhat list-disc pl-4">
              {advice.tips.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
        </Card>
      )}

      {results.length === 0 ? (
        <Card className="p-10 text-center">
          <SearchX className="w-10 h-10 text-muc-nhat mx-auto mb-4" />
          <p className="text-muc mb-6">Thư viện chưa có mẫu khớp với lựa chọn này. Thử bỏ bớt vài điều kiện nhé.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button variant="secondary" onClick={() => goTo("filter")}>
              Sửa lựa chọn
            </Button>
            <Button onClick={() => goTo("gallery")}>
              <LayoutGrid className="w-4 h-4" /> Xem cả thư viện
            </Button>
          </div>
        </Card>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((r, i) => (
              <OutfitCard key={r.outfit.familyId} outfit={r.outfit} variants={outfits.filter((item) => item.familyId === r.outfit.familyId)} rank={i + 1} reasons={r.reasons} onSelect={choose} />
            ))}
          </div>
          <p className="text-center text-sm text-muc-nhat mt-10">
            Chưa ưng?{" "}
            <button onClick={() => goTo("gallery")} className="font-semibold text-son hover:underline cursor-pointer">
              Xem toàn bộ thư viện
            </button>
          </p>
        </>
      )}
    </div>
    </>
  );
};
