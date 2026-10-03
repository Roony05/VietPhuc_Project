import React from "react";
import { useApp } from "../state/AppContext";
import { ROUTES } from "../logic/routes";
import { Screen } from "../types";
import { BookHeart, Home, LogIn, Shirt, SlidersHorizontal, Wand2 } from "lucide-react";

/** Các mục điều hướng chính; match = những màn được tính là đang ở mục đó */
const NAV: { screen: Screen; label: string; icon: React.FC<{ className?: string }>; match: Screen[] }[] = [
  { screen: "home", label: "Trang chủ", icon: Home, match: ["home"] },
  { screen: "filter", label: "Chọn gu", icon: SlidersHorizontal, match: ["filter", "recommend"] },
  { screen: "gallery", label: "Thư viện", icon: Shirt, match: ["gallery"] },
  { screen: "studio", label: "Thử đồ", icon: Wand2, match: ["studio", "result", "finish"] },
  { screen: "lookbook", label: "Lookbook", icon: BookHeart, match: ["lookbook"] },
];

/** Nút tài khoản: chưa đăng nhập thì mời đăng nhập, rồi thì hiện chữ cái đầu + hồ sơ đang chọn */
const AccountButton: React.FC = () => {
  const { account, activeProfile, screen, goTo } = useApp();
  const active = screen === "profile";
  if (!account) {
    return (
      <button
        onClick={() => goTo("profile")}
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-colors cursor-pointer shrink-0 ${
          active ? "bg-nghe text-[#1a120c]" : "glass border border-white/10 text-muc hover:border-nghe/60 hover:text-nghe"
        }`}
      >
        <LogIn className="w-4 h-4" /> Đăng nhập
      </button>
    );
  }
  return (
    <button
      onClick={() => goTo("profile")}
      title="Tài khoản và hồ sơ người mặc"
      className={`inline-flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-full text-sm transition-colors cursor-pointer border shrink-0 ${
        active ? "border-nghe bg-nghe-nhat" : "border-white/10 glass hover:border-nghe/60"
      }`}
    >
      <span className="w-7 h-7 rounded-full bg-gradient-to-br from-son to-nghe text-white font-bold flex items-center justify-center">
        {account.name.charAt(0).toUpperCase() || "?"}
      </span>
      <span className="text-left leading-tight">
        <span className="block text-[10px] text-muc-nhat">Chọn đồ cho</span>
        <span className="block font-semibold text-muc max-w-24 truncate">{activeProfile?.name ?? "Chưa chọn"}</span>
      </span>
    </button>
  );
};

export const Header: React.FC = () => {
  const { screen, goTo } = useApp();

  return (
    <>
      <header className="sticky top-0 z-40 bg-kem/70 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <a href={ROUTES.home} className="flex items-center gap-2.5 shrink-0" title="Về trang chủ">
            <LotusMark className="w-8 h-8" />
            <span className="font-display font-bold text-lg text-muc">Việt Phục Remix</span>
          </a>

          {/* điều hướng chính trên màn rộng */}
          <nav aria-label="Điều hướng chính" className="hidden md:flex items-center gap-1">
            {NAV.map((item) => {
              const active = item.match.includes(screen);
              return (
                <a
                  key={item.screen}
                  href={ROUTES[item.screen]}
                  onClick={(e) => {
                    e.preventDefault();
                    goTo(item.screen);
                  }}
                  aria-current={active ? "page" : undefined}
                  className={`relative px-3.5 py-2 rounded-full text-sm font-medium transition-colors ${
                    active ? "text-nghe" : "text-muc-nhat hover:text-muc hover:bg-white/5"
                  }`}
                >
                  {item.label}
                  {active && <span className="absolute left-3.5 right-3.5 -bottom-0.5 h-0.5 rounded-full bg-nghe" />}
                </a>
              );
            })}
          </nav>

          <AccountButton />
        </div>
      </header>

      {/* thanh tab dưới đáy trên điện thoại */}
      <nav
        aria-label="Điều hướng chính"
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-kem/90 backdrop-blur-xl border-t border-white/10 pb-[env(safe-area-inset-bottom)]"
      >
        <ul className="grid grid-cols-5">
          {NAV.map((item) => {
            const active = item.match.includes(screen);
            return (
              <li key={item.screen}>
                <button
                  onClick={() => goTo(item.screen)}
                  aria-current={active ? "page" : undefined}
                  className={`w-full h-16 flex flex-col items-center justify-center gap-1 text-[11px] font-medium cursor-pointer ${
                    active ? "text-nghe" : "text-muc-nhat"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
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
