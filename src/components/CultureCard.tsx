import React from "react";
import { AgeRange, Outfit } from "../types";
import { PersonalityTip } from "../services/geminiText";
import { FolkAvatar } from "./FolkAvatar";
import { ExternalLink, Sparkles } from "lucide-react";
import { GARMENT_HISTORY } from "../data/history";
import { garmentTypeLabels } from "../data/labels";

interface CultureCardProps {
  outfit: Outfit;
}

/** "Có thể bạn chưa biết": lịch sử kiểu áo (đã đối chiếu nguồn chính thống) */
export const CultureCard: React.FC<CultureCardProps> = ({ outfit }) => {
  const history = GARMENT_HISTORY[outfit.garmentType];

  return (
    <div className="glass border border-white/8 rounded-3xl p-6 sm:p-7 shadow-xl shadow-black/30">
      <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-nghe">
        <span className="w-8 h-px bg-nghe" /> {garmentTypeLabels[outfit.garmentType]}
      </p>
      <h3 className="text-2xl font-bold text-muc mt-2">Có thể bạn chưa biết</h3>

      <ol className="mt-5 space-y-4">
        {history.facts.map((fact, i) => (
          <li key={i} className="flex gap-4">
            <span className="font-display text-2xl font-bold text-gold leading-none w-7 shrink-0">{i + 1}</span>
            <p className="text-[15px] leading-relaxed text-muc/90">{fact}</p>
          </li>
        ))}
      </ol>

      {/* dòng thời gian */}
      <div className="mt-6 overflow-x-auto -mx-1 px-1">
        <ol className="flex min-w-max">
          {history.timeline.map((t, i) => (
            <li key={t.when} className="relative w-44 pr-4">
              <span className="block h-px bg-nghe/40 absolute left-0 right-0 top-[7px]" style={{ left: i === 0 ? 7 : 0 }} />
              <span className="relative block w-3.5 h-3.5 rounded-full bg-nghe ring-4 ring-nghe/20" />
              <p className="font-display font-bold text-nghe mt-3">{t.when}</p>
              <p className="text-xs text-muc-nhat leading-relaxed mt-1">{t.what}</p>
            </li>
          ))}
        </ol>
      </div>

      <div className="mt-5 pt-4 border-t border-white/5">
        <p className="text-[11px] uppercase tracking-[0.2em] text-muc-nhat mb-2">Nguồn tham khảo</p>
        <ul className="space-y-1.5">
          {history.sources.map((s) => (
            <li key={s.url}>
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-start gap-1.5 text-xs text-muc-nhat hover:text-nghe"
              >
                <ExternalLink className="w-3.5 h-3.5 mt-px shrink-0" />
                <span>
                  <span className="font-semibold text-muc/80">{s.label}</span> · {s.title}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>

    </div>
  );
};

/** "Phong thái khi diện bộ này": danh xưng + lời khen vui (Gemini, có câu dự phòng) */
export const PersonalityCard: React.FC<{
  tip: PersonalityTip | null;
  loading: boolean;
  gender?: "nam" | "nu" | null;
  age?: AgeRange | null;
}> = ({ tip, loading, gender, age }) => {
  if (!loading && !tip) return null;
  return (
    <section className="rounded-3xl p-px bg-linear-to-br from-nghe/50 via-white/5 to-son/50 shadow-xl shadow-black/30">
      <div className="rounded-3xl bg-[#1a120d] p-6 sm:p-7">
        <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-nghe">
          <span className="w-8 h-px bg-nghe" /> Dành riêng cho bạn
        </p>
        <h3 className="flex items-center gap-2 text-xl sm:text-2xl font-bold text-muc mt-2">
          <Sparkles className="w-5 h-5 text-nghe shrink-0" /> Phong thái khi diện bộ này
        </h3>
        {loading ? (
          <p className="text-sm text-muc-nhat mt-4 animate-pulse">Đang ngắm bạn trong bộ áo này…</p>
        ) : (
          tip && (
            <div className="flex gap-4 items-start mt-4">
              {gender && (
                <div className="shrink-0 w-20 h-25 drop-shadow-lg">
                  <FolkAvatar gender={gender} age={age ?? null} className="w-full h-full" />
                </div>
              )}
              <div className="min-w-0">
                <p className="font-display text-2xl font-bold italic text-gold">{tip.title}</p>
                <p className="text-sm text-muc/90 leading-relaxed mt-1.5">{tip.message}</p>
              </div>
            </div>
          )
        )}
      </div>
    </section>
  );
};
