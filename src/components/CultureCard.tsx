import React from "react";
import { EventTag, Outfit } from "../types";
import { accessories } from "../data/accessories";
import { getAccessoryLevel } from "../logic/accessoryRules";
import { StylingTips } from "../services/geminiText";
import {
  BookOpen,
  CheckCircle2,
  Sparkles,
  AlertTriangle,
  ShieldAlert,
  Lightbulb,
} from "lucide-react";

interface CultureCardProps {
  outfit: Outfit;
  event: EventTag | null;
  selectedAccessoryIds?: string[];
  aiTips?: StylingTips | null;
  aiTipsLoading?: boolean;
}

export const CultureCard: React.FC<CultureCardProps> = ({
  outfit,
  event,
  selectedAccessoryIds = [],
  aiTips,
  aiTipsLoading = false,
}) => {
  // Lọc toàn bộ phụ kiện cùng giới tính (hoặc unisex) để đánh giá quy tắc
  const relevantAccessories = accessories.filter(
    (acc) => acc.gender === "unisex" || acc.gender === outfit.gender
  );

  // Phân loại phụ kiện theo getAccessoryLevel (dữ liệu 100% từ code/data, không dùng AI)
  const hopTruyenThongList: { name: string; reason: string }[] = [];
  const remixDuocList: { name: string; reason: string }[] = [];
  const nenTranhList: { name: string; reason: string }[] = [];

  relevantAccessories.forEach((acc) => {
    const { level, reason } = getAccessoryLevel(outfit.garmentType, acc.id, event);
    if (level === "hop_truyen_thong") {
      hopTruyenThongList.push({ name: acc.name, reason });
    } else if (level === "remix_duoc") {
      remixDuocList.push({ name: acc.name, reason });
    } else if (level === "nen_tranh") {
      nenTranhList.push({ name: acc.name, reason });
    }
  });

  const meaningText =
    outfit.meaning && outfit.meaning !== "CẦN BỔ SUNG"
      ? outfit.meaning
      : "Thông tin đang được đội cập nhật.";

  const hasMeaningSource =
    Boolean(outfit.meaningSource) && outfit.meaningSource !== "CẦN BỔ SUNG";

  return (
    <div className="bg-[#FFFDF9] border border-[#E7DECD] rounded-2xl p-5 sm:p-6 space-y-6 shadow-xs">
      {/* Tiêu đề Thẻ văn hóa */}
      <div className="flex items-center justify-between border-b border-[#E7DECD] pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-red-100 text-[#991B1B] flex items-center justify-center shrink-0">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-stone-900 font-serif">
              Thẻ văn hóa &amp; Quy ước phối đồ
            </h3>
            <p className="text-[11px] text-stone-500">
              Kiến thức trang phục truyền thống &amp; gợi ý phối đúng tinh thần
            </p>
          </div>
        </div>

        {/* Nhãn kiểm duyệt văn hóa */}
        {!outfit.verified && (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full shrink-0">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
            <span>Chưa được kiểm duyệt</span>
          </span>
        )}
      </div>

      {/* 1. Ý NGHĨA TRANG PHỤC */}
      <div>
        <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-2">
          Ý nghĩa trang phục
        </h4>
        <div className="p-3.5 rounded-xl bg-stone-50/70 border border-stone-200/80 text-stone-700 text-xs sm:text-sm leading-relaxed">
          <p>{meaningText}</p>
          {hasMeaningSource && (
            <p className="text-[11px] text-stone-400 mt-2 italic">
              Nguồn tham khảo: {outfit.meaningSource}
            </p>
          )}
        </div>
      </div>

      {/* 2. GỢI Ý PHỤ KIỆN: PHỤ KIỆN NÊN DÙNG, CÓ THỂ REMIX, NÊN TRÁNH */}
      <div className="space-y-4">
        <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
          Quy ước phụ kiện cho dáng áo này
        </h4>

        {/* Phụ kiện nên dùng (Hợp truyền thống) */}
        <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200">
          <div className="flex items-center gap-2 mb-2 text-emerald-900 text-xs font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Phụ kiện nên dùng (Hợp truyền thống):</span>
          </div>
          {hopTruyenThongList.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {hopTruyenThongList.map((item, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-white border border-emerald-200 text-emerald-900 text-xs font-medium shadow-2xs"
                >
                  {item.name}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-stone-500 italic">Chưa có phụ kiện chỉ định.</p>
          )}
        </div>

        {/* Có thể remix */}
        <div className="p-3 rounded-xl bg-purple-50/60 border border-purple-200">
          <div className="flex items-center gap-2 mb-2 text-purple-900 text-xs font-bold">
            <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
            <span>Có thể remix (Phong cách hiện đại):</span>
          </div>
          {remixDuocList.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {remixDuocList.map((item, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-white border border-purple-200 text-purple-900 text-xs font-medium shadow-2xs"
                >
                  {item.name}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-stone-500 italic">Chưa có gợi ý remix riêng.</p>
          )}
        </div>

        {/* Nên tránh trong dịp này */}
        <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200">
          <div className="flex items-center gap-2 mb-2 text-amber-950 text-xs font-bold">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Nên tránh trong dịp này:</span>
          </div>
          {nenTranhList.length > 0 ? (
            <ul className="space-y-1.5">
              {nenTranhList.map((item, idx) => (
                <li
                  key={idx}
                  className="text-xs text-amber-900 flex items-start gap-1.5"
                >
                  <span className="font-semibold text-amber-950 shrink-0">
                    • {item.name}:
                  </span>
                  <span>{item.reason}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-emerald-800">
              Không có phụ kiện nào bị đánh giá kiêng kỵ trong bối cảnh này.
            </p>
          )}
        </div>
      </div>

      {/* 3. LỜI KHUYÊN CHO BẠN (AI) */}
      {(aiTipsLoading || aiTips) && (
        <div className="pt-2 border-t border-[#E7DECD]">
          <div className="p-3.5 rounded-xl bg-red-50/40 border border-red-200">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 text-xs font-bold text-[#991B1B]">
                <Lightbulb className="w-4 h-4 text-[#991B1B]" />
                <span>Lời khuyên cho bạn</span>
              </div>
              <span className="text-[10px] font-medium text-stone-500 bg-white border border-stone-200 px-2 py-0.5 rounded-full">
                Gợi ý bởi AI
              </span>
            </div>
            {aiTipsLoading ? (
              <p className="text-xs text-stone-500 italic">Đang soạn lời khuyên...</p>
            ) : (
              aiTips && (
                <ul className="space-y-1.5 text-xs text-stone-700 leading-relaxed">
                  {aiTips.stylingTip && (
                    <li>
                      <strong>Phối đồ:</strong> {aiTips.stylingTip}
                    </li>
                  )}
                  {aiTips.accessoryTip && (
                    <li>
                      <strong>Phụ kiện:</strong> {aiTips.accessoryTip}
                    </li>
                  )}
                  {aiTips.bodyTip && (
                    <li>
                      <strong>Vóc dáng:</strong> {aiTips.bodyTip}
                    </li>
                  )}
                </ul>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
};
