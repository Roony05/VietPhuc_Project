import React, { useState } from "react";
import { outfits } from "../data/outfits";
import { colorLabels, eventLabels, garmentTypeLabels } from "../data/labels";
import { deleteLookbookItem, loadLookbook } from "../logic/lookbookStorage";
import { MAX_LOOKBOOK_ITEMS } from "../config";
import { LookbookItem } from "../types";
import { presetLooks } from "../data/presetLooks";

const presetCount = presetLooks.length;
import { Button, Chip, PageTitle } from "../components/ui";
import { PresetLookbook } from "../components/PresetLookbook";
import { FrameStudio } from "../components/FrameStudio";
import { BRAND } from "../logic/frames";
import { BookHeart, Columns2, Frame, Trash2, X } from "lucide-react";

export const LookbookScreen: React.FC = () => {
  const [items, setItems] = useState<LookbookItem[]>(() => loadLookbook());
  const [compareMode, setCompareMode] = useState(false);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [showCompare, setShowCompare] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [framing, setFraming] = useState<LookbookItem | null>(null);
  // chưa lưu bộ nào thì mở sẵn tab lookbook mẫu
  const [tab, setTab] = useState<"mau" | "cua_toi">(() => (loadLookbook().length ? "cua_toi" : "mau"));

  const remove = (id: string) => {
    try {
      deleteLookbookItem(id);
      setItems(loadLookbook());
      setCompareIds((prev) => prev.filter((x) => x !== id));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const toggleCompare = (id: string) =>
    setCompareIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length >= 2 ? [prev[1], id] : [...prev, id]
    );

  const compareItems = items.filter((i) => compareIds.includes(i.id));

  const tabs = (
    <div className="flex gap-2 mb-8">
      <Chip selected={tab === "mau"} onClick={() => setTab("mau")}>
        Lookbook mẫu ({presetCount})
      </Chip>
      <Chip selected={tab === "cua_toi"} onClick={() => setTab("cua_toi")}>
        Của tôi ({items.length})
      </Chip>
    </div>
  );

  if (tab === "mau") {
    return (
      <div className="max-w-6xl mx-auto px-4 py-10">
        <PageTitle
          eyebrow="Chọn nhanh, khỏi đắn đo"
          title="Lookbook mẫu"
          description="10 cách phối dựng sẵn cho đủ dịp. Thích mẫu nào thì bấm thử, hoặc để app chọn giúp."
        />
        {tabs}
        <PresetLookbook />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-10">
        <PageTitle title="Lookbook của tôi" />
        {tabs}
        <div className="max-w-md mx-auto py-10 text-center">
          <span className="w-16 h-16 rounded-full bg-son-nhat text-son flex items-center justify-center mx-auto mb-5">
            <BookHeart className="w-7 h-7" />
          </span>
          <p className="text-muc-nhat mb-8">Thử đồ xong, bấm “Lưu vào lookbook” để giữ lại những bộ bạn thích.</p>
          <Button onClick={() => setTab("mau")}>Xem lookbook mẫu</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <PageTitle
        eyebrow={`${items.length}/${MAX_LOOKBOOK_ITEMS} bộ · lưu trên trình duyệt này`}
        title="Lookbook của tôi"
        action={
          <div className="flex gap-2">
            {compareMode && (
              <Button disabled={compareIds.length !== 2} onClick={() => setShowCompare(true)}>
                So sánh ({compareIds.length}/2)
              </Button>
            )}
            <Button
              variant="secondary"
              onClick={() => {
                setCompareMode(!compareMode);
                setCompareIds([]);
              }}
            >
              <Columns2 className="w-4 h-4" /> {compareMode ? "Xong" : "So sánh"}
            </Button>
          </div>
        }
      />

      {tabs}
      {compareMode && <p className="-mt-4 mb-6 text-sm text-muc-nhat">Chạm chọn đúng 2 bộ để so sánh.</p>}
      {error && <p className="mb-4 text-sm text-son">{error}</p>}

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-10 p-2">
        {items.map((item, i) => {
          const outfit = outfits.find((o) => o.id === item.outfitId);
          const picked = compareIds.includes(item.id);
          const tilt = ["-rotate-2", "rotate-1", "-rotate-1", "rotate-2"][i % 4];
          return (
            <figure
              key={item.id}
              className={`bg-white p-3 pb-4 shadow-2xl shadow-black/50 transition-transform hover:rotate-0 hover:scale-[1.02] ${tilt} ${
                picked ? "ring-4 ring-son" : ""
              }`}
            >
              <button
                type="button"
                disabled={!compareMode}
                onClick={() => toggleCompare(item.id)}
                className="relative block w-full aspect-3/4 bg-kem disabled:cursor-default cursor-pointer"
              >
                <img src={item.imageDataUrl} alt={outfit?.name || "Bộ phối"} className="w-full h-full object-cover" />
                {compareMode && (
                  <span
                    className={`absolute top-2 right-2 w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold ${
                      picked ? "bg-son text-white" : "bg-black/30"
                    }`}
                  >
                    {picked ? compareIds.indexOf(item.id) + 1 : ""}
                  </span>
                )}
              </button>
              <figcaption className="pt-3 text-center">
                <p className="font-display italic font-bold text-[#2b2118]">{outfit?.name || "Bộ đồ không còn trong thư viện"}</p>
                {item.note && <p className="text-sm text-[#7a6a5c] italic">“{item.note}”</p>}
                <p className="text-[11px] text-[#7a6a5c] mt-1">
                  {BRAND} · {new Date(item.createdAt).toLocaleDateString("vi-VN")}
                </p>
                <div className="flex gap-2 mt-3">
                  <Button className="flex-1 px-3!" onClick={() => setFraming(item)}>
                    <Frame className="w-4 h-4" /> Đóng khung
                  </Button>
                  <Button variant="ghost" className="px-3!" onClick={() => remove(item.id)} aria-label="Xóa">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </figcaption>
            </figure>
          );
        })}
      </div>

      {framing && (
        <FrameStudio
          imageDataUrl={framing.imageDataUrl}
          title={outfits.find((o) => o.id === framing.outfitId)?.name || "Việt phục"}
          onClose={() => setFraming(null)}
        />
      )}

      {showCompare && compareItems.length === 2 && (
        <div className="fixed inset-0 z-50 bg-muc/60 flex items-center justify-center p-4" onClick={() => setShowCompare(false)}>
          <div
            className="bg-kem rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-5 sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-muc">So sánh 2 bộ phối</h2>
              <button onClick={() => setShowCompare(false)} className="p-2 rounded-full hover:bg-vien/50 cursor-pointer" aria-label="Đóng">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:gap-6">
              {compareItems.map((item) => {
                const outfit = outfits.find((o) => o.id === item.outfitId);
                const rows: [string, React.ReactNode][] = [
                  ["Loại", outfit ? garmentTypeLabels[outfit.garmentType] : "—"],
                  ["Màu", outfit ? outfit.colors.map((c) => colorLabels[c].label).join(", ") : "—"],
                  ["Hợp dịp", outfit ? outfit.events.map((e) => eventLabels[e]).join(", ") : "—"],
                ];
                return (
                  <div key={item.id} className="space-y-3">
                    <img src={item.imageDataUrl} alt={outfit?.name || "Bộ phối"} className="w-full aspect-3/4 object-cover rounded-2xl" />
                    <h3 className="font-bold text-muc">{outfit?.name || "—"}</h3>
                    <dl className="text-sm space-y-2">
                      {rows.map(([label, value]) => (
                        <div key={label}>
                          <dt className="text-xs text-muc-nhat">{label}</dt>
                          <dd className="text-muc">{value}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
