import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AgeRange } from "../types";
import { FOLK_CHARACTERS } from "../data/folkSayings";
import { FolkAvatar, avatarLabel } from "./FolkAvatar";

const SLOT_SECONDS = 5; // mỗi nhân vật nói 5 giây rồi đổi

/**
 * Màn chờ ghép ảnh: các nhân vật dân gian thay nhau đọc ca dao, tục ngữ, đồng dao.
 * Nhân vật của chính người dùng (theo giới tính, độ tuổi) nói trước, sau đó xáo ngẫu nhiên.
 * Trong 5 giây: nhân vật nhún nhảy, từng dòng hiện dần, thanh tiến trình chạy đầy.
 */
export const LoadingOverlay: React.FC<{ message: string; gender?: string | null; age?: AgeRange | null }> = ({
  message,
  gender,
  age,
}) => {
  const [order] = useState(() => {
    const list = [...FOLK_CHARACTERS];
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }
    const mine = list.findIndex((c) => c.gender === gender && c.age === (age ?? "16_18"));
    if (mine > 0) list.unshift(list.splice(mine, 1)[0]);
    return list;
  });
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const slot = Math.floor(seconds / SLOT_SECONDS);
  const character = order[slot % order.length];
  const saying = character.sayings[Math.floor(slot / order.length) % character.sayings.length];

  // gắn thẳng vào body: tổ tiên có transform/hiệu ứng sẽ làm "fixed" bám theo nó thay vì cả màn hình
  return createPortal(
    <div
      className="fixed inset-0 z-[70] bg-kem/90 backdrop-blur-sm flex items-center justify-center p-6 overflow-y-auto"
      role="status"
      aria-label="Đang ghép ảnh"
    >
      <div className="w-full max-w-sm flex flex-col items-center text-center">
        {/* nhân vật + bong bóng thoại, đổi mỗi 5 giây */}
        <div key={slot} aria-hidden="true" className="w-full flex flex-col items-center animate-rise">
          <FolkAvatar gender={character.gender} age={character.age} className="w-24 h-30 animate-bob drop-shadow-xl" />
          <p className="mt-3 text-xs font-semibold uppercase tracking-[0.25em] text-nghe">{avatarLabel(character.gender, character.age)}</p>
          <figure className="relative mt-4 w-full rounded-2xl border-2 border-[#1F1712] bg-[#F3E4C2] px-5 py-4 text-[#1F1712] shadow-[4px_4px_0_#1F1712]">
            <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-4 h-4 rotate-45 bg-[#F3E4C2] border-l-2 border-t-2 border-[#1F1712]" />
            <blockquote className="font-display italic text-lg leading-snug">
              {saying.lines.map((line, i) => (
                <span key={i} className="block animate-rise" style={{ animationDelay: `${0.3 + i * 0.7}s` }}>
                  {line}
                </span>
              ))}
            </blockquote>
            <figcaption className="mt-2 text-xs text-[#6B5640] animate-rise" style={{ animationDelay: `${0.3 + saying.lines.length * 0.7}s` }}>
              {saying.source}
            </figcaption>
          </figure>
        </div>

        {/* thời gian của câu đang nói */}
        <div className="mt-6 h-1 w-40 rounded-full bg-white/10 overflow-hidden">
          <div key={slot} className="h-full origin-left rounded-full bg-linear-to-r from-son to-nghe animate-fill" />
        </div>

        <p className="mt-6 font-display text-xl font-bold text-muc">
          Đang may đồ cho bạn
          <span className="inline-flex gap-1 ml-1.5" aria-hidden="true">
            {[0, 0.15, 0.3].map((d) => (
              <span key={d} className="w-1.5 h-1.5 rounded-full bg-nghe animate-bounce" style={{ animationDelay: `${d}s` }} />
            ))}
          </span>
        </p>
        <p className="text-sm text-muc-nhat mt-2">{message}</p>
        <p className="text-xs text-muc-nhat/80 mt-2 tabular-nums">Đã chờ {seconds} giây</p>
      </div>
    </div>,
    document.body
  );
};
