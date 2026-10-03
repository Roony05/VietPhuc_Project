import React from "react";
import { accessories, accessoryColorFor, accessoryImageOf, slotLabels } from "../data/accessories";
import { presetAdvice } from "../logic/accessoryRules";
import { EventTag, Outfit } from "../types";
import { Ban, Check } from "lucide-react";

const byId = (id: string) => accessories.find((a) => a.id === id)!;

/** Một ô phụ kiện: ảnh + tên + vùng đeo + lý do */
const Item: React.FC<{ id: string; color: Parameters<typeof accessoryImageOf>[1]; reason: string; good: boolean }> = ({
  id,
  color,
  reason,
  good,
}) => {
  const acc = byId(id);
  return (
    <li className={`rounded-2xl border p-3 flex gap-3 ${good ? "border-ngoc/30 bg-ngoc-nhat/40" : "border-son/25 bg-son-nhat/30"}`}>
      <span className={`relative w-20 h-20 shrink-0 rounded-xl p-2 flex items-center justify-center ${good ? "spotlight" : "bg-white/5"}`}>
        <img
          src={accessoryImageOf(acc, color)}
          alt={acc.name}
          loading="lazy"
          className={`max-w-full max-h-full object-contain ${good ? "" : "grayscale-[60%] opacity-70"}`}
        />
        <span
          className={`absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full flex items-center justify-center shadow ${
            good ? "bg-ngoc text-white" : "bg-son text-white"
          }`}
        >
          {good ? <Check className="w-3.5 h-3.5" /> : <Ban className="w-3.5 h-3.5" />}
        </span>
      </span>
      <span className="min-w-0">
        <span className="flex flex-wrap items-baseline gap-x-2">
          <span className="font-semibold text-muc">{acc.name}</span>
          <span className="text-[11px] text-muc-nhat">{slotLabels[acc.slot]}</span>
        </span>
        <span className="block text-sm text-muc-nhat leading-relaxed mt-1">{reason}</span>
      </span>
    </li>
  );
};

/** Gợi ý phụ kiện cho bộ đồ: món nên phối và món không nên phối chung, kèm lý do */
export const AccessoryAdvice: React.FC<{ outfit: Outfit; event: EventTag | null; gender: "nam" | "nu" | null }> = ({
  outfit,
  event,
  gender,
}) => {
  const advice = presetAdvice({ garmentType: outfit.garmentType, gender, event });
  const colorOf = (id: string, fixed?: Parameters<typeof accessoryImageOf>[1]) =>
    fixed ?? accessoryColorFor(byId(id), outfit.colors[0]);

  return (
    <div className="glass border border-white/8 rounded-3xl p-6 sm:p-7 shadow-xl shadow-black/30">
      <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-nghe">
        <span className="w-8 h-px bg-nghe" /> Phụ kiện
      </p>
      <h3 className="text-2xl font-bold text-muc mt-2">Phối gì cho hợp?</h3>
      <p className="text-sm text-muc-nhat leading-relaxed mt-2">{advice.note}</p>

      <div className="grid md:grid-cols-2 gap-6 mt-5">
        <section>
          <h4 className="text-sm font-semibold text-ngoc mb-3">Nên phối</h4>
          {advice.picks.length ? (
            <ul className="space-y-3">
              {advice.picks.map((p) => (
                <Item key={p.id} id={p.id} color={colorOf(p.id, p.color)} reason={p.reason} good />
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muc-nhat">Bộ này đẹp nhất khi để tối giản, không cần thêm phụ kiện.</p>
          )}
        </section>
        <section>
          <h4 className="text-sm font-semibold text-son mb-3">Không nên phối chung</h4>
          {advice.avoid.length ? (
            <ul className="space-y-3">
              {advice.avoid.map((p) => (
                <Item key={p.id} id={p.id} color={colorOf(p.id)} reason={p.reason} good={false} />
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muc-nhat">Các phụ kiện trong thư viện đều hợp với bộ này.</p>
          )}
        </section>
      </div>
    </div>
  );
};
