import React, { useEffect, useState } from "react";
import { useApp } from "../state/AppContext";
import { outfits } from "../data/outfits";
import { ageRangeLabels, colorLabels, eventLabels, garmentTypeLabels, styleLabels } from "../data/labels";
import { getPersonality, PersonalityTip } from "../services/geminiText";
import { CultureCard, PersonalityCard } from "../components/CultureCard";
import { AccessoryAdvice } from "../components/AccessoryAdvice";
import { FlowHeader } from "../components/Flow";
import { Button, Card, PageTitle } from "../components/ui";
import { Wand2 } from "lucide-react";

/** Trang Kết quả: ảnh vừa ghép + Có thể bạn chưa biết + Phong thái + phụ kiện nên / không nên */
export const ResultScreen: React.FC = () => {
  const { activeImage, history, setActiveImageId, setSelectedOutfitId, filters, goTo } = useApp();
  const [tip, setTip] = useState<PersonalityTip | null>(null);
  const [tipLoading, setTipLoading] = useState(false);

  const outfit = outfits.find((o) => o.id === activeImage?.outfitId);
  const gender =
    outfit && outfit.gender !== "unisex" ? outfit.gender : filters.gender === "nam" || filters.gender === "nu" ? filters.gender : null;

  // lời khen phong thái cho bộ đồ vừa ghép (server luôn có câu dự phòng)
  useEffect(() => {
    if (!outfit) return;
    let cancelled = false;
    setTipLoading(true);
    getPersonality({
      gender,
      garmentType: outfit.garmentType,
      garmentLabel: garmentTypeLabels[outfit.garmentType],
      colorLabel: outfit.colors[0] ? colorLabels[outfit.colors[0]].label : null,
      eventLabel: filters.event ? eventLabels[filters.event] : null,
      styleLabels: filters.styles.map((s) => styleLabels[s]),
      ageRangeLabel: filters.ageRange ? ageRangeLabels[filters.ageRange] : null,
      heightCm: filters.heightCm,
      weightKg: filters.weightKg,
    })
      .then((t) => !cancelled && setTip(t))
      .catch(() => !cancelled && setTip(null))
      .finally(() => !cancelled && setTipLoading(false));
    return () => {
      cancelled = true;
    };
  }, [outfit?.id]);

  if (!activeImage || !outfit) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <Wand2 className="w-10 h-10 text-muc-nhat mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-muc mb-3">Chưa có ảnh ghép</h1>
        <p className="text-muc-nhat mb-8">Vào phòng thử đồ, chọn ảnh của bạn rồi bấm Ghép ảnh nhé.</p>
        <Button onClick={() => goTo("studio")}>Vào phòng thử đồ</Button>
      </div>
    );
  }

  return (
    <>
      <FlowHeader current={3} back={() => goTo("studio")} next={{ label: "Tiếp tục", onClick: () => goTo("finish") }} />
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-10">
      <PageTitle title="Ảnh của bạn đây" description={`${outfit.name}. Xem thêm câu chuyện bộ áo và cách phối phụ kiện bên dưới.`} />

      <div className="grid lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)] gap-6 items-start">
        {/* ẢNH GHÉP */}
        <div className="lg:sticky lg:top-24 space-y-3 min-w-0">
          <Card className="p-3">
            <div className="rounded-2xl overflow-hidden bg-kem">
              <img src={activeImage.dataUrl} alt={`Ảnh thử ${outfit.name}`} className="w-full h-auto max-h-[75vh] object-contain mx-auto" />
            </div>
          </Card>
          {history.length > 1 && (
            <div>
              <p className="text-xs text-muc-nhat mb-2">Các ảnh đã ghép trong phiên</p>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {history.map((h) => (
                  <button
                    key={h.id}
                    onClick={() => {
                      setActiveImageId(h.id);
                      setSelectedOutfitId(h.outfitId);
                    }}
                    title={h.instruction}
                    className={`w-14 h-[4.5rem] shrink-0 rounded-lg overflow-hidden border-2 cursor-pointer ${
                      h.id === activeImage.id ? "border-son" : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={h.dataUrl} alt={h.instruction} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* THÔNG TIN */}
        <div className="space-y-6 min-w-0">
          <PersonalityCard tip={tip} loading={tipLoading} gender={gender} age={filters.ageRange} />
          <CultureCard outfit={outfit} />
          <AccessoryAdvice outfit={outfit} event={filters.event} gender={gender} />
        </div>
      </div>

    </div>
    </>
  );
};
