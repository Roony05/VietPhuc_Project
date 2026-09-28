import React from "react";
import { useApp } from "../state/AppContext";
import { Screen } from "../types";
import { BookHeart, Check } from "lucide-react";

const steps: { label: string; screens: Screen[] }[] = [
  { label: "Chọn gu", screens: ["filter"] },
  { label: "Chọn bộ", screens: ["recommend", "gallery"] },
  { label: "Thử đồ", screens: ["studio"] },
];

export const Header: React.FC = () => {
  const { screen, goTo } = useApp();
  const currentStep = steps.findIndex((s) => s.screens.includes(screen));

  return (
    <header className="sticky top-0 z-40 bg-kem/60 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <button onClick={() => goTo("home")} className="flex items-center gap-2.5 cursor-pointer" title="Về trang chủ">
          <LotusMark className="w-8 h-8" />
          <span className="font-display font-bold text-lg text-muc">Việt Phục Remix</span>
        </button>

        {/* Thanh bước: chỉ hiện khi đang trong luồng thử đồ */}
        {currentStep >= 0 && (
          <ol className="hidden md:flex items-center gap-2 text-sm">
            {steps.map((step, i) => {
              const done = i < currentStep;
              const active = i === currentStep;
              return (
                <li key={step.label} className="flex items-center gap-2">
                  {i > 0 && <span className={`w-8 h-px ${done || active ? "bg-son" : "bg-vien"}`} />}
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      active ? "bg-son text-white" : done ? "bg-son-nhat text-son" : "bg-vien text-muc-nhat"
                    }`}
                  >
                    {done ? <Check className="w-3.5 h-3.5" /> : i + 1}
                  </span>
                  <span className={active ? "font-semibold text-muc" : "text-muc-nhat"}>{step.label}</span>
                </li>
              );
            })}
          </ol>
        )}

        <button
          onClick={() => goTo("lookbook")}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-colors cursor-pointer ${
            screen === "lookbook" ? "bg-nghe text-[#1a120c] shadow-lg shadow-nghe/30" : "glass border border-white/10 text-muc hover:border-nghe/60 hover:text-nghe"
          }`}
        >
          <BookHeart className="w-4 h-4" />
          <span>Lookbook</span>
        </button>
      </div>
    </header>
  );
};

/** Biểu tượng hoa sen đơn giản làm logo */
export const LotusMark: React.FC<{ className?: string }> = ({ className = "" }) => (
  <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
    <circle cx="16" cy="16" r="16" fill="var(--color-son)" />
    <path d="M16 8c-2.2 2.6-3.2 5.3-3.2 8s1 5 3.2 7c2.2-2 3.2-4.3 3.2-7s-1-5.4-3.2-8z" fill="#fff8ee" />
    <path d="M9 13c.2 3.6 1.6 6.6 5.2 9.2-1.3-2.1-1.9-4.1-1.9-6.2 0-.8.1-1.6.3-2.3C11.4 13.1 10.2 12.9 9 13z" fill="var(--color-nghe)" />
    <path d="M23 13c-.2 3.6-1.6 6.6-5.2 9.2 1.3-2.1 1.9-4.1 1.9-6.2 0-.8-.1-1.6-.3-2.3 1.2-.6 2.4-.8 3.6-.7z" fill="var(--color-nghe)" />
  </svg>
);
