import React from "react";
import { LotusMark } from "./Header";

export const LoadingOverlay: React.FC<{ message: string }> = ({ message }) => (
  <div className="fixed inset-0 z-50 bg-kem/85 backdrop-blur-sm flex items-center justify-center p-6" role="status">
    <div className="flex flex-col items-center text-center gap-4 max-w-xs">
      <LotusMark className="w-14 h-14 animate-spin [animation-duration:2.5s]" />
      <p className="font-display text-xl font-bold text-muc">Đang may đồ cho bạn…</p>
      <p className="text-sm text-muc-nhat">{message}</p>
    </div>
  </div>
);
