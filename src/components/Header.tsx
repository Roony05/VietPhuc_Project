import React from "react";
import { useApp } from "../state/AppContext";
import { Sparkles, BookOpen, Home, RefreshCw } from "lucide-react";

export const Header: React.FC = () => {
  const { screen, goTo, resetSession } = useApp();

  return (
    <header className="sticky top-0 z-40 w-full bg-[#FCFBF7]/90 backdrop-blur-md border-b border-[#E8DEC8]">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo / Brand */}
        <button
          onClick={() => goTo("home")}
          className="flex items-center gap-2.5 text-left group focus:outline-hidden"
          title="Về trang chủ"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#991B1B] to-[#DC2626] flex items-center justify-center text-amber-200 shadow-md shadow-red-900/10 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg text-stone-900 tracking-tight font-serif">
                Việt Phục Remix
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-sm bg-red-100 text-red-800">
                Gen Z
              </span>
            </div>
            <p className="text-[11px] text-stone-500 font-medium hidden sm:block">
              Phối cổ phục &amp; thử đồ AI thông minh
            </p>
          </div>
        </button>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {screen !== "home" && (
            <button
              onClick={() => goTo("home")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-stone-700 hover:text-stone-900 hover:bg-stone-100 transition-colors"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Trang chủ</span>
            </button>
          )}

          <button
            onClick={() => goTo("lookbook")}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              screen === "lookbook"
                ? "bg-[#991B1B] text-white shadow-sm"
                : "bg-[#F3ECE1] text-stone-800 hover:bg-[#EAE0D1]"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-500" />
            <span>Lookbook</span>
          </button>

          {screen !== "home" && (
            <button
              onClick={resetSession}
              title="Làm mới phiên làm việc"
              className="p-1.5 text-stone-400 hover:text-stone-600 rounded-lg hover:bg-stone-100 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
