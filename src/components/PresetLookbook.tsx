import React, { useState } from "react";
import { useApp } from "../state/AppContext";
import { presetLooks, PresetLook } from "../data/presetLooks";
import { outfits } from "../data/outfits";
import { ageRangeLabels, eventLabels, genderLabels, styleLabels } from "../data/labels";
import { suggestLook, LookSuggestion } from "../services/geminiText";
import { ImageWithFallback } from "./ImageWithFallback";
import { FolkAvatar } from "./FolkAvatar";
import { Button, Card, Chip } from "./ui";
import { ArrowRight, Sparkles, Wand2 } from "lucide-react";

/** 10 lookbook mẫu dựng sẵn + ô nhờ Gemini chọn giúp (chữ vào, chữ ra) */
export const PresetLookbook: React.FC = () => {
  const { filters, updateFilters, setSelectedOutfitId, goTo } = useApp();
  const [gender, setGender] = useState<"nam" | "nu" | null>(
    filters.gender === "nam" || filters.gender === "nu" ? filters.gender : null
  );
  const [freeText, setFreeText] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<LookSuggestion | null>(null);
  const [error, setError] = useState<string | null>(null);

  const list = presetLooks.filter((l) => !gender || l.gender === gender);
  const picked = suggestion ? presetLooks.find((l) => l.id === suggestion.lookId) : null;

  const askGemini = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await suggestLook({
        gender,
        event: filters.event,
        styles: filters.styles,
        ageRangeLabel: filters.ageRange ? ageRangeLabels[filters.ageRange] : null,
        freeText: freeText.trim(),
      });
      setSuggestion(result);
      document.getElementById(`look-${result.lookId}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const tryLook = (look: PresetLook) => {
    updateFilters({ gender: look.gender, event: look.event, styles: look.styles });
    setSelectedOutfitId(look.outfitId);
    goTo("studio");
  };

  return (
    <div className="space-y-8">
      {/* Gemini chọn giúp */}
      <Card className="p-5 sm:p-6 bg-nghe-nhat border-nghe/30">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-5 h-5 text-nghe" />
          <h2 className="text-lg font-bold text-muc">Chưa biết chọn mẫu nào? Để app chọn giúp</h2>
        </div>
        <p className="text-sm text-muc-nhat mb-4">Kể ngắn gọn gu của bạn, app sẽ chọn 1 mẫu hợp nhất trong 10 mẫu bên dưới.</p>
        <div className="flex flex-wrap gap-2 mb-3">
          <Chip selected={gender === null} onClick={() => setGender(null)}>
            Tất cả
          </Chip>
          {(["nu", "nam"] as const).map((g) => (
            <Chip key={g} selected={gender === g} onClick={() => setGender(g)}>
              {genderLabels[g]}
            </Chip>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            value={freeText}
            onChange={(e) => setFreeText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !loading && askGemini()}
            maxLength={200}
            placeholder="VD: mình thích chụp ảnh phố cổ, tông hồng nhẹ nhàng"
            className="flex-1 px-4 py-3 rounded-full border border-vien bg-giay focus:outline-none focus:border-son"
          />
          <Button onClick={askGemini} disabled={loading}>
            <Wand2 className="w-4 h-4" /> {loading ? "Đang chọn…" : "Gợi ý cho tôi"}
          </Button>
        </div>
        {error && <p className="text-sm text-son mt-3">{error}</p>}
        {picked && suggestion && (
          <div className="mt-4 flex items-center gap-3 p-4 rounded-2xl bg-giay border border-vien">
            <FolkAvatar gender={picked.gender} age={filters.ageRange ?? picked.ageHint} className="w-14 h-18 shrink-0" />
            <div className="flex-1">
              <p className="font-bold text-muc">
                Gợi ý cho bạn: <span className="text-son">{picked.title}</span>
              </p>
              <p className="text-sm text-muc mt-0.5">{suggestion.reason}</p>
            </div>
            <Button className="shrink-0" onClick={() => tryLook(picked)}>
              Thử ngay <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </Card>

      {/* 10 mẫu */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {list.map((look) => {
          const outfit = outfits.find((o) => o.id === look.outfitId);
          const highlighted = suggestion?.lookId === look.id;
          return (
            <Card
              key={look.id}
              id={`look-${look.id}`}
              className={`overflow-hidden flex flex-col transition-shadow ${highlighted ? "ring-2 ring-nghe border-nghe shadow-lg" : ""}`}
            >
              <div className="relative aspect-4/5 spotlight">
                <ImageWithFallback src={outfit?.image} alt={look.title} className="w-full h-full p-3" />
                <FolkAvatar
                  gender={look.gender}
                  age={look.ageHint}
                  className="absolute bottom-2 right-2 w-16 h-20 drop-shadow"
                />
                {highlighted && (
                  <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-nghe text-muc text-xs font-bold">
                    ✨ Hợp với bạn
                  </span>
                )}
              </div>
              <div className="p-4 flex flex-col gap-2 flex-1">
                <h3 className="text-lg font-bold text-muc">{look.title}</h3>
                <p className="text-sm text-muc-nhat italic">{look.vibe}</p>
                <div className="flex flex-wrap gap-1.5">
                  <span className="px-2.5 py-0.5 rounded-full bg-son-nhat text-son text-xs font-semibold">
                    {eventLabels[look.event]}
                  </span>
                  {look.styles.map((s) => (
                    <span key={s} className="px-2.5 py-0.5 rounded-full bg-kem border border-vien text-xs text-muc">
                      {styleLabels[s]}
                    </span>
                  ))}
                </div>
                <p className="text-sm text-muc">
                  <span className="font-semibold">Phối thêm: </span>
                  {look.tips}
                </p>
                <Button className="mt-auto" variant={highlighted ? "primary" : "secondary"} onClick={() => tryLook(look)}>
                  Thử bộ này <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
