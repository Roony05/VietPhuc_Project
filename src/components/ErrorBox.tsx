import React from "react";
import { AlertCircle, RotateCcw } from "lucide-react";

interface ErrorBoxProps {
  message: string;
  onRetry?: () => void;
  title?: string;
}

export const ErrorBox: React.FC<ErrorBoxProps> = ({
  message,
  onRetry,
  title = "Có lỗi xảy ra",
}) => {
  return (
    <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 my-4 shadow-xs">
      <div className="flex items-start gap-3">
        <div className="p-1 rounded-full bg-red-100 text-red-600 shrink-0 mt-0.5">
          <AlertCircle className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-red-900">{title}</h4>
          <p className="text-xs text-red-700 mt-1 leading-relaxed">{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-medium hover:bg-red-700 transition-colors shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Thử lại</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
