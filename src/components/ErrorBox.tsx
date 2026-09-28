import React from "react";
import { AlertCircle, RotateCcw } from "lucide-react";

export const ErrorBox: React.FC<{ message: string; onRetry?: () => void }> = ({ message, onRetry }) => (
  <div className="flex items-start gap-3 p-4 rounded-2xl bg-son-nhat border border-son/20 text-sm" role="alert">
    <AlertCircle className="w-5 h-5 text-son shrink-0 mt-0.5" />
    <div className="flex-1">
      <p className="font-semibold text-son-dam">Chưa ghép được ảnh</p>
      <p className="text-muc mt-0.5">{message}</p>
    </div>
    {onRetry && (
      <button
        onClick={onRetry}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-son hover:text-son-dam cursor-pointer shrink-0"
      >
        <RotateCcw className="w-4 h-4" />
        Thử lại
      </button>
    )}
  </div>
);
