import { EventTag, StyleTag } from "../types";

export interface LookSuggestion {
  lookId: string;
  reason: string;
  source: "gemini" | "local";
}

/** Nhờ Gemini chọn 1 lookbook mẫu hợp gu (qua server /api/suggest-look). Chỉ gửi chữ, nhận chữ. */
export async function suggestLook(params: {
  gender: "nam" | "nu" | null;
  event: EventTag | null;
  styles: StyleTag[];
  ageRangeLabel: string | null;
  freeText: string;
}): Promise<LookSuggestion> {
  const res = await fetch("/api/suggest-look", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error("Chưa gợi ý được, bạn thử lại nhé.");
  return res.json();
}

export interface PersonalityTip {
  title: string; // danh xưng, ví dụ "Lãng tử thư sinh"
  message: string;
  source: "gemini" | "local"; // local = câu soạn sẵn khi Gemini quá tải
}

/**
 * Nhờ Gemini "đoán" bí mật tính cách vui nhộn từ bộ lọc + bộ đồ đã chọn (qua server /api/personality).
 * Server luôn trả về nội dung; chỉ lỗi khi mất kết nối.
 */
export async function getPersonality(params: {
  gender: "nam" | "nu" | null;
  garmentType: string;
  garmentLabel: string;
  colorLabel: string | null;
  eventLabel: string | null;
  styleLabels: string[];
  ageRangeLabel: string | null;
  heightCm: number | null;
  weightKg: number | null;
}): Promise<PersonalityTip> {
  const res = await fetch("/api/personality", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error("Không soạn được bí mật tính cách.");
  return res.json();
}
