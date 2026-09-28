import React from "react";
import { Sparkles, Loader2 } from "lucide-react";

interface LoadingOverlayProps {
  message?: string;
  subMessage?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  message = "Đang xử lý...",
  subMessage = "Vui lòng đợi trong giây lát, hệ thống đang làm việc.",
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4">
      <div className="bg-[#FFFDF9] border border-[#E8DEC8] p-6 rounded-2xl max-w-sm w-full text-center shadow-2xl flex flex-col items-center">
        <div className="relative w-14 h-14 mb-4">
          <div className="absolute inset-0 rounded-full border-4 border-amber-200 animate-ping opacity-30" />
          <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center text-red-700 shadow-sm border border-red-100">
            <Loader2 className="w-7 h-7 animate-spin text-[#991B1B]" />
          </div>
        </div>
        <h3 className="text-base font-bold text-stone-900 flex items-center justify-center gap-1.5">
          <span>{message}</span>
          <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
        </h3>
        <p className="text-xs text-stone-500 mt-2 leading-relaxed">{subMessage}</p>
      </div>
    </div>
  );
};
