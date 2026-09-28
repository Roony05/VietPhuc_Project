import React, { useState } from "react";
import { useApp } from "../state/AppContext";
import { outfits } from "../data/outfits";
import { accessories } from "../data/accessories";
import { colorLabels, eventLabels, garmentTypeLabels, ruleLevelLabels } from "../data/labels";
import { getAccessoryLevel } from "../logic/accessoryRules";
import { loadLookbook, deleteLookbookItem } from "../logic/lookbookStorage";
import { MAX_LOOKBOOK_ITEMS } from "../config";
import { LookbookItem, RuleLevel } from "../types";
import { BookOpen, Home, ArrowLeft, Download, Trash2, Columns2, X } from "lucide-react";

const levelBadgeClass: Record<RuleLevel, string> = {
  hop_truyen_thong: "bg-emerald-50 border-emerald-200 text-emerald-800",
  remix_duoc: "bg-purple-50 border-purple-200 text-purple-800",
  nen_tranh: "bg-orange-50 border-orange-200 text-orange-800",
  chua_co_du_lieu: "bg-stone-100 border-stone-200 text-stone-600",
};

function downloadImage(item: LookbookItem) {
  const a = document.createElement("a");
  a.href = item.imageDataUrl;
  a.download = `viet-phuc-lookbook-${item.outfitId}-${item.createdAt}.jpg`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export const LookbookScreen: React.FC = () => {
  const { goTo, filters } = useApp();
  const [items, setItems] = useState<LookbookItem[]>(() => loadLookbook());
  const [compareMode, setCompareMode] = useState(false);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [showCompare, setShowCompare] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    try {
      deleteLookbookItem(id);
      setItems(loadLookbook());
      setCompareIds((prev) => prev.filter((x) => x !== id));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const toggleCompare = (id: string) => {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 2) return [prev[1], id];
      return [...prev, id];
    });
  };

  const compareItems = items.filter((i) => compareIds.includes(i.id));

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto mb-4">
          <BookOpen className="w-8 h-8" />
        </div>
        <p className="text-sm text-stone-700 mb-6">
          Chưa có bộ phối nào. Hãy thử đồ và lưu lại nhé!
        </p>
        <button
          onClick={() => goTo("home")}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#991B1B] text-white font-semibold hover:bg-red-800 cursor-pointer"
        >
          <Home className="w-4 h-4" />
          <span>Về trang chủ</span>
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <button
            onClick={() => goTo("home")}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-800 mb-3 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Về trang chủ</span>
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-stone-900 font-serif">Lookbook của tôi</h1>
              <p className="text-xs text-stone-500">
                {items.length}/{MAX_LOOKBOOK_ITEMS} bộ · lưu trên trình duyệt của bạn
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {compareMode && (
            <button
              disabled={compareIds.length !== 2}
              onClick={() => setShowCompare(true)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold cursor-pointer ${
                compareIds.length === 2
                  ? "bg-[#991B1B] text-white hover:bg-red-800"
                  : "bg-stone-200 text-stone-400 cursor-not-allowed"
              }`}
            >
              So sánh ({compareIds.length}/2)
            </button>
          )}
          <button
            onClick={() => {
              setCompareMode((v) => !v);
              setCompareIds([]);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-stone-300 text-stone-700 text-sm font-medium hover:bg-stone-50 cursor-pointer"
          >
            <Columns2 className="w-4 h-4" />
            <span>{compareMode ? "Thoát so sánh" : "So sánh"}</span>
          </button>
        </div>
      </div>

      {compareMode && (
        <p className="mb-4 text-xs text-stone-500">Tick chọn đúng 2 bộ rồi bấm "So sánh".</p>
      )}
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800">{error}</div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => {
          const outfit = outfits.find((o) => o.id === item.outfitId);
          const accNames = accessories
            .filter((a) => item.accessoryIds.includes(a.id))
            .map((a) => a.name);
          const checked = compareIds.includes(item.id);
          return (
            <div
              key={item.id}
              className={`bg-[#FFFDF9] border rounded-2xl overflow-hidden ${
                checked ? "border-[#991B1B] ring-2 ring-red-200" : "border-[#E7DECD]"
              }`}
            >
              <div className="relative aspect-3/4 bg-stone-100">
                <img src={item.imageDataUrl} alt={outfit?.name || "Bộ phối"} className="w-full h-full object-cover" />
                {compareMode && (
                  <label className="absolute top-2.5 left-2.5 flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/90 text-xs font-medium cursor-pointer">
                    <input type="checkbox" checked={checked} onChange={() => toggleCompare(item.id)} />
                    <span>Chọn</span>
                  </label>
                )}
                <span className="absolute top-2.5 right-2.5 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-black/60 text-white">
                  Ảnh minh họa AI
                </span>
              </div>
              <div className="p-4 space-y-1.5">
                <h3 className="font-serif font-bold text-stone-900">{outfit?.name || "Bộ đồ không còn trong thư viện"}</h3>
                <p className="text-xs text-stone-600">
                  Phụ kiện: {accNames.length > 0 ? accNames.join(", ") : "không có"}
                </p>
                {item.note && <p className="text-xs text-stone-700 italic">“{item.note}”</p>}
                <p className="text-[11px] text-stone-400">
                  {new Date(item.createdAt).toLocaleString("vi-VN")}
                </p>
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => downloadImage(item)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-stone-300 text-stone-800 text-xs font-semibold hover:bg-stone-50 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Tải về</span>
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-red-200 text-red-700 text-xs font-semibold hover:bg-red-50 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Xóa</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showCompare && compareItems.length === 2 && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowCompare(false)}>
          <div
            className="bg-[#FFFDF9] rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-5 sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold font-serif text-stone-900">So sánh 2 bộ phối</h2>
              <button onClick={() => setShowCompare(false)} className="p-1.5 rounded-lg hover:bg-stone-100 cursor-pointer" aria-label="Đóng">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {compareItems.map((item) => {
                const outfit = outfits.find((o) => o.id === item.outfitId);
                return (
                  <div key={item.id} className="space-y-3">
                    <img src={item.imageDataUrl} alt={outfit?.name || "Bộ phối"} className="w-full aspect-3/4 object-cover rounded-xl" />
                    <h3 className="font-serif font-bold text-stone-900 text-sm sm:text-base">{outfit?.name || "—"}</h3>
                    <dl className="text-xs space-y-2">
                      <div>
                        <dt className="font-semibold text-stone-500">Loại trang phục</dt>
                        <dd className="text-stone-800">{outfit ? garmentTypeLabels[outfit.garmentType] : "—"}</dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-stone-500">Màu</dt>
                        <dd className="text-stone-800">{outfit ? outfit.colors.map((c) => colorLabels[c].label).join(", ") : "—"}</dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-stone-500">Sự kiện hợp</dt>
                        <dd className="text-stone-800">{outfit ? outfit.events.map((e) => eventLabels[e]).join(", ") : "—"}</dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-stone-500 mb-1">Phụ kiện</dt>
                        <dd className="flex flex-wrap gap-1">
                          {item.accessoryIds.length === 0 && <span className="text-stone-500">Không có</span>}
                          {outfit &&
                            accessories
                              .filter((a) => item.accessoryIds.includes(a.id))
                              .map((a) => {
                                const { level } = getAccessoryLevel(outfit.garmentType, a.id, filters.event);
                                return (
                                  <span key={a.id} className={`px-2 py-0.5 rounded-full border text-[11px] ${levelBadgeClass[level]}`}>
                                    {a.name} · {ruleLevelLabels[level]}
                                  </span>
                                );
                              })}
                        </dd>
                      </div>
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
