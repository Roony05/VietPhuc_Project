import React from "react";
import { AgeRange, Outfit } from "../types";
import { PersonalityTip } from "../services/geminiText";
import { StudentAvatar } from "./StudentAvatar";
import { Sparkles } from "lucide-react";

interface CultureCardProps {
  outfit: Outfit;
  aiTips?: PersonalityTip | null;
  aiTipsLoading?: boolean;
  avatarGender?: "nam" | "nu" | null;
  avatarAge?: AgeRange | null;
}

/** Thẻ văn hóa: ý nghĩa lấy từ dữ liệu của đội; "bí mật tính cách" vui do Gemini viết */
export const CultureCard: React.FC<CultureCardProps> = ({
  outfit,
  aiTips,
  aiTipsLoading = false,
  avatarGender,
  avatarAge,
}) => {
  const hasMeaning = outfit.meaning && outfit.meaning !== "CẦN BỔ SUNG";
  const hasSource = outfit.meaningSource && outfit.meaningSource !== "CẦN BỔ SUNG";

  return (
    <div className="glass border border-white/8 rounded-3xl p-6 sm:p-7 shadow-xl shadow-black/30">
      <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-nghe">
        <span className="w-8 h-px bg-nghe" /> Thẻ văn hóa
      </p>
      <h3 className="text-2xl font-bold text-muc mt-2">Câu chuyện tà áo</h3>

      <blockquote className="mt-4 pl-4 border-l-2 border-nghe/60 text-[15px] leading-relaxed text-muc/90">
        {hasMeaning ? outfit.meaning : "Thông tin đang được đội cập nhật."}
      </blockquote>
      {hasSource && <p className="text-xs text-muc-nhat italic mt-2 pl-4">Nguồn: {outfit.meaningSource}</p>}

      {(aiTipsLoading || aiTips) && (
        <section className="relative mt-6 rounded-2xl p-px bg-linear-to-br from-nghe/50 via-white/5 to-son/50">
          <div className="rounded-2xl bg-[#1a120d] p-5">
            <h4 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-muc-nhat">
              <Sparkles className="w-4 h-4 text-nghe" />
              Bí mật tính cách của bạn
            </h4>
            {aiTipsLoading ? (
              <p className="text-sm text-muc-nhat mt-3 animate-pulse">Đang đoán bí mật tính cách của bạn…</p>
            ) : (
              aiTips && (
                <div className="flex gap-4 items-start mt-3">
                  {avatarGender && (
                    <div className="shrink-0 w-20 h-24 rounded-2xl bg-[radial-gradient(circle_at_50%_40%,rgba(233,180,76,0.28),transparent_70%)]">
                      <StudentAvatar gender={avatarGender} age={avatarAge ?? null} className="w-full h-full" />
                    </div>
                  )}
                  <div>
                    <p className="font-display text-2xl font-bold italic text-gold">{aiTips.title}</p>
                    <p className="text-sm text-muc/90 leading-relaxed mt-1.5">{aiTips.message}</p>
                  </div>
                </div>
              )
            )}
          </div>
        </section>
      )}
    </div>
  );
};
