import React from "react";
import { motion } from "motion/react";

/** Các khối giao diện dùng chung, để mọi màn hình trông cùng một bộ */

type ButtonVariant = "primary" | "secondary" | "ghost" | "jade";

const buttonStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-gradient-to-r from-son to-son-dam text-white shadow-lg shadow-son/30 hover:shadow-son/50 hover:-translate-y-0.5 disabled:from-vien disabled:to-vien disabled:text-muc-nhat disabled:shadow-none disabled:translate-y-0",
  secondary: "glass text-muc border border-white/10 hover:border-nghe/60 hover:text-nghe disabled:opacity-50",
  ghost: "text-muc-nhat hover:text-muc hover:bg-white/5 disabled:opacity-50",
  jade: "bg-ngoc text-white hover:brightness-110 shadow-lg shadow-ngoc/25 disabled:opacity-50",
};

export const Button: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; size?: "md" | "lg" }
> = ({ variant = "primary", size = "md", className = "", ...props }) => (
  <button
    type="button"
    className={`inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-300 cursor-pointer disabled:cursor-not-allowed ${
      size === "lg" ? "px-7 py-3.5 text-base" : "px-5 py-2.5 text-sm"
    } ${buttonStyles[variant]} ${className}`}
    {...props}
  />
);

export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = "", ...props }) => (
  <div className={`glass border border-white/8 rounded-3xl shadow-xl shadow-black/30 ${className}`} {...props} />
);

/** Nút chọn dạng viên thuốc, dùng cho bộ lọc */
export const Chip: React.FC<{
  selected?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}> = ({ selected = false, onClick, children, className = "" }) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={selected}
    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 cursor-pointer ${
      selected
        ? "bg-son text-white border-son shadow-md shadow-son/30"
        : "bg-white/[0.03] text-muc border-white/10 hover:border-nghe/50 hover:text-nghe"
    } ${className}`}
  >
    {children}
  </button>
);

/** Tiêu đề màn hình: dòng nhỏ phía trên + tiêu đề lớn + mô tả, hiện dần khi vào màn */
export const PageTitle: React.FC<{ eyebrow?: string; title: string; description?: string; action?: React.ReactNode }> = ({
  eyebrow,
  title,
  description,
  action,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10"
  >
    <div>
      {eyebrow && (
        <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.25em] text-nghe mb-3">
          <span className="w-8 h-px bg-nghe" />
          {eyebrow}
        </p>
      )}
      <h1 className="text-4xl sm:text-5xl font-bold text-muc leading-tight">{title}</h1>
      {description && <p className="text-muc-nhat mt-3 max-w-2xl text-lg">{description}</p>}
    </div>
    {action}
  </motion.div>
);

/** Nhãn nhỏ trên ảnh */
export const Tag: React.FC<{ children: React.ReactNode; tone?: "dark" | "light" }> = ({ children, tone = "dark" }) => (
  <span
    className={`text-[11px] font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm ${
      tone === "dark" ? "bg-black/60 text-white" : "bg-white/90 text-[#2b2118]"
    }`}
  >
    {children}
  </span>
);

/** Hiện dần + trượt lên khi cuộn tới (dùng cho lưới thẻ) */
export const Reveal: React.FC<{ children: React.ReactNode; delay?: number; className?: string }> = ({
  children,
  delay = 0,
  className = "",
}) => (
  <motion.div
    initial={{ opacity: 0, y: 28 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-40px" }}
    transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    className={className}
  >
    {children}
  </motion.div>
);
