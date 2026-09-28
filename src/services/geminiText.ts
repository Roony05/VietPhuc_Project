import { TEXT_MODEL } from "../config";
import { RuleLevel } from "../types";

/**
 * Kiểm tra yêu cầu chỉnh sửa của người dùng bằng AI (TEXT_MODEL).
 * Trả về status: "ok" | "warn" | "block" cùng message thông báo thân thiện.
 */
export async function checkUserRequest(params: {
  request: string;
  garmentTypeLabel: string;
  eventLabel: string | null;
  rules: { accessoryName: string; level: RuleLevel; reason: string }[];
}): Promise<{ status: "ok" | "warn" | "block"; message: string }> {
  try {
    const res = await fetch("/api/check-request", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        request: params.request,
        garmentTypeLabel: params.garmentTypeLabel,
        eventLabel: params.eventLabel,
        rules: params.rules,
        model: TEXT_MODEL,
      }),
    });

    if (!res.ok) {
      console.warn("[checkUserRequest] Response status:", res.status);
      return { status: "ok", message: "" };
    }

    const data = await res.json();
    return {
      status: data.status || "ok",
      message: data.message || "",
    };
  } catch (err) {
    console.warn("[checkUserRequest] Lỗi gọi AI text filter:", err);
    // Nếu gọi AI lỗi: trả về status "ok" để không chặn người dùng
    return { status: "ok", message: "" };
  }
}

export interface StylingTips {
  stylingTip: string;
  accessoryTip: string;
  bodyTip: string | null;
}

/**
 * Nhờ AI viết lời khuyên phối đồ cá nhân (qua server /api/styling-tips).
 * Không chứa thông tin lịch sử/văn hóa — phần đó lấy từ data/.
 */
export async function getStylingTips(params: {
  outfitName: string;
  garmentTypeLabel: string;
  eventLabel: string | null;
  styleLabels: string[];
  selectedAccessories: { name: string; levelLabel: string; reason: string }[];
  ageRangeLabel: string | null;
  heightCm: number | null;
  weightKg: number | null;
}): Promise<StylingTips> {
  const res = await fetch("/api/styling-tips", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...params, model: TEXT_MODEL }),
  });

  if (!res.ok) {
    let errorMsg = "Không soạn được lời khuyên.";
    try {
      errorMsg = (await res.json()).error || errorMsg;
    } catch {
      // giữ thông báo mặc định
    }
    throw new Error(errorMsg);
  }

  const data = await res.json();
  return {
    stylingTip: data.stylingTip || "",
    accessoryTip: data.accessoryTip || "",
    bodyTip: data.bodyTip || null,
  };
}
