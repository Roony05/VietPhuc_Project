import React from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

/** 5 bước của luồng thử đồ */
export const FLOW_STEPS = ["Chọn gu", "Chọn bộ", "Thử đồ", "Kết quả", "Hoàn tất"] as const;

interface FlowAction {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  icon?: React.ReactNode; // mặc định mũi tên sang phải
}

/**
 * Thanh phụ của luồng thử đồ, dính ngay dưới thanh điều hướng chính và trải hết chiều ngang:
 * trái "Quay lại", giữa các bước, phải nút chính; dưới cùng là vạch tiến trình.
 * Đặt NGOÀI khung nội dung của trang (để trải hết chiều ngang).
 */
export const FlowHeader: React.FC<{ current: number; back?: () => void; next?: FlowAction }> = ({ current, back, next }) => (
  <div className="sticky top-16 z-30 bg-kem/80 backdrop-blur-xl border-b border-white/5">
    <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-3">
      {/* trái: quay lại */}
      <div className="flex-1 basis-0 min-w-0">
        {back && (
          <button
            type="button"
            onClick={back}
            className="inline-flex items-center gap-1.5 -ml-2 px-2 py-1.5 rounded-full text-sm font-medium text-muc-nhat hover:text-muc hover:bg-white/5 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Quay lại
          </button>
        )}
      </div>

      {/* giữa: các bước */}
      <nav aria-label="Các bước thử đồ" className="shrink-0">
        <ol className="hidden md:flex items-center gap-1.5 text-xs">
          {FLOW_STEPS.map((label, i) => {
            const done = i < current;
            const active = i === current;
            return (
              <li key={label} className="flex items-center gap-1.5">
                {i > 0 && <span className={`w-4 lg:w-7 h-px ${done || active ? "bg-son/70" : "bg-vien"}`} />}
                <span
                  aria-current={active ? "step" : undefined}
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    active ? "bg-son text-white" : done ? "bg-son-nhat text-son" : "bg-vien text-muc-nhat"
                  }`}
                >
                  {done ? <Check className="w-3 h-3" /> : i + 1}
                </span>
                <span className={active ? "font-semibold text-muc" : "hidden lg:inline text-muc-nhat"}>{label}</span>
              </li>
            );
          })}
        </ol>
        <p className="md:hidden text-xs text-muc-nhat whitespace-nowrap">
          Bước {current + 1}/{FLOW_STEPS.length} · <span className="font-semibold text-muc">{FLOW_STEPS[current]}</span>
        </p>
      </nav>

      {/* phải: nút chính */}
      <div className="flex-1 basis-0 min-w-0 flex justify-end">
        {next && (
          <button
            type="button"
            onClick={next.onClick}
            disabled={next.disabled}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-son to-son-dam shadow-md shadow-son/30 hover:shadow-son/50 transition-shadow cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {next.label} {next.icon ?? <ArrowRight className="w-4 h-4" />}
          </button>
        )}
      </div>
    </div>
    {/* vạch tiến trình */}
    <div className="h-0.5 bg-white/5">
      <div
        className="h-full bg-gradient-to-r from-son to-nghe transition-[width] duration-500"
        style={{ width: `${((current + 1) / FLOW_STEPS.length) * 100}%` }}
      />
    </div>
  </div>
);
